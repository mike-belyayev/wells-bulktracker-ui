// src/components/SupplyVessels/CargoVesselsSection.tsx
import { useState, useEffect } from 'react';
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
    wellId?: string;
    readOnly?: boolean;
    cargoVesselsData?: CargoVessel[];
    onCargoUpdate?: (vessels: CargoVessel[]) => Promise<void>;
}

// Date formatting helpers
const formatDateToDisplay = (dateString: string): string => {
    if (!dateString) return '—';
    try {
        let year: number, month: number, day: number;
        
        if (dateString.includes('T')) {
            const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                year = parseInt(match[1]);
                month = parseInt(match[2]) - 1;
                day = parseInt(match[3]);
            } else {
                const date = new Date(dateString);
                year = date.getFullYear();
                month = date.getMonth();
                day = date.getDate();
            }
        } else {
            const date = new Date(dateString);
            year = date.getFullYear();
            month = date.getMonth();
            day = date.getDate();
        }
        
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const displayDay = String(day).padStart(2, '0');
        const displayMonth = monthNames[month];
        const displayYear = String(year).slice(-2);
        
        return `${displayDay}-${displayMonth}-${displayYear}`;
    } catch {
        return dateString;
    }
};

const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const match = dateString.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
        if (match) {
            const monthMap: { [key: string]: string } = {
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
                'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
                'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            const month = monthMap[match[2].toUpperCase()];
            if (month) {
                const fullYear = `20${match[3]}`;
                return `${fullYear}-${month}-${match[1]}`;
            }
        }
        const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        }
    } catch (e) {
        console.error('Date parsing error:', e);
    }
    return '';
};

const formatDateForSave = (dateString: string): string => {
    if (!dateString) return '';
    if (dateString.match(/^\d{2}-[A-Za-z]{3}-\d{2}$/)) {
        return dateString;
    }
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const monthMap: { [key: string]: string } = {
            '01': 'JAN', '02': 'FEB', '03': 'MAR', '04': 'APR',
            '05': 'MAY', '06': 'JUN', '07': 'JUL', '08': 'AUG',
            '09': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DEC'
        };
        const month = monthMap[match[2]];
        if (month) {
            const year = match[1].slice(-2);
            return `${match[3]}-${month}-${year}`;
        }
    }
    return dateString;
};

