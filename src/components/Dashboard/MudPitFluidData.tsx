// src/components/Dashboard/MudPitFluidData.tsx
import { Paper, Typography, Divider, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
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
    _id?: string;
    pitName: string;
    pitGroup?: string;
    order: number;
    values: PitValue[];
}

const MudPitFluidData = ({ fluidData, wellId, onUpdate, readOnly = false }: MudPitFluidDataProps) => {
    const [pits, setPits] = useState<PitData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingData, setEditingData] = useState<PitData | null>(null);
    const [newValueName, setNewValueName] = useState('');

    // Add Pit Dialog
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newPitName, setNewPitName] = useState('');
    const [newPitGroup, setNewPitGroup] = useState('');
    const [newPitValues, setNewPitValues] = useState<PitValue[]>([
        { valueName: 'Fluid', value: '' },
        { valueName: 'Weight', value: '' },
        { valueName: 'Vol. (bbl)', value: '' }
    ]);

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

    const getGroupedPits = () => {
        const groups: { [key: string]: PitData[] } = {};
        const ungrouped: PitData[] = [];
        
        pits.forEach(pit => {
            if (pit.pitGroup && pit.pitGroup.trim() !== '') {
                const groupName = pit.pitGroup;
                if (!groups[groupName]) {
                    groups[groupName] = [];
                }
                groups[groupName].push(pit);
            } else {
                ungrouped.push(pit);
            }
        });
        
        return { groups, ungrouped };
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditingData(JSON.parse(JSON.stringify(pits[index])));
        setNewValueName('');
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingData(null);
        setNewValueName('');
    };

    const handleSaveEdit = async () => {
        if (editingIndex !== null && editingData && onUpdate) {
            const updatedPits = [...pits];
            updatedPits[editingIndex] = editingData;
            updatedPits.forEach((pit, idx) => { pit.order = idx; });
            setPits(updatedPits);
            await onUpdate(updatedPits);
            setEditingIndex(null);
            setEditingData(null);
            setNewValueName('');
        }
    };

    const handleValueChange = (valueName: string, newValue: string) => {
        if (editingData) {
            setEditingData({
                ...editingData,
                values: editingData.values.map(v => 
                    v.valueName === valueName ? { ...v, value: newValue } : v
                )
            });
        }
    };

    const handleGroupChange = (newGroup: string) => {
        if (editingData) {
            setEditingData({
                ...editingData,
                pitGroup: newGroup.trim() === '' ? undefined : newGroup
            });
        }
    };

    const handleNameChange = (newName: string) => {
        if (editingData) {
            setEditingData({
                ...editingData,
                pitName: newName
            });
        }
    };

    const handleAddCustomField = () => {
        if (editingData && newValueName.trim()) {
            const newValue: PitValue = { valueName: newValueName.trim(), value: '' };
            setEditingData({
                ...editingData,
                values: [...editingData.values, newValue]
            });
            setNewValueName('');
        }
    };

    const handleRemoveValue = (valueName: string) => {
        if (editingData) {
            setEditingData({
                ...editingData,
                values: editingData.values.filter(v => v.valueName !== valueName)
            });
        }
    };

    const movePitUp = async (index: number) => {
        if (index <= 0) return;
        
        const newPits = [...pits];
        [newPits[index - 1], newPits[index]] = [newPits[index], newPits[index - 1]];
        newPits.forEach((pit, idx) => { pit.order = idx; });
        setPits(newPits);
        
        if (editingIndex === index) {
            setEditingIndex(index - 1);
            setEditingData(newPits[index - 1]);
        } else if (editingIndex === index - 1) {
            setEditingIndex(index);
            setEditingData(newPits[index]);
        }
        
        if (onUpdate) await onUpdate(newPits);
    };

    const movePitDown = async (index: number) => {
        if (index >= pits.length - 1) return;
        
        const newPits = [...pits];
        [newPits[index + 1], newPits[index]] = [newPits[index], newPits[index + 1]];
        newPits.forEach((pit, idx) => { pit.order = idx; });
        setPits(newPits);
        
        if (editingIndex === index) {
            setEditingIndex(index + 1);
            setEditingData(newPits[index + 1]);
        } else if (editingIndex === index + 1) {
            setEditingIndex(index);
            setEditingData(newPits[index]);
        }
        
        if (onUpdate) await onUpdate(newPits);
    };

    const handleDeletePit = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this pit?')) {
            const updatedPits = pits.filter((_, i) => i !== index);
            updatedPits.forEach((pit, idx) => { pit.order = idx; });
            setPits(updatedPits);
            
            if (onUpdate) await onUpdate(updatedPits);
            
            if (editingIndex === index) {
                setEditingIndex(null);
                setEditingData(null);
            } else if (editingIndex !== null && editingIndex > index) {
                setEditingIndex(editingIndex - 1);
            }
        }
    };

    const handleAddPit = async () => {
        if (newPitName.trim() && onUpdate) {
            const newPit: PitData = {
                pitName: newPitName.trim(),
                pitGroup: newPitGroup.trim() === '' ? undefined : newPitGroup.trim(),
                order: pits.length,
                values: newPitValues.filter(v => v.valueName.trim() && v.valueName !== '')
            };
            const updatedPits = [...pits, newPit];
            updatedPits.forEach((pit, idx) => { pit.order = idx; });
            setPits(updatedPits);
            await onUpdate(updatedPits);
            
            setAddDialogOpen(false);
            setNewPitName('');
            setNewPitGroup('');
            setNewPitValues([
                { valueName: 'Fluid', value: '' },
                { valueName: 'Weight', value: '' },
                { valueName: 'Vol. (bbl)', value: '' }
            ]);
        }
    };

    const handleAddNewPitValue = (index: number, field: 'valueName' | 'value', value: string) => {
        const updated = [...newPitValues];
        updated[index][field] = value;
        setNewPitValues(updated);
    };

    const handleAddNewValueField = () => {
        setNewPitValues([...newPitValues, { valueName: '', value: '' }]);
    };

    const handleRemoveNewValueField = (index: number) => {
        const updated = newPitValues.filter((_, i) => i !== index);
        setNewPitValues(updated);
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

    const { groups, ungrouped } = getGroupedPits();
    const allGroups = Object.keys(groups).sort();

    const renderPitCard = (pit: PitData, index: number, isInGroup: boolean = false) => {
        const isEditing = editingIndex === index;
        
        return (
            <div key={`pit_${pit.pitName}_${index}`} className={`pit-card ${isInGroup ? 'grouped-pit' : ''}`}>
                <div className="pit-header">
                    <Typography className="pit-name">{pit.pitName}</Typography>
                    {!readOnly && !isEditing && (
                        <IconButton size="small" onClick={() => handleEdit(index)} className="pit-edit-btn">
                            <Edit fontSize="small" />
                        </IconButton>
                    )}
                </div>
                
                {isEditing && editingData ? (
                    <div className="pit-details editing">
                        {/* Name Edit */}
                        <div className="edit-row">
                            <Typography className="edit-label">Name:</Typography>
                            <input type="text" value={editingData.pitName} onChange={(e) => handleNameChange(e.target.value)} className="edit-input" />
                        </div>
                        
                        {/* Group Edit */}
                        <div className="edit-row">
                            <Typography className="edit-label">Group:</Typography>
                            <input type="text" value={editingData.pitGroup || ''} onChange={(e) => handleGroupChange(e.target.value)} className="edit-input" placeholder="No group" />
                        </div>
                        
                        {/* Values */}
                        {editingData.values.map((val, idx) => (
                            <div key={`val_${val.valueName}_${idx}`} className="value-row">
                                <Typography className="value-label">{val.valueName}:</Typography>
                                <input type="text" value={val.value} onChange={(e) => handleValueChange(val.valueName, e.target.value)} className="value-input" />
                                <IconButton size="small" onClick={() => handleRemoveValue(val.valueName)} className="remove-value-btn">
                                    <Delete fontSize="small" />
                                </IconButton>
                            </div>
                        ))}
                        
                        {/* Add Custom Field */}
                        <div className="add-field-row">
                            <input type="text" value={newValueName} onChange={(e) => setNewValueName(e.target.value)} placeholder="New field name..." className="field-input" onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()} />
                            <button onClick={handleAddCustomField} className="add-field-btn" disabled={!newValueName.trim()}>Add</button>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <Tooltip title="Move Up"><IconButton size="small" onClick={() => movePitUp(index)} disabled={index === 0}><ArrowUpward fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Move Down"><IconButton size="small" onClick={() => movePitDown(index)} disabled={index === pits.length - 1}><ArrowDownward fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete Pit"><IconButton size="small" onClick={() => handleDeletePit(index)} className="delete-btn"><Delete fontSize="small" /></IconButton></Tooltip>
                            <IconButton size="small" onClick={handleSaveEdit} color="primary"><Save fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={handleCancelEdit} color="secondary"><Cancel fontSize="small" /></IconButton>
                        </div>
                    </div>
                ) : (
                    <div className="pit-details">
                        {pit.values.map((val, idx) => (
                            <div key={`display_${val.valueName}_${idx}`} className="value-row">
                                <Typography className="value-label">{val.valueName}:</Typography>
                                <Typography className="value-text">{val.value || '—'}</Typography>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Paper className="fluid-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">MUD PIT CAPACITIES & FLUID DATA</Typography>
                {!readOnly && (
                    <IconButton size="small" onClick={() => setAddDialogOpen(true)} className="add-pit-btn" title="Add Pit">
                        <Add fontSize="small" />
                    </IconButton>
                )}
            </div>
            <Divider />
            <div className="fluid-content">
                {pits.length === 0 ? (
                    <div className="empty-state">No mud pits configured. Click the + button to add one.</div>
                ) : (
                    <>
                        {allGroups.map(groupName => {
                            const groupPits = groups[groupName];
                            return (
                                <div key={`group_${groupName}`} className="pit-group-container">
                                    <div className="pit-group-label-corner">
                                        <Typography className="pit-group-label-text">{groupName}</Typography>
                                    </div>
                                    <div className="pit-group-grid">
                                        {groupPits.map(pit => {
                                            const idx = pits.findIndex(p => p.pitName === pit.pitName && p.order === pit.order);
                                            return renderPitCard(pit, idx, true);
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {ungrouped.length > 0 && (
                            <div className="pit-group-container">
                                <div className="pit-group-grid">
                                    {ungrouped.map(pit => {
                                        const idx = pits.findIndex(p => p.pitName === pit.pitName && p.order === pit.order);
                                        return renderPitCard(pit, idx, false);
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Pit Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Mud Pit</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Pit Name" fullWidth value={newPitName} onChange={(e) => setNewPitName(e.target.value)} required />
                    <TextField margin="dense" label="Group (optional)" fullWidth value={newPitGroup} onChange={(e) => setNewPitGroup(e.target.value)} placeholder="e.g., Active, Reserve, Chemical" />
                    
                    <Typography variant="subtitle2" style={{ marginTop: 16, marginBottom: 8 }}>Values:</Typography>
                    {newPitValues.map((val, idx) => (
                        <div key={`new_val_${idx}`} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                            <TextField size="small" placeholder="Field name" value={val.valueName} onChange={(e) => handleAddNewPitValue(idx, 'valueName', e.target.value)} style={{ flex: 1 }} />
                            <TextField size="small" placeholder="Value" value={val.value} onChange={(e) => handleAddNewPitValue(idx, 'value', e.target.value)} style={{ flex: 1 }} />
                            <IconButton size="small" onClick={() => handleRemoveNewValueField(idx)} color="error"><Delete fontSize="small" /></IconButton>
                        </div>
                    ))}
                    <Button size="small" startIcon={<Add />} onClick={handleAddNewValueField} style={{ marginTop: 8 }}>Add Field</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddPit} variant="contained" color="primary" disabled={!newPitName.trim()}>Add Pit</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default MudPitFluidData;