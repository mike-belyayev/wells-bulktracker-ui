// src/components/Dashboard/CasingEditDialog.tsx
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, MenuItem, Select, FormControl, InputLabel, Typography } from '@mui/material';
import { Add, Delete, Edit as EditIcon, Save, Cancel, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import type { CasingProfile } from '../../utils/casingDiagramUtils';

interface CasingEditDialogProps {
    open: boolean;
    profiles: CasingProfile[];
    onClose: () => void;
    onSave: (profiles: CasingProfile[]) => Promise<void>;
}

const CasingEditDialog = ({ open, profiles, onClose, onSave }: CasingEditDialogProps) => {
    const [tempProfiles, setTempProfiles] = useState<CasingProfile[]>(JSON.parse(JSON.stringify(profiles)));
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingData, setEditingData] = useState<Partial<CasingProfile>>({});

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditingData({ ...tempProfiles[index] });
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingData({});
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null && editingData) {
            const updated = [...tempProfiles];
            updated[editingIndex] = { ...updated[editingIndex], ...editingData };
            setTempProfiles(updated);
            setEditingIndex(null);
            setEditingData({});
        }
    };

    const handleInputChange = (field: keyof CasingProfile, value: string) => {
        setEditingData({ ...editingData, [field]: value });
    };

    const handleAdd = () => {
        const newProfile: CasingProfile = {
            index: tempProfiles.length,
            size: '',
            type: 'casing',
            description: ''
        };
        setTempProfiles([...tempProfiles, newProfile]);
        setEditingIndex(tempProfiles.length);
        setEditingData(newProfile);
    };

    const handleDelete = (index: number) => {
        if (window.confirm('Are you sure you want to delete this casing profile?')) {
            const updated = tempProfiles.filter((_, i) => i !== index);
            setTempProfiles(updated);
            if (editingIndex === index) {
                setEditingIndex(null);
                setEditingData({});
            }
        }
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newProfiles = [...tempProfiles];
        [newProfiles[index - 1], newProfiles[index]] = [newProfiles[index], newProfiles[index - 1]];
        setTempProfiles(newProfiles);
    };

    const moveDown = (index: number) => {
        if (index === tempProfiles.length - 1) return;
        const newProfiles = [...tempProfiles];
        [newProfiles[index + 1], newProfiles[index]] = [newProfiles[index], newProfiles[index + 1]];
        setTempProfiles(newProfiles);
    };

    const handleSave = async () => {
        const profilesToSave = tempProfiles.map((p, idx) => ({ ...p, index: idx }));
        await onSave(profilesToSave);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit Casing Profiles</DialogTitle>
            <DialogContent>
                <div className="casing-edit-list">
                    {tempProfiles.length === 0 && (
                        <Typography variant="body2" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                            No casing profiles. Click "Add" to create one.
                        </Typography>
                    )}
                    {tempProfiles.map((profile, idx) => (
                        <div key={idx} className="casing-edit-row">
                            {editingIndex === idx ? (
                                // Edit Mode - Full width inputs using flexbox
                                <div className="casing-edit-fields">
                                    <div className="edit-field-group">
                                        <TextField
                                            size="medium"
                                            label="Size"
                                            value={editingData.size || ''}
                                            onChange={(e) => handleInputChange('size', e.target.value)}
                                            fullWidth
                                            autoFocus
                                        />
                                    </div>
                                    <div className="edit-field-group">
                                        <FormControl size="medium" fullWidth>
                                            <InputLabel>Type</InputLabel>
                                            <Select
                                                value={editingData.type || 'casing'}
                                                label="Type"
                                                onChange={(e) => handleInputChange('type', e.target.value)}
                                            >
                                                <MenuItem value="casing">Casing</MenuItem>
                                                <MenuItem value="liner">Liner</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="edit-field-group">
                                        <TextField
                                            size="medium"
                                            label="Description"
                                            value={editingData.description || ''}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="edit-actions-group">
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
                                <div className="casing-edit-row-content">
                                    <div className="view-field-group">
                                        <span className="casing-edit-size">{profile.size || '—'}</span>
                                    </div>
                                    <div className="view-field-group">
                                        <span className="casing-edit-type">{profile.type}</span>
                                    </div>
                                    <div className="view-field-group">
                                        <span className="casing-edit-desc">{profile.description || '—'}</span>
                                    </div>
                                    <div className="view-actions-group">
                                        <IconButton size="medium" onClick={() => moveUp(idx)} disabled={idx === 0}>
                                            <ArrowUpward fontSize="medium" />
                                        </IconButton>
                                        <IconButton size="medium" onClick={() => moveDown(idx)} disabled={idx === tempProfiles.length - 1}>
                                            <ArrowDownward fontSize="medium" />
                                        </IconButton>
                                        <IconButton size="medium" onClick={() => handleEdit(idx)} color="primary">
                                            <EditIcon fontSize="medium" />
                                        </IconButton>
                                        <IconButton size="medium" onClick={() => handleDelete(idx)} color="error">
                                            <Delete fontSize="medium" />
                                        </IconButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <Button 
                    size="large" 
                    startIcon={<Add />} 
                    onClick={handleAdd} 
                    variant="outlined"
                    sx={{ mt: 2, textTransform: 'none' }}
                >
                    Add Casing/Liner
                </Button>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} size="large">Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary" size="large">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CasingEditDialog;