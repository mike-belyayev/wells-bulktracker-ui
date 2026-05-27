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
        casingProfile?: CasingProfile[];
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
    type: 'casing' | 'liner';
    description?: string;
}

const WellInformation = ({ wellData, wellId, onUpdate, onCasingUpdate, onDelete, onRefresh, readOnly = false }: WellInformationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(300);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [casingDialogOpen, setCasingDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingCasingIndex, setEditingCasingIndex] = useState<number | null>(null);
    const [editingCasingData, setEditingCasingData] = useState<Partial<CasingProfile>>({});
    const [tempCasingProfiles, setTempCasingProfiles] = useState<CasingProfile[]>([]);
    
    const [editData, setEditData] = useState({
        wellName: '',
        waterDepth: 0,
        airGap: 0,
        HPWH: 0
    });

    const data = wellData || { wellName: '', waterDepth: 0, airGap: 0, HPWH: 0, casingProfile: [] };
    let casingProfiles: CasingProfile[] = (data.casingProfile || []).map((p, idx) => ({ 
        ...p, 
        index: idx,
        type: p.type as 'casing' | 'liner'
    }));
    
    const sortedProfiles = [...casingProfiles].sort((a, b) => a.index - b.index);
    
    // Calculate positions for diagram
    const totalHeight = 100;
    const itemHeight = totalHeight / (sortedProfiles.length || 1);
    
    const getProfilePosition = (profile: CasingProfile, idx: number) => {
        const isLiner = profile.type === 'liner';
        const topPercent = idx * itemHeight;
        const heightPercent = itemHeight;
        
        const adjustedTop = isLiner ? topPercent : 0;
        const adjustedHeight = isLiner ? heightPercent : (idx + 1) * itemHeight;
        
        return {
            top: `${adjustedTop}%`,
            height: `${adjustedHeight}%`,
            isLiner
        };
    };

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const height = containerRef.current.clientHeight;
                setContainerHeight(Math.max(200, height));
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [casingProfiles.length]);

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
    const handleOpenCasingDialog = () => {
        setTempCasingProfiles(JSON.parse(JSON.stringify(casingProfiles)));
        setEditingCasingIndex(null);
        setCasingDialogOpen(true);
    };

    const handleCloseCasingDialog = () => {
        setCasingDialogOpen(false);
        setEditingCasingIndex(null);
        setEditingCasingData({});
    };

    const handleSaveCasingProfiles = async () => {
        if (onCasingUpdate) {
            // Ensure all profiles have proper index
            const profilesToSave = tempCasingProfiles.map((p, idx) => ({
                ...p,
                index: idx
            }));
            await onCasingUpdate(profilesToSave);
            if (onRefresh) await onRefresh();
            handleCloseCasingDialog();
        }
    };

    const handleCasingEdit = (index: number) => {
        setEditingCasingIndex(index);
        setEditingCasingData({ ...tempCasingProfiles[index] });
    };

    const handleCasingCancel = () => {
        setEditingCasingIndex(null);
        setEditingCasingData({});
    };

    const handleCasingSaveEdit = () => {
        if (editingCasingIndex !== null && editingCasingData) {
            const updatedProfiles = [...tempCasingProfiles];
            updatedProfiles[editingCasingIndex] = {
                ...updatedProfiles[editingCasingIndex],
                ...editingCasingData,
                type: (editingCasingData.type as 'casing' | 'liner') || updatedProfiles[editingCasingIndex].type
            };
            setTempCasingProfiles(updatedProfiles);
            setEditingCasingIndex(null);
            setEditingCasingData({});
        }
    };

    const handleCasingInputChange = (field: keyof CasingProfile, value: string | number) => {
        setEditingCasingData({ ...editingCasingData, [field]: value });
    };

    const handleAddCasing = () => {
        const newProfile: CasingProfile = {
            index: tempCasingProfiles.length,
            size: '',
            type: 'casing',
            description: ''
        };
        setTempCasingProfiles([...tempCasingProfiles, newProfile]);
        setEditingCasingIndex(tempCasingProfiles.length);
        setEditingCasingData(newProfile);
    };

    const handleDeleteCasing = (index: number) => {
        if (window.confirm('Are you sure you want to delete this casing profile?')) {
            const updatedProfiles = tempCasingProfiles.filter((_, i) => i !== index);
            setTempCasingProfiles(updatedProfiles);
            if (editingCasingIndex === index) {
                setEditingCasingIndex(null);
                setEditingCasingData({});
            }
        }
    };

    const moveCasingUp = (index: number) => {
        if (index === 0) return;
        const newProfiles = [...tempCasingProfiles];
        [newProfiles[index - 1], newProfiles[index]] = [newProfiles[index], newProfiles[index - 1]];
        setTempCasingProfiles(newProfiles);
    };

    const moveCasingDown = (index: number) => {
        if (index === tempCasingProfiles.length - 1) return;
        const newProfiles = [...tempCasingProfiles];
        [newProfiles[index + 1], newProfiles[index]] = [newProfiles[index], newProfiles[index + 1]];
        setTempCasingProfiles(newProfiles);
    };

    const lineWidth = Math.max(2, 2.5 * scale);
    const tipWidth = Math.max(10, 14 * scale);
    const labelLeftOffset = Math.max(12, 16 * scale);
    const labelPadding = Math.max(3, 5 * scale);

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

                {/* Casing Profile Diagram with Edit Button at Bottom Right */}
                <div className="casing-diagram-container">
                    <div className="diagram-wrapper" style={{ minHeight: `${Math.max(200, containerHeight * 0.45)}px` }}>
                        <div className="diagram-area">
                            {sortedProfiles.length === 0 ? (
                                <div className="empty-diagram">
                                    <Typography variant="body2" color="textSecondary">
                                        No casing profiles defined.
                                    </Typography>
                                </div>
                            ) : (
                                sortedProfiles.map((profile, idx) => {
                                    const pos = getProfilePosition(profile, idx);
                                    
                                    return (
                                        <div 
                                            key={profile.index}
                                            className={`casing-string ${profile.type}`}
                                            style={{
                                                height: pos.height,
                                                top: pos.top,
                                                left: `25px`,
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
                                                <Typography variant="caption" className="casing-type">
                                                    {profile.type}
                                                </Typography>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {/* Edit Button at Bottom Right */}
                        {!readOnly && (
                            <IconButton 
                                size="small" 
                                onClick={handleOpenCasingDialog} 
                                className="casing-edit-bottom-btn"
                                title="Edit Casing Profiles"
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        )}
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
                        ⚠️ This will delete the ENTIRE WELL including all associated data.
                    </Typography>
                    <Typography variant="body2" color="error" fontWeight="bold" sx={{ mt: 1 }}>
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
            <Dialog open={casingDialogOpen} onClose={handleCloseCasingDialog} maxWidth="md" fullWidth>
                <DialogTitle>Edit Casing Profiles</DialogTitle>
                <DialogContent>
                    <div className="casing-edit-list">
                        {tempCasingProfiles.map((profile, idx) => (
                            <div key={idx} className="casing-edit-row">
                                {editingCasingIndex === idx ? (
                                    <div className="casing-edit-fields">
                                        <TextField
                                            size="small"
                                            label="Size"
                                            value={editingCasingData.size || ''}
                                            onChange={(e) => handleCasingInputChange('size', e.target.value)}
                                            sx={{ width: 120 }}
                                            autoFocus
                                        />
                                        <FormControl size="small" sx={{ width: 120 }}>
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
                                            label="Description"
                                            value={editingCasingData.description || ''}
                                            onChange={(e) => handleCasingInputChange('description', e.target.value)}
                                            sx={{ width: 150 }}
                                        />
                                        <div className="casing-edit-actions">
                                            <IconButton size="small" onClick={handleCasingSaveEdit} color="primary">
                                                <Save fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={handleCasingCancel} color="secondary">
                                                <Cancel fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="casing-edit-row-content">
                                        <span className="casing-edit-size">{profile.size || '—'}</span>
                                        <span className="casing-edit-type">{profile.type}</span>
                                        <span className="casing-edit-desc">{profile.description || '—'}</span>
                                        <div className="casing-edit-actions">
                                            <IconButton size="small" onClick={() => moveCasingUp(idx)} disabled={idx === 0}>
                                                <ArrowUpward fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => moveCasingDown(idx)} disabled={idx === tempCasingProfiles.length - 1}>
                                                <ArrowDownward fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleCasingEdit(idx)} color="primary">
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteCasing(idx)} color="error">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={handleAddCasing}
                        className="add-casing-dialog-btn"
                    >
                        Add Casing/Liner
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCasingDialog}>Cancel</Button>
                    <Button onClick={handleSaveCasingProfiles} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default WellInformation;