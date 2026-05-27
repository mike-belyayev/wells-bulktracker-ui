// src/components/Dashboard/MudPitFluidData.tsx
import { Paper, Typography, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Edit, Save, Cancel, Add, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import './MudPitFluidData.css';

export interface MudPitFluidDataProps {
    fluidData?: PitData[];
    wellId?: string;
    onUpdate?: (data: PitData[]) => Promise<void>;
    readOnly?: boolean;
}

export interface PitValue {
    valueName: string;
    value: string;
}

export interface PitData {
    id?: string;
    pitName: string;
    pitGroup?: string;
    order: number;
    values: PitValue[];
}

// Group colors
const GROUP_COLORS = [
    { name: 'None', value: '', bg: '#ffffff', border: '#e0e0e0' },
    { name: 'Light Yellow', value: 'yellow', bg: '#FFF9C4', border: '#F9A825' },
    { name: 'Light Blue', value: 'blue', bg: '#BBDEFB', border: '#1976D2' },
    { name: 'Light Green', value: 'green', bg: '#C8E6C9', border: '#388E3C' },
    { name: 'Light Purple', value: 'purple', bg: '#D1C4E9', border: '#5E35B1' },
    { name: 'Light Orange', value: 'orange', bg: '#FFCCBC', border: '#F4511E' },
    { name: 'Light Pink', value: 'pink', bg: '#F8BBD0', border: '#D81B60' },
    { name: 'Light Brown', value: 'brown', bg: '#D7CCC8', border: '#795548' },
    { name: 'Light Cyan', value: 'cyan', bg: '#B2EBF2', border: '#00838F' },
];

const MudPitFluidData = ({ fluidData, wellId, onUpdate, readOnly = false }: MudPitFluidDataProps) => {
    const [pits, setPits] = useState<PitData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [tempPits, setTempPits] = useState<PitData[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingData, setEditingData] = useState<PitData | null>(null);

    useEffect(() => {
        if (fluidData && fluidData.length > 0) {
            const sorted = [...fluidData].sort((a, b) => (a.order || 0) - (b.order || 0));
            setPits(sorted);
            setLoading(false);
        } else {
            setPits([]);
            setLoading(false);
        }
    }, [fluidData]);

    const handleEditClick = () => {
        setTempPits(JSON.parse(JSON.stringify(pits)));
        setEditingIndex(null);
        setEditDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditDialogOpen(false);
        setEditingIndex(null);
        setEditingData(null);
    };

    const handleSavePits = async () => {
        if (onUpdate) {
            const pitsToSave = tempPits.map((p, idx) => ({ ...p, order: idx }));
            await onUpdate(pitsToSave);
            setPits(pitsToSave);
            handleCloseDialog();
        }
    };

    const handleEditPit = (index: number) => {
        setEditingIndex(index);
        setEditingData({ ...tempPits[index] });
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingData(null);
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null && editingData) {
            const updated = [...tempPits];
            updated[editingIndex] = editingData;
            setTempPits(updated);
            setEditingIndex(null);
            setEditingData(null);
        }
    };

    const handleInputChange = (field: keyof PitData, value: string | PitValue[]) => {
        if (editingData) {
            setEditingData({ ...editingData, [field]: value });
        }
    };

    const handleValueChange = (valueIndex: number, newValue: string) => {
        if (editingData) {
            const updatedValues = [...editingData.values];
            updatedValues[valueIndex] = { ...updatedValues[valueIndex], value: newValue };
            setEditingData({ ...editingData, values: updatedValues });
        }
    };

    const handleAddValue = () => {
        if (editingData) {
            const newValue: PitValue = { valueName: 'New Field', value: '' };
            setEditingData({ ...editingData, values: [...editingData.values, newValue] });
        }
    };

    const handleRemoveValue = (valueIndex: number) => {
        if (editingData) {
            const updatedValues = editingData.values.filter((_, i) => i !== valueIndex);
            setEditingData({ ...editingData, values: updatedValues });
        }
    };

    const handleAddPit = () => {
        const newPit: PitData = {
            id: Date.now().toString(),
            pitName: 'New Pit',
            order: tempPits.length,
            values: [
                { valueName: 'Fluid', value: '' },
                { valueName: 'Weight', value: '' },
                { valueName: 'Vol. (bbl)', value: '' }
            ]
        };
        setTempPits([...tempPits, newPit]);
        setEditingIndex(tempPits.length);
        setEditingData(newPit);
    };

    const handleDeletePit = (index: number) => {
        if (window.confirm('Are you sure you want to delete this pit?')) {
            const updated = tempPits.filter((_, i) => i !== index);
            setTempPits(updated);
            if (editingIndex === index) {
                setEditingIndex(null);
                setEditingData(null);
            }
        }
    };

    const movePitUp = (index: number) => {
        if (index === 0) return;
        const newPits = [...tempPits];
        [newPits[index - 1], newPits[index]] = [newPits[index], newPits[index - 1]];
        setTempPits(newPits);
    };

    const movePitDown = (index: number) => {
        if (index === tempPits.length - 1) return;
        const newPits = [...tempPits];
        [newPits[index + 1], newPits[index]] = [newPits[index], newPits[index + 1]];
        setTempPits(newPits);
    };

    const getGroupColor = (groupName?: string) => {
        const color = GROUP_COLORS.find(c => c.value === groupName);
        return color || GROUP_COLORS[0];
    };

    if (loading) {
        return (
            <Paper className="fluid-panel" elevation={3}>
                <div className="panel-header">
                    <Typography variant="h6" className="panel-title">MUD PIT CAPACITIES & FLUID DATA</Typography>
                </div>
                <Divider />
                <div className="fluid-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Typography>Loading mud pits...</Typography>
                </div>
            </Paper>
        );
    }

    return (
        <Paper className="fluid-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">MUD PIT CAPACITIES & FLUID DATA</Typography>
                {!readOnly && (
                    <IconButton size="small" onClick={handleEditClick} className="add-pit-btn" title="Edit Mud Pits">
                        <Edit fontSize="small" />
                    </IconButton>
                )}
            </div>
            <Divider />
            <div className="fluid-content">
                {pits.length === 0 ? (
                    <div className="empty-state">No mud pits configured. Click Edit to add pits.</div>
                ) : (
                    <div className="continuous-grid">
                        {pits.map((pit, idx) => {
                            const colors = getGroupColor(pit.pitGroup);
                            return (
                                <div key={pit.id || idx} className="pit-card" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                                    <div className="pit-header">
                                        <Typography className="pit-name">{pit.pitName}</Typography>
                                    </div>
                                    <div className="pit-details">
                                        {pit.values.map((val, vIdx) => (
                                            <div key={vIdx} className="value-row">
                                                <Typography className="value-label">{val.valueName}:</Typography>
                                                <Typography className="value-text">{val.value || '—'}</Typography>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Mud Pits Dialog */}
            <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit Mud Pits</DialogTitle>
                <DialogContent>
                    <div className="mudpit-edit-list">
                        {tempPits.length === 0 && (
                            <Typography variant="body2" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                                No mud pits. Click "Add Pit" to create one.
                            </Typography>
                        )}
                        {tempPits.map((pit, idx) => (
                            <div key={pit.id || idx} className="mudpit-edit-row">
                                {editingIndex === idx && editingData ? (
                                    // Edit Mode
                                    <div className="mudpit-edit-fields">
                                        <div className="edit-section">
                                            <TextField
                                                size="medium"
                                                label="Pit Name"
                                                value={editingData.pitName}
                                                onChange={(e) => handleInputChange('pitName', e.target.value)}
                                                fullWidth
                                                autoFocus
                                            />
                                        </div>
                                        <div className="edit-section">
                                            <FormControl size="medium" fullWidth>
                                                <InputLabel>Group Color</InputLabel>
                                                <Select
                                                    value={editingData.pitGroup || ''}
                                                    label="Group Color"
                                                    onChange={(e) => handleInputChange('pitGroup', e.target.value)}
                                                >
                                                    {GROUP_COLORS.map(color => (
                                                        <MenuItem key={color.value} value={color.value}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: 20, height: 20, backgroundColor: color.bg, border: `1px solid ${color.border}`, borderRadius: 3 }} />
                                                                {color.name}
                                                            </div>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="edit-values-section">
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Values:</Typography>
                                            {editingData.values.map((val, vIdx) => (
                                                <div key={vIdx} className="edit-value-row">
                                                    <TextField
                                                        size="small"
                                                        label="Field Name"
                                                        value={val.valueName}
                                                        onChange={(e) => {
                                                            const newValues = [...editingData.values];
                                                            newValues[vIdx] = { ...newValues[vIdx], valueName: e.target.value };
                                                            handleInputChange('values', newValues);
                                                        }}
                                                        sx={{ flex: 1 }}
                                                    />
                                                    <TextField
                                                        size="small"
                                                        label="Value"
                                                        value={val.value}
                                                        onChange={(e) => handleValueChange(vIdx, e.target.value)}
                                                        sx={{ flex: 1 }}
                                                    />
                                                    <IconButton size="small" onClick={() => handleRemoveValue(vIdx)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            <Button size="small" startIcon={<Add />} onClick={handleAddValue} sx={{ mt: 1 }}>
                                                Add Field
                                            </Button>
                                        </div>
                                        <div className="edit-actions">
                                            <IconButton size="medium" onClick={handleSaveEdit} color="primary">
                                                <Save fontSize="medium" />
                                            </IconButton>
                                            <IconButton size="medium" onClick={handleCancelEdit} color="secondary">
                                                <Cancel fontSize="medium" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="mudpit-edit-row-content">
                                        <div className="view-section">
                                            <span className="pit-name-view">{pit.pitName}</span>
                                        </div>
                                        <div className="view-section">
                                            <div className="color-indicator" style={{ backgroundColor: getGroupColor(pit.pitGroup).bg, border: `1px solid ${getGroupColor(pit.pitGroup).border}` }} />
                                            <span className="pit-group-view">{pit.pitGroup || 'No Group'}</span>
                                        </div>
                                        <div className="view-values-section">
                                            {pit.values.map((val, vIdx) => (
                                                <span key={vIdx} className="pit-value-view">
                                                    <strong>{val.valueName}:</strong> {val.value || '—'}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="view-actions">
                                            <IconButton size="medium" onClick={() => movePitUp(idx)} disabled={idx === 0}>
                                                <ArrowUpward fontSize="medium" />
                                            </IconButton>
                                            <IconButton size="medium" onClick={() => movePitDown(idx)} disabled={idx === tempPits.length - 1}>
                                                <ArrowDownward fontSize="medium" />
                                            </IconButton>
                                            <IconButton size="medium" onClick={() => handleEditPit(idx)} color="primary">
                                                <Edit fontSize="medium" />
                                            </IconButton>
                                            <IconButton size="medium" onClick={() => handleDeletePit(idx)} color="error">
                                                <Delete fontSize="medium" />
                                            </IconButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button size="large" startIcon={<Add />} onClick={handleAddPit} variant="outlined" sx={{ mt: 2, textTransform: 'none' }}>
                        Add Pit
                    </Button>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseDialog} size="large">Cancel</Button>
                    <Button onClick={handleSavePits} variant="contained" color="primary" size="large">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default MudPitFluidData;