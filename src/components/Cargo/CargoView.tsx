// src/components/Cargo/CargoView.tsx
import { useState } from 'react';
import { 
    Typography, IconButton, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, Button, Box 
} from '@mui/material';
import { Add, Delete, CalendarToday, DeleteOutline, Edit } from '@mui/icons-material';
import './CargoView.css';

export interface CargoItem {
    id: string;
    name: string;
}

export interface Boat {
    id: string;
    name: string;
    arrivalDate: string;
    containers: CargoItem[];
}

interface CargoViewProps {
    wellId?: string;
    onSave?: (boat: Boat) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    readOnly?: boolean;
}

const CargoView = ({ wellId, onSave, onDelete, readOnly = false }: CargoViewProps) => {
    const [boats, setBoats] = useState<Boat[]>([
        {
            id: '1',
            name: 'VOYAGER',
            arrivalDate: '2025-01-20',
            containers: [
                { id: 'c1', name: 'Pipe' },
                { id: 'c2', name: 'Casing' }
            ]
        },
        {
            id: '2',
            name: 'PACIFIC',
            arrivalDate: '2025-01-20',
            containers: [
                { id: 'c3', name: 'Barite' },
                { id: 'c4', name: 'Bentonite' }
            ]
        },
        {
            id: '3',
            name: 'ATLANTIC',
            arrivalDate: '2025-01-22',
            containers: [
                { id: 'c6', name: 'Fuel Oil' }
            ]
        }
    ]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBoat, setEditingBoat] = useState<Boat | null>(null);
    const [newBoatName, setNewBoatName] = useState('');
    const [newBoatDate, setNewBoatDate] = useState(new Date().toISOString().split('T')[0]);

    const addContainer = (boatId: string) => {
        const newContainer: CargoItem = {
            id: Date.now().toString(),
            name: 'Cargo'
        };
        setBoats(boats.map(boat => 
            boat.id === boatId 
                ? { ...boat, containers: [...boat.containers, newContainer] }
                : boat
        ));
    };

    const removeContainer = (boatId: string, containerId: string) => {
        setBoats(boats.map(boat =>
            boat.id === boatId
                ? { ...boat, containers: boat.containers.filter(c => c.id !== containerId) }
                : boat
        ));
    };

    const updateContainerName = (boatId: string, containerId: string, name: string) => {
        setBoats(boats.map(boat =>
            boat.id === boatId
                ? {
                    ...boat,
                    containers: boat.containers.map(c =>
                        c.id === containerId ? { ...c, name } : c
                    )
                  }
                : boat
        ));
    };

    const handleAddBoat = () => {
        setEditingBoat(null);
        setNewBoatName('');
        setNewBoatDate(new Date().toISOString().split('T')[0]);
        setDialogOpen(true);
    };

    const handleEditBoat = (boat: Boat) => {
        setEditingBoat(boat);
        setNewBoatName(boat.name);
        setNewBoatDate(boat.arrivalDate);
        setDialogOpen(true);
    };

    const handleSaveBoat = async () => {
        if (newBoatName.trim()) {
            if (editingBoat) {
                // Update existing boat
                const updatedBoat = { ...editingBoat, name: newBoatName, arrivalDate: newBoatDate };
                setBoats(boats.map(b => b.id === editingBoat.id ? updatedBoat : b));
                if (onSave) await onSave(updatedBoat);
            } else {
                // Add new boat
                const newBoat: Boat = {
                    id: Date.now().toString(),
                    name: newBoatName.toUpperCase(),
                    arrivalDate: newBoatDate,
                    containers: []
                };
                setBoats([...boats, newBoat]);
                if (onSave) await onSave(newBoat);
            }
            setDialogOpen(false);
        }
    };

    const removeBoat = async (boatId: string) => {
        if (window.confirm('Are you sure you want to delete this vessel?')) {
            setBoats(boats.filter(b => b.id !== boatId));
            if (onDelete) await onDelete(boatId);
        }
    };

    const groupedBoats = boats.reduce((groups, boat) => {
        const date = boat.arrivalDate;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(boat);
        return groups;
    }, {} as Record<string, Boat[]>);

    const sortedDates = Object.keys(groupedBoats).sort();

    return (
        <div className="cargo-container">
            <div className="cargo-date-bar">
                {sortedDates.map((date, idx) => (
                    <div key={date} className="cargo-date-group" style={{ marginLeft: idx === 0 ? 0 : '1px' }}>
                        <div className="cargo-date-header">
                            <CalendarToday className="cargo-date-icon" />
                            <span className="cargo-date-text">{date}</span>
                        </div>
                        <div className="cargo-boats-horizontal">
                            {groupedBoats[date].map(boat => (
                                <div key={boat.id} className="cargo-boat">
                                    <div className="boat-top" onClick={() => handleEditBoat(boat)}>
                                        <span className="boat-name">{boat.name}</span>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); removeBoat(boat.id); }}
                                            className="boat-delete"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </div>
                                    <div className="boat-containers">
                                        {boat.containers.map(container => (
                                            <div key={container.id} className="cargo-chip">
                                                <input
                                                    type="text"
                                                    value={container.name}
                                                    onChange={(e) => updateContainerName(boat.id, container.id, e.target.value)}
                                                    className="cargo-text"
                                                    placeholder="Cargo"
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeContainer(boat.id, container.id)}
                                                    className="chip-delete"
                                                >
                                                    <DeleteOutline fontSize="small" />
                                                </IconButton>
                                            </div>
                                        ))}
                                        <IconButton
                                            size="small"
                                            onClick={() => addContainer(boat.id)}
                                            className="add-cargo-chip"
                                        >
                                            <Add fontSize="small" />
                                        </IconButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddBoat}
                className="add-cargo-boat-btn"
            >
                ADD VESSEL
            </Button>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingBoat ? 'Edit Vessel' : 'Add New Cargo Vessel'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Vessel Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newBoatName}
                        onChange={(e) => setNewBoatName(e.target.value.toUpperCase())}
                        placeholder="e.g., OCEAN VOYAGER"
                    />
                    <TextField
                        margin="dense"
                        label="Arrival Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={newBoatDate}
                        onChange={(e) => setNewBoatDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveBoat} variant="contained" color="primary">
                        {editingBoat ? 'Save Changes' : 'Add Vessel'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CargoView;