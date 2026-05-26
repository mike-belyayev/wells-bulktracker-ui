// src/components/Dashboard/WellInformation.tsx
import { Paper, Typography, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Edit, Save, Cancel, Add, Delete } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import './WellInformation.css';

export interface WellInformationProps {
    wellData?: {
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        HPWH?: number;  // API uses HPWH (capital)
        casingProfiles?: CasingProfile[];
    };
    wellId?: string;
    onUpdate?: (data: any) => Promise<void>;
    onCasingUpdate?: (data: CasingProfile[]) => Promise<void>;
    readOnly?: boolean;
}

export interface CasingProfile {
    id: string;
    size: string;
    depth: number;
    mMD: number;
    mTVD: number;
}

const WellInformation = ({ wellData, wellId, onUpdate, onCasingUpdate, readOnly = false }: WellInformationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(500);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [casingDialogOpen, setCasingDialogOpen] = useState(false);
    const [editingCasingIndex, setEditingCasingIndex] = useState<number | null>(null);
    const [editingCasingData, setEditingCasingData] = useState<Partial<CasingProfile>>({});
    const [newCasing, setNewCasing] = useState<Partial<CasingProfile>>({ size: '', depth: 0, mMD: 0, mTVD: 0 });
    
    const [editData, setEditData] = useState({
        wellName: '',
        waterDepth: 0,
        airGap: 0,
        HPWH: 0
    });

    // Default mock data if none provided
    const defaultWellData = {
        wellName: "WELL B-07",
        waterDepth: 1245,
        airGap: 28,
        HPWH: 350,
        casingProfiles: [
            { id: '1', size: "36\"", depth: 120, mMD: 120, mTVD: 120 },
            { id: '2', size: "28\"", depth: 450, mMD: 450, mTVD: 448 },
            { id: '3', size: "22\"", depth: 850, mMD: 850, mTVD: 845 },
            { id: '4', size: "16\"", depth: 1250, mMD: 1250, mTVD: 1240 },
            { id: '5', size: "7\"", depth: 1890, mMD: 1890, mTVD: 1875 }
        ]
    };

    // Safely access data with fallbacks
    const data = wellData || defaultWellData;
    let casingProfiles = data.casingProfiles || defaultWellData.casingProfiles;
    
    // Sort so deepest casing (largest depth) is on the left
    casingProfiles = [...casingProfiles].sort((a, b) => b.depth - a.depth);
    
    // Set custom depths for proportional sizing
    const adjustedProfiles = casingProfiles.map((profile, index) => {
        if (index === 0) {
            return { ...profile, adjustedDepth: 90 };
        } else {
            const total = casingProfiles.length - 1;
            const progress = index / total;
            const adjustedHeight = 90 - (progress * 70);
            return { ...profile, adjustedDepth: adjustedHeight };
        }
    });

    // Calculate dynamic scaling
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

    // Initialize edit dialog data when wellData changes
    useEffect(() => {
        if (data) {
            setEditData({
                wellName: data.wellName || '',
                waterDepth: data.waterDepth || 0,
                airGap: data.airGap || 0,
                HPWH: (data as any).HPWH || (data as any).hpwh || 0
            });
        }
    }, [data]);

    const handleEditClick = () => {
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
    };

    const handleEditSave = async () => {
        if (onUpdate && wellId) {
            try {
                await onUpdate({
                    wellName: editData.wellName,
                    waterDepth: editData.waterDepth.toString(),
                    airGap: editData.airGap.toString(),
                    HPWH: editData.HPWH.toString()
                });
                setEditDialogOpen(false);
            } catch (err) {
                console.error('Failed to update well info:', err);
            }
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setEditData({ ...editData, [field]: value });
    };

    // Casing profile handlers
    const handleCasingEdit = (index: number, profile: CasingProfile) => {
        setEditingCasingIndex(index);
        setEditingCasingData(profile);
    };

    const handleCasingCancel = () => {
        setEditingCasingIndex(null);
        setEditingCasingData({});
    };

    const handleCasingSave = async () => {
        if (editingCasingIndex !== null && editingCasingData && onCasingUpdate) {
            const updatedProfiles = [...casingProfiles];
            updatedProfiles[editingCasingIndex] = { ...updatedProfiles[editingCasingIndex], ...editingCasingData };
            await onCasingUpdate(updatedProfiles);
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
                id: Date.now().toString(),
                size: newCasing.size,
                depth: newCasing.depth || 0,
                mMD: newCasing.mMD || 0,
                mTVD: newCasing.mTVD || 0
            };
            const updatedProfiles = [...casingProfiles, newProfile].sort((a, b) => b.depth - a.depth);
            await onCasingUpdate(updatedProfiles);
            setCasingDialogOpen(false);
            setNewCasing({ size: '', depth: 0, mMD: 0, mTVD: 0 });
        }
    };

    const handleDeleteCasing = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this casing profile?')) {
            const updatedProfiles = casingProfiles.filter((_, i) => i !== index);
            if (onCasingUpdate) await onCasingUpdate(updatedProfiles);
        }
    };

    // Dynamic font sizes
    const titleFontSize = `${Math.max(12, 14 * scale)}px`;
    const labelFontSize = `${Math.max(9, 11 * scale)}px`;
    const valueFontSize = `${Math.max(10, 13 * scale)}px`;
    const depthFontSize = `${Math.max(8, 9 * scale)}px`;
    const lineWidth = Math.max(1.5, 2 * scale);
    const tipWidth = Math.max(8, 12 * scale);
    const labelLeftOffset = Math.max(10, 14 * scale);
    const labelPadding = Math.max(2, 4 * scale);
    const horizontalSpacing = Math.max(12, 16 * scale);
    const startLeft = Math.max(5, 8 * scale);

    return (
        <Paper className="info-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title" style={{ fontSize: titleFontSize }}>
                    Well Information
                </Typography>
            </div>
            <Divider />
            <div className="panel-content" ref={containerRef}>
                {/* Well Name - Large bold blue */}
                <div className="well-name-container">
                    <Typography className="well-name-large" style={{ fontSize: `${Math.max(16, 20 * scale)}px` }}>
                        {data.wellName || 'N/A'}
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={handleEditClick} className="well-edit-icon">
                            <Edit fontSize="small" />
                        </IconButton>
                    )}
                </div>

                {/* Well Metadata - Inline rows */}
                <div className="well-metadata-inline">
                    <div className="metadata-inline-row">
                        <span className="metadata-label-inline" style={{ fontSize: labelFontSize }}>Water Depth:</span>
                        <span className="metadata-value-inline" style={{ fontSize: valueFontSize }}>{data.waterDepth || 0} m</span>
                    </div>
                    <div className="metadata-inline-row">
                        <span className="metadata-label-inline" style={{ fontSize: labelFontSize }}>Air Gap:</span>
                        <span className="metadata-value-inline" style={{ fontSize: valueFontSize }}>{data.airGap || 0} m</span>
                    </div>
                    <div className="metadata-inline-row">
                        <span className="metadata-label-inline" style={{ fontSize: labelFontSize }}>HPWH:</span>
                        <span className="metadata-value-inline" style={{ fontSize: valueFontSize }}>{(data as any).HPWH || (data as any).hpwh || 0} m</span>
                    </div>
                </div>

                <Divider className="section-divider" />

                {/* Casing Profile Header with Edit Button */}
                <div className="casing-header">
                    <Typography variant="subtitle2" className="diagram-title" style={{ fontSize: titleFontSize }}>
                        Casing Profile
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={() => setCasingDialogOpen(true)} className="casing-edit-btn" title="Edit Casing Profiles">
                            <Edit fontSize="small" />
                        </IconButton>
                    )}
                </div>
                
                {/* Casing Profile Diagram */}
                <div className="casing-diagram-container">
                    <div className="diagram-wrapper" style={{ minHeight: `${containerHeight * 0.45}px` }}>
                                <div className="diagram-area" style={{ minHeight: `${containerHeight * 0.4}px` }}>
                            {adjustedProfiles && adjustedProfiles.map((profile, index) => {
                                const heightPercent = profile.adjustedDepth;
                                const leftPosition = startLeft + (index * horizontalSpacing);
                                
                                return (
                                    <div 
                                        key={profile.id}
                                        className="casing-string"
                                        style={{
                                            height: `${heightPercent}%`,
                                            top: '0%',
                                            left: `${leftPosition}px`,
                                        }}
                                    >
                                        <div className="casing-line" style={{ width: `${lineWidth}px` }} />
                                        <div className="casing-tip-flag" style={{
                                            borderLeft: `${tipWidth}px solid #000000`,
                                            borderTop: `${tipWidth * 0.35}px solid transparent`,
                                            borderBottom: `${tipWidth * 0.35}px solid transparent`,
                                            bottom: `${-lineWidth}px`,
                                            left: `${-lineWidth / 2}px`
                                        }} />
                                        <div className="casing-label" style={{
                                            bottom: `${-lineWidth * 1.5}px`,
                                            left: `${labelLeftOffset}px`,
                                            padding: `${labelPadding * 0.5}px ${labelPadding}px`
                                        }}>
                                            <Typography variant="caption" className="casing-size" style={{ fontSize: labelFontSize }}>
                                                {profile.size}
                                            </Typography>
                                            <Typography variant="caption" className="casing-depth" style={{ fontSize: depthFontSize }}>
                                                {profile.mMD}m MD ({profile.mTVD}m TVD)
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
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editData.wellName}
                        onChange={(e) => handleInputChange('wellName', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Water Depth (m)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editData.waterDepth}
                        onChange={(e) => handleInputChange('waterDepth', parseFloat(e.target.value) || 0)}
                    />
                    <TextField
                        margin="dense"
                        label="Air Gap (m)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editData.airGap}
                        onChange={(e) => handleInputChange('airGap', parseFloat(e.target.value) || 0)}
                    />
                    <TextField
                        margin="dense"
                        label="HPWH (m)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editData.HPWH}
                        onChange={(e) => handleInputChange('HPWH', parseFloat(e.target.value) || 0)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Casing Profiles Dialog */}
            <Dialog open={casingDialogOpen} onClose={() => setCasingDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Casing Profiles</DialogTitle>
                <DialogContent>
                    <div className="casing-edit-list">
                        {casingProfiles.map((profile, idx) => (
                            <div key={profile.id} className="casing-edit-row">
                                {editingCasingIndex === idx ? (
                                    <div className="casing-edit-fields">
                                        <TextField
                                            size="small"
                                            label="Size"
                                            value={editingCasingData.size || ''}
                                            onChange={(e) => handleCasingInputChange('size', e.target.value)}
                                            sx={{ width: 80 }}
                                        />
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
                                            label="MD (m)"
                                            type="number"
                                            value={editingCasingData.mMD || 0}
                                            onChange={(e) => handleCasingInputChange('mMD', parseFloat(e.target.value) || 0)}
                                            sx={{ width: 100 }}
                                        />
                                        <TextField
                                            size="small"
                                            label="TVD (m)"
                                            type="number"
                                            value={editingCasingData.mTVD || 0}
                                            onChange={(e) => handleCasingInputChange('mTVD', parseFloat(e.target.value) || 0)}
                                            sx={{ width: 100 }}
                                        />
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
                                        <span className="casing-edit-depth">Depth: {profile.depth}m</span>
                                        <span className="casing-edit-md">MD: {profile.mMD}m</span>
                                        <span className="casing-edit-tvd">TVD: {profile.mTVD}m</span>
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
                                label="New Size"
                                value={newCasing.size}
                                onChange={(e) => setNewCasing({ ...newCasing, size: e.target.value })}
                                sx={{ width: 80 }}
                            />
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
                                label="MD (m)"
                                type="number"
                                value={newCasing.mMD}
                                onChange={(e) => setNewCasing({ ...newCasing, mMD: parseFloat(e.target.value) || 0 })}
                                sx={{ width: 100 }}
                            />
                            <TextField
                                size="small"
                                label="TVD (m)"
                                type="number"
                                value={newCasing.mTVD}
                                onChange={(e) => setNewCasing({ ...newCasing, mTVD: parseFloat(e.target.value) || 0 })}
                                sx={{ width: 100 }}
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