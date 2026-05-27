// src/components/SupplyVessels/CargoVesselsSection.tsx
import { useState } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

export interface CargoItem {
    id: string;
    name: string;
}

export interface CargoVessel {
    id: string;
    name: string;
    arrivalDate: string;
    containers: CargoItem[];
}

interface CargoVesselsSectionProps {
    readOnly?: boolean;
}

const formatDateToDisplay = (dateString: string): string => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    } catch {
        return dateString;
    }
};

const CargoVesselsSection = ({ readOnly = false }: CargoVesselsSectionProps) => {
    const [cargoVessels, setCargoVessels] = useState<CargoVessel[]>([
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
    
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingVessel, setEditingVessel] = useState<CargoVessel | null>(null);
    const [tempName, setTempName] = useState('');
    const [tempDate, setTempDate] = useState('');
    const [tempContainers, setTempContainers] = useState<CargoItem[]>([]);

    const handleAddVessel = () => {
        const newVessel: CargoVessel = {
            id: Date.now().toString(),
            name: 'NEW VESSEL',
            arrivalDate: new Date().toISOString().split('T')[0],
            containers: []
        };
        setCargoVessels([...cargoVessels, newVessel]);
        handleEditVessel(newVessel);
    };

    const handleEditVessel = (vessel: CargoVessel) => {
        setEditingVessel(vessel);
        setTempName(vessel.name);
        setTempDate(vessel.arrivalDate);
        setTempContainers([...vessel.containers]);
        setEditDialogOpen(true);
    };

    const handleSaveVessel = () => {
        if (editingVessel) {
            const updatedVessel = {
                ...editingVessel,
                name: tempName,
                arrivalDate: tempDate,
                containers: tempContainers
            };
            setCargoVessels(cargoVessels.map(v => v.id === editingVessel.id ? updatedVessel : v));
            setEditDialogOpen(false);
            setEditingVessel(null);
        }
    };

    const handleDeleteVessel = () => {
        if (editingVessel && window.confirm('Are you sure you want to delete this cargo vessel?')) {
            setCargoVessels(cargoVessels.filter(v => v.id !== editingVessel.id));
            setEditDialogOpen(false);
            setEditingVessel(null);
        }
    };

    const handleAddContainer = () => {
        setTempContainers([...tempContainers, { id: Date.now().toString(), name: 'New Cargo' }]);
    };

    const handleUpdateContainer = (index: number, name: string) => {
        const updated = [...tempContainers];
        updated[index] = { ...updated[index], name };
        setTempContainers(updated);
    };

    const handleRemoveContainer = (index: number) => {
        setTempContainers(tempContainers.filter((_, i) => i !== index));
    };

    // Group by arrival date
    const groupedVessels = cargoVessels.reduce((groups, vessel) => {
        const date = vessel.arrivalDate;
        if (!groups[date]) groups[date] = [];
        groups[date].push(vessel);
        return groups;
    }, {} as Record<string, CargoVessel[]>);

    const sortedDates = Object.keys(groupedVessels).sort();

    return (
        <div className="cargo-section-compact">
            <div className="cargo-header-compact">
                <span className="cargo-title-compact">CARGO</span>
                {!readOnly && (
                    <IconButton size="small" onClick={handleAddVessel} className="add-cargo-compact" title="Add Cargo Vessel">
                        <Add fontSize="small" />
                    </IconButton>
                )}
            </div>
            <div className="cargo-scroll-horizontal">
                {sortedDates.map(date => (
                    <div key={date} className="cargo-date-group-compact">
                        <div className="cargo-date-vertical-compact">
                            <span>{formatDateToDisplay(date)}</span>
                        </div>
                        <div className="cargo-vessels-row">
                            {groupedVessels[date].map(vessel => (
                                <div key={vessel.id} className="cargo-vessel-compact">
                                    <div className="cargo-containers-stack">
                                        {vessel.containers.slice(0, 4).map(container => (
                                            <div key={container.id} className="cargo-container-stack-item">
                                                <span>{container.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="cargo-vessel-footer-compact">
                                        <span className="cargo-vessel-name-compact">{vessel.name}</span>
                                        {!readOnly && (
                                            <IconButton size="small" onClick={() => handleEditVessel(vessel)} className="cargo-edit-compact">
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Cargo Vessel</DialogTitle>
                <DialogContent>
                    <TextField label="Vessel Name" fullWidth margin="dense" value={tempName} onChange={(e) => setTempName(e.target.value)} />
                    <TextField label="Arrival Date" type="date" fullWidth margin="dense" value={tempDate} onChange={(e) => setTempDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Containers:</Typography>
                    {tempContainers.map((container, idx) => (
                        <div key={container.id} className="cargo-container-edit-row">
                            <TextField size="small" value={container.name} onChange={(e) => handleUpdateContainer(idx, e.target.value)} fullWidth />
                            <IconButton onClick={() => handleRemoveContainer(idx)} color="error">
                                <Delete fontSize="small" />
                            </IconButton>
                        </div>
                    ))}
                    <Button startIcon={<Add />} onClick={handleAddContainer} size="small" sx={{ mt: 1 }}>Add Container</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteVessel} color="error">Delete Vessel</Button>
                    <Button onClick={handleSaveVessel} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CargoVesselsSection;