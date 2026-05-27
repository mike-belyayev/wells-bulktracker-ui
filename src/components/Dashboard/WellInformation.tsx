// src/components/Dashboard/WellInformation.tsx
import { Paper, Typography, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { Edit, Save, Cancel, Add, Delete, ArrowUpward, ArrowDownward, Warning } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import './WellInformation.css';

export interface WellInformationProps {
    wellData?: {
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        HPWH?: number;
        casingProfiles?: CasingProfile[];
    };
    wellId?: string;
    onUpdate?: (data: any) => Promise<void>;
    onCasingUpdate?: (data: CasingProfile[]) => Promise<void>;
    onDelete?: () => Promise<void>;
    onRefresh?: () => Promise<void>;
    readOnly?: boolean;
}

export interface CasingProfile {
    index: number;
    size: string;
    description?: string;
    type: 'casing' | 'liner';
    depth: number;
    startDepth?: number;
    id?: string;
}

const WellInformation = ({ wellData, wellId, onUpdate, onCasingUpdate, onDelete, onRefresh, readOnly = false }: WellInformationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(500);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [casingDialogOpen, setCasingDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingCasingIndex, setEditingCasingIndex] = useState<number | null>(null);
    const [editingCasingData, setEditingCasingData] = useState<Partial<CasingProfile>>({});
    const [newCasing, setNewCasing] = useState<Partial<CasingProfile>>({ size: '', type: 'casing', depth: 0, description: '' });
    
    const [editData, setEditData] = useState({
        wellName: '',
        waterDepth: 0,
        airGap: 0,
        HPWH: 0
    });

    // Default mock data
    const defaultWellData = {
        wellName: "WELL B-07",
        waterDepth: 1245,
        airGap: 28,
        HPWH: 350,
        casingProfiles: [
            { index: 0, size: "36\"", type: "casing" as const, depth: 120, description: "Conductor" },
            { index: 1, size: "28\"", type: "casing" as const, depth: 450, description: "Surface" },
            { index: 2, size: "22\"", type: "casing" as const, depth: 850, description: "Intermediate" },
            { index: 3, size: "16\"", type: "casing" as const, depth: 1250, description: "Intermediate" },
            { index: 4, size: "7\"", type: "liner" as const, depth: 1890, startDepth: 1250, description: "Production Liner" }
        ]
    };

    const data = wellData || defaultWellData;
    let casingProfiles: CasingProfile[] = (data.casingProfiles || defaultWellData.casingProfiles).map((p, idx) => ({ 
        ...p, 
        index: idx,
        type: p.type as 'casing' | 'liner'
    }));
    
    const sortedProfiles = [...casingProfiles].sort((a, b) => a.depth - b.depth);
    const maxDepth = Math.max(...sortedProfiles.map(p => p.depth), 2000);

    const getProfilePosition = (profile: CasingProfile) => {
        const startPercent = ((profile.startDepth || 0) / maxDepth) * 100;
        const endPercent = (profile.depth / maxDepth) * 100;
        const heightPercent = endPercent - startPercent;
        
        return {
            top: `${startPercent}%`,
            height: `${heightPercent}%`,
            isLiner: profile.type === 'liner'
        };
    };

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const height = containerRef.current.clientHeight;
                setContainerHeight(height);
                const newScale = Math.max(0.4, Math.min(1.0, height / 600));
                setScale(newScale);
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    useEffect(() => {
        if (data) {
            setEditData({
                wellName: data.wellName || '',
                waterDepth: data.waterDepth || 0,
                airGap: data.airGap || 0,
                HPWH: (data as any).HPWH || 0
            });
        }
    }, [data]);

    const handleEditClick = () => setEditDialogOpen(true);
    const handleEditClose = () => setEditDialogOpen(false);

    const handleEditSave = async () => {
        if (onUpdate && wellId) {
            try {
                await onUpdate({
                    wellName: editData.wellName,
                    waterDepth: editData.waterDepth,
                    airGap: editData.airGap,
                    HPWH: editData.HPWH
                });
                setEditDialogOpen(false);
                if (onRefresh) await onRefresh();
            } catch (err) {
                console.error('Failed to update well info:', err);
            }
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setEditData({ ...editData, [field]: value });
    };

    const handleDeleteClick = () => {
        setEditDialogOpen(false);
        setDeleteDialogOpen(true);
    };

    const handleDeleteWell = async () => {
        if (onDelete && wellId) {
            setDeleting(true);
            try {
                await onDelete();
                setDeleteDialogOpen(false);
            } catch (err) {
                console.error('Failed to delete well:', err);
            } finally {
                setDeleting(false);
            }
        }
    };

    // Casing profile handlers
    const handleCasingEdit = (index: number, profile: CasingProfile) => {
        setEditingCasingIndex(index);
        setEditingCasingData({ ...profile });
    };

    const handleCasingCancel = () => {
        setEditingCasingIndex(null);
        setEditingCasingData({});
    };

    const handleCasingSave = async () => {
        if (editingCasingIndex !== null && editingCasingData && onCasingUpdate) {
            const updatedProfiles: CasingProfile[] = [...casingProfiles];
            updatedProfiles[editingCasingIndex] = { 
                ...updatedProfiles[editingCasingIndex], 
                ...editingCasingData,
                type: (editingCasingData.type as 'casing' | 'liner') || updatedProfiles[editingCasingIndex].type
            };
            updatedProfiles.forEach((p, idx) => { p.index = idx; });
            await onCasingUpdate(updatedProfiles);
            if (onRefresh) await onRefresh();
            setEditingCasingIndex(null);
            setEditingCasingData({});
        }
    };

    const handleCasingInputChange = (field: keyof CasingProfile, value: string | number) => {
        setEditingCasingData({ ...editingCasingData, [field]: value });
    };

    const handleAddCasing = async () => {
        if (newCasing.size && onCasingUpdate) {
            const newProfile: CasingProfile = {
                index: casingProfiles.length,
                size: newCasing.size,
                type: (newCasing.type || 'casing') as 'casing' | 'liner',
                depth: newCasing.depth || 0,
                description: newCasing.description || '',
                startDepth: newCasing.type === 'liner' ? (newCasing.startDepth || 0) : undefined
            };
            const updatedProfiles = [...casingProfiles, newProfile].sort((a, b) => a.depth - b.depth);
            updatedProfiles.forEach((p, idx) => { p.index = idx; });
            await onCasingUpdate(updatedProfiles);
            if (onRefresh) await onRefresh();
            setCasingDialogOpen(false);
            setNewCasing({ size: '', type: 'casing', depth: 0, description: '' });
        }
    };

    const handleDeleteCasing = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this casing profile?')) {
            const updatedProfiles = casingProfiles.filter((_, i) => i !== index);
            updatedProfiles.forEach((p, idx) => { p.index = idx; });
            if (onCasingUpdate) await onCasingUpdate(updatedProfiles);
            if (onRefresh) await onRefresh();
        }
    };

    const moveCasingUp = async (index: number) => {
        if (index === 0) return;
        const newProfiles = [...casingProfiles];
        [newProfiles[index - 1], newProfiles[index]] = [newProfiles[index], newProfiles[index - 1]];
        newProfiles.forEach((p, idx) => { p.index = idx; });
        if (onCasingUpdate) await onCasingUpdate(newProfiles);
        if (onRefresh) await onRefresh();
    };

    const moveCasingDown = async (index: number) => {
        if (index === casingProfiles.length - 1) return;
        const newProfiles = [...casingProfiles];
        [newProfiles[index + 1], newProfiles[index]] = [newProfiles[index], newProfiles[index + 1]];
        newProfiles.forEach((p, idx) => { p.index = idx; });
        if (onCasingUpdate) await onCasingUpdate(newProfiles);
        if (onRefresh) await onRefresh();
    };

    const lineWidth = Math.max(2, 2.5 * scale);
    const tipWidth = Math.max(10, 14 * scale);
    const labelLeftOffset = Math.max(12, 16 * scale);
    const labelPadding = Math.max(3, 5 * scale);
    const horizontalSpacing = Math.max(18, 22 * scale);
    const startLeft = Math.max(15, 20 * scale);

    return (
        <Paper className="info-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">
                    Well Information
                </Typography>
            </div>
            <Divider />
            <div className="panel-content" ref={containerRef}>
                {/* Well Name */}
                <div className="well-name-section">
                    <Typography className="well-name-large">
                        {data.wellName || 'N/A'}
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={handleEditClick} className="well-edit-icon">
                            <Edit fontSize="small" />
                        </IconButton>
                    )}
                </div>

                {/* 3-Value Table */}
                <div className="metrics-table">
                    <div className="metrics-header">
                        <span className="metric-header-cell">Water Depth</span>
                        <span className="metric-header-cell">Air Gap</span>
                        <span className="metric-header-cell">HPWH</span>
                    </div>
                    <div className="metrics-values">
                        <span className="metric-value-cell">{data.waterDepth || 0} m</span>
                        <span className="metric-value-cell">{data.airGap || 0} m</span>
                        <span className="metric-value-cell">{(data as any).HPWH || 0} m</span>
                    </div>
                </div>

                {/* Casing Profile Diagram */}
                <div className="casing-diagram-container">
                    <div className="diagram-wrapper">
                        <div className="diagram-area">
                            {sortedProfiles.map((profile, idx) => {
                                const pos = getProfilePosition(profile);
                                const leftPosition = startLeft + (idx * horizontalSpacing);
                                
                                return (
                                    <div 
                                        key={profile.id || idx}
                                        className={`casing-string ${profile.type}`}
                                        style={{
                                            height: pos.height,
                                            top: pos.top,
                                            left: `${leftPosition}px`,
                                        }}
                                    >
                                        <div className="casing-line" style={{ width: `${lineWidth}px` }} />
                                        {profile.type === 'liner' && (
                                            <div className="casing-top-flat" style={{
                                                width: `${tipWidth}px`,
                                                height: `${lineWidth * 2}px`,
                                                top: `-${lineWidth}px`,
                                                left: `-${lineWidth / 2}px`
                                            }} />
                                        )}
                                        <div className="casing-tip-shoe" style={{
                                            borderLeft: `${tipWidth}px solid #000000`,
                                            borderTop: `${tipWidth * 0.4}px solid transparent`,
                                            borderBottom: `${tipWidth * 0.4}px solid transparent`,
                                            bottom: `${-lineWidth}px`,
                                            left: `${-lineWidth / 2}px`
                                        }} />
                                        <div className="casing-label" style={{
                                            bottom: `${-lineWidth * 2}px`,
                                            left: `${labelLeftOffset}px`,
                                            padding: `${labelPadding * 0.5}px ${labelPadding}px`
                                        }}>
                                            <Typography variant="caption" className="casing-size">
                                                {profile.size}
                                            </Typography>
                                            <Typography variant="caption" className="casing-depth">
                                                {profile.depth}m
                                            </Typography>
                                            <Typography variant="caption" className="casing-type">
                                                {profile.type}
                                            </Typography>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Well Info Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Well Information</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Well Name"
                        fullWidth
                        value={editData.wellName}
                        onChange={(e) => handleInputChange('wellName', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Water Depth (m)"
                        type="number"
                        fullWidth
                        value={editData.waterDepth}
                        onChange={(e) => handleInputChange('waterDepth', parseFloat(e.target.value) || 0)}
                    />
                    <TextField
                        margin="dense"
                        label="Air Gap (m)"
                        type="number"
                        fullWidth
                        value={editData.airGap}
                        onChange={(e) => handleInputChange('airGap', parseFloat(e.target.value) || 0)}
                    />
                    <TextField
                        margin="dense"
                        label="HPWH (m)"
                        type="number"
                        fullWidth
                        value={editData.HPWH}
                        onChange={(e) => handleInputChange('HPWH', parseFloat(e.target.value) || 0)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClick} color="error" startIcon={<Delete />}>
                        Delete Well
                    </Button>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Well Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
                    <Warning /> Delete Well
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to delete the well <strong>"{data.wellName}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        ⚠️ This will delete the ENTIRE WELL including:
                    </Typography>
                    <ul style={{ marginTop: 4, marginBottom: 8 }}>
                        <li>All well information</li>
                        <li>All casing profiles</li>
                        <li>All mud pits data</li>
                        <li>All BOP systems data</li>
                        <li>All mud pump liners data</li>
                        <li>All supply vessels</li>
                        <li>All cargo vessels</li>
                    </ul>
                    <Typography variant="body2" color="error" fontWeight="bold">
                        This action cannot be undone!
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                        Just Kidding!
                    </Button>
                    <Button 
                        onClick={handleDeleteWell} 
                        variant="contained" 
                        color="error"
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
                    >
                        Roger That!
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Casing Profiles Dialog */}
            <Dialog open={casingDialogOpen} onClose={() => setCasingDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Casing Profiles</DialogTitle>
                <DialogContent>
                    <div className="casing-edit-list">
                        {casingProfiles.map((profile, idx) => (
                            <div key={profile.id || idx} className="casing-edit-row">
                                {editingCasingIndex === idx ? (
                                    <div className="casing-edit-fields">
                                        <TextField
                                            size="small"
                                            label="Size"
                                            value={editingCasingData.size || ''}
                                            onChange={(e) => handleCasingInputChange('size', e.target.value)}
                                            sx={{ width: 80 }}
                                        />
                                        <FormControl size="small" sx={{ width: 100 }}>
                                            <InputLabel>Type</InputLabel>
                                            <Select
                                                value={editingCasingData.type || 'casing'}
                                                label="Type"
                                                onChange={(e) => handleCasingInputChange('type', e.target.value)}
                                            >
                                                <MenuItem value="casing">Casing</MenuItem>
                                                <MenuItem value="liner">Liner</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            size="small"
                                            label="Depth (m)"
                                            type="number"
                                            value={editingCasingData.depth || 0}
                                            onChange={(e) => handleCasingInputChange('depth', parseFloat(e.target.value) || 0)}
                                            sx={{ width: 100 }}
                                        />
                                        <TextField
                                            size="small"
                                            label="Description"
                                            value={editingCasingData.description || ''}
                                            onChange={(e) => handleCasingInputChange('description', e.target.value)}
                                            sx={{ width: 120 }}
                                        />
                                        <IconButton size="small" onClick={() => moveCasingUp(idx)} disabled={idx === 0}>
                                            <ArrowUpward fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => moveCasingDown(idx)} disabled={idx === casingProfiles.length - 1}>
                                            <ArrowDownward fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={handleCasingSave} color="primary">
                                            <Save fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={handleCasingCancel} color="secondary">
                                            <Cancel fontSize="small" />
                                        </IconButton>
                                    </div>
                                ) : (
                                    <div className="casing-edit-row-content">
                                        <span className="casing-edit-size">{profile.size}</span>
                                        <span className="casing-edit-type">{profile.type}</span>
                                        <span className="casing-edit-depth">{profile.depth}m</span>
                                        <span className="casing-edit-desc">{profile.description || '—'}</span>
                                        <IconButton size="small" onClick={() => handleCasingEdit(idx, profile)} color="primary">
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteCasing(idx)} color="error">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="casing-add-row">
                            <TextField
                                size="small"
                                label="Size"
                                value={newCasing.size}
                                onChange={(e) => setNewCasing({ ...newCasing, size: e.target.value })}
                                sx={{ width: 80 }}
                            />
                            <FormControl size="small" sx={{ width: 100 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={newCasing.type || 'casing'}
                                    label="Type"
                                    onChange={(e) => setNewCasing({ ...newCasing, type: e.target.value as 'casing' | 'liner' })}
                                >
                                    <MenuItem value="casing">Casing</MenuItem>
                                    <MenuItem value="liner">Liner</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                label="Depth (m)"
                                type="number"
                                value={newCasing.depth}
                                onChange={(e) => setNewCasing({ ...newCasing, depth: parseFloat(e.target.value) || 0 })}
                                sx={{ width: 100 }}
                            />
                            <TextField
                                size="small"
                                label="Description"
                                value={newCasing.description}
                                onChange={(e) => setNewCasing({ ...newCasing, description: e.target.value })}
                                sx={{ width: 120 }}
                            />
                            <IconButton size="small" onClick={handleAddCasing} color="primary">
                                <Add fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCasingDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default WellInformation;