const CargoVesselsSection = ({ 
    wellId, 
    readOnly = false, 
    cargoVesselsData = [],
    onCargoUpdate 
}: CargoVesselsSectionProps) => {
    const [cargoVessels, setCargoVessels] = useState<CargoVessel[]>(cargoVesselsData);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingVessel, setEditingVessel] = useState<CargoVessel | null>(null);
    const [tempName, setTempName] = useState('');
    const [tempDate, setTempDate] = useState('');
    const [tempContainers, setTempContainers] = useState<CargoItem[]>([]);

    // Update local state when props change
    useEffect(() => {
        setCargoVessels(cargoVesselsData);
    }, [cargoVesselsData]);

    const handleAddVessel = () => {
        const newVessel: CargoVessel = {
            id: Date.now().toString(),
            name: 'NEW',
            arrivalDate: new Date().toISOString().split('T')[0],
            containers: []
        };
        setCargoVessels([...cargoVessels, newVessel]);
        handleEditVessel(newVessel);
    };

    const handleEditVessel = (vessel: CargoVessel) => {
        setEditingVessel(vessel);
        setTempName(vessel.name);
        setTempDate(formatDateForInput(vessel.arrivalDate));
        setTempContainers(vessel.containers ? [...vessel.containers] : []);
        setEditDialogOpen(true);
    };

    const handleSaveVessel = async () => {
        if (editingVessel) {
            const updatedVessel = {
                ...editingVessel,
                name: tempName,
                arrivalDate: formatDateForSave(tempDate),
                containers: tempContainers
            };
            
            let updatedVessels: CargoVessel[];
            
            if (cargoVessels.find(v => v.id === editingVessel.id)) {
                updatedVessels = cargoVessels.map(v => v.id === editingVessel.id ? updatedVessel : v);
            } else {
                updatedVessels = [...cargoVessels, updatedVessel];
            }
            
            setCargoVessels(updatedVessels);
            
            if (onCargoUpdate && wellId) {
                try {
                    await onCargoUpdate(updatedVessels);
                } catch (err) {
                    console.error('Failed to save cargo vessel:', err);
                }
            }
            
            setEditDialogOpen(false);
            setEditingVessel(null);
        }
    };

    const handleDeleteVessel = async () => {
        if (editingVessel && window.confirm('Are you sure you want to delete this cargo vessel?')) {
            const updatedVessels = cargoVessels.filter(v => v.id !== editingVessel.id);
            setCargoVessels(updatedVessels);
            
            if (onCargoUpdate && wellId) {
                try {
                    await onCargoUpdate(updatedVessels);
                } catch (err) {
                    console.error('Failed to delete cargo vessel:', err);
                }
            }
            
            setEditDialogOpen(false);
            setEditingVessel(null);
        }
    };

    const handleAddContainer = () => {
        setTempContainers([...tempContainers, { id: Date.now().toString(), name: 'Cargo' }]);
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

    // Helper to arrange containers in 2-column grid
    const arrangeContainers = (containers: CargoItem[] = []) => {
        if (!containers || containers.length === 0) return [];
        const columns: CargoItem[][] = [];
        for (let i = 0; i < containers.length; i += 2) {
            columns.push(containers.slice(i, i + 2));
        }
        return columns;
    };

    return (
        <div className="cargo-section-ultra-compact">
            <div className="cargo-scroll-horizontal">
                {sortedDates.map(date => (
                    <div key={date} className="cargo-date-group-ultra">
                        <div className="cargo-date-vertical-ultra">
                            <span>{formatDateToDisplay(date)}</span>
                        </div>
                        <div className="cargo-vessels-row-ultra">
                            {groupedVessels[date].map(vessel => {
                                const containerColumns = arrangeContainers(vessel.containers);
                                const hasContainers = containerColumns && containerColumns.length > 0;
                                
                                return (
                                    <div key={vessel.id} className="cargo-vessel-ultra">
                                        <div className="cargo-containers-grid-ultra">
                                            {hasContainers ? (
                                                containerColumns.map((column, colIdx) => (
                                                    <div key={colIdx} className="cargo-container-column">
                                                        {column.map(container => (
                                                            <div key={container.id} className="cargo-container-stack-item-ultra">
                                                                <span>{container.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="cargo-container-column">
                                                    <div className="cargo-container-stack-item-ultra empty">
                                                        <span>—</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="cargo-vessel-footer-ultra">
                                            <span className="cargo-vessel-name-ultra">{vessel.name}</span>
                                            {!readOnly && (
                                                <IconButton size="small" onClick={() => handleEditVessel(vessel)} className="cargo-edit-ultra">
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {/* Single Add Vessel button at the far right */}
                {!readOnly && (
                    <div className="cargo-add-vessel-container">
                        <IconButton onClick={handleAddVessel} className="cargo-add-vessel-btn" title="Add Cargo Vessel">
                            <Add />
                        </IconButton>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Cargo Vessel</DialogTitle>
                <DialogContent>
                    <TextField 
                        label="Vessel Name" 
                        fullWidth 
                        margin="dense" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)} 
                    />
                    <TextField 
                        label="Arrival Date" 
                        type="date" 
                        fullWidth 
                        margin="dense" 
                        value={tempDate} 
                        onChange={(e) => setTempDate(e.target.value)} 
                        InputLabelProps={{ shrink: true }} 
                    />
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Containers:</Typography>
                    {tempContainers.length === 0 && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            No containers. Click "Add Container" to add one.
                        </Typography>
                    )}
                    {tempContainers.map((container, idx) => (
                        <div key={container.id} className="cargo-container-edit-row">
                            <TextField 
                                size="small" 
                                value={container.name} 
                                onChange={(e) => handleUpdateContainer(idx, e.target.value)} 
                                fullWidth 
                            />
                            <IconButton onClick={() => handleRemoveContainer(idx)} color="error">
                                <Delete fontSize="small" />
                            </IconButton>
                        </div>
                    ))}
                    <Button startIcon={<Add />} onClick={handleAddContainer} size="small" sx={{ mt: 1 }}>
                        Add Container
                    </Button>
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