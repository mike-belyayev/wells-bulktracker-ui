// src/components/Dashboard/WellInformation.tsx
import { Paper, Typography, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { Edit, Delete, Warning } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import CasingDiagram from './CasingDiagram';
import CasingEditDialog from './CasingEditDialog';
import type { CasingProfile } from '../../utils/casingDiagramUtils';
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

const WellInformation = ({ wellData, wellId, onUpdate, onCasingUpdate, onDelete, onRefresh, readOnly = false }: WellInformationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(300);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [casingDialogOpen, setCasingDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // Edit data - computed on the fly, not stored in state
    const [editWellName, setEditWellName] = useState('');
    const [editWaterDepth, setEditWaterDepth] = useState(0);
    const [editAirGap, setEditAirGap] = useState(0);
    const [editHPWH, setEditHPWH] = useState(0);

    const data = wellData || { wellName: '', waterDepth: 0, airGap: 0, HPWH: 0, casingProfile: [] };
    const casingProfiles: CasingProfile[] = (data.casingProfile || []).map((p, idx) => ({ 
        ...p, 
        index: idx,
        type: p.type as 'casing' | 'liner'
    }));

    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                setContainerHeight(Math.max(200, containerRef.current.clientHeight));
            }
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [casingProfiles.length]);

    const handleEditClick = () => {
        // Set edit data directly when opening dialog
        setEditWellName(data.wellName || '');
        setEditWaterDepth(data.waterDepth || 0);
        setEditAirGap(data.airGap || 0);
        setEditHPWH((data as any).HPWH || 0);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
    };

    const handleEditSave = async () => {
        if (onUpdate && wellId) {
            try {
                await onUpdate({
                    wellName: editWellName,
                    waterDepth: editWaterDepth,
                    airGap: editAirGap,
                    HPWH: editHPWH
                });
                setEditDialogOpen(false);
                if (onRefresh) await onRefresh();
            } catch (err) {
                console.error('Failed to update well info:', err);
            }
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        switch (field) {
            case 'wellName':
                setEditWellName(value as string);
                break;
            case 'waterDepth':
                setEditWaterDepth(value as number);
                break;
            case 'airGap':
                setEditAirGap(value as number);
                break;
            case 'HPWH':
                setEditHPWH(value as number);
                break;
        }
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

    const handleCasingUpdate = async (updatedProfiles: CasingProfile[]) => {
        if (onCasingUpdate) {
            await onCasingUpdate(updatedProfiles);
            if (onRefresh) await onRefresh();
        }
    };

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
                <CasingDiagram
                    profiles={casingProfiles}
                    onEdit={() => setCasingDialogOpen(true)}
                    readOnly={readOnly}
                    containerHeight={containerHeight}
                />
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
                        value={editWellName}
                        onChange={(e) => handleInputChange('wellName', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Water Depth (m)"
                        type="number"
                        fullWidth
                        value={editWaterDepth}
                        onChange={(e) => handleInputChange('waterDepth', parseFloat(e.target.value) || 0)}
                    />
                    <TextField
                        margin="dense"
                        label="Air Gap (m)"
                        type="number"
                        fullWidth
                        value={editAirGap}
                        onChange={(e) => handleInputChange('airGap', parseFloat(e.target.value) || 0)}
                    />
                    <TextField
                        margin="dense"
                        label="HPWH (m)"
                        type="number"
                        fullWidth
                        value={editHPWH}
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
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Just Kidding!</Button>
                    <Button onClick={handleDeleteWell} variant="contained" color="error" disabled={deleting} startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}>
                        Roger That!
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Casing Profiles Dialog */}
            <CasingEditDialog
                open={casingDialogOpen}
                profiles={casingProfiles}
                onClose={() => setCasingDialogOpen(false)}
                onSave={handleCasingUpdate}
            />
        </Paper>
    );
};

export default WellInformation;