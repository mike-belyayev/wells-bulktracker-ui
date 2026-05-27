// src/components/SupplyVessels/CargoVesselsSection.tsx (updated)
import { useState, useEffect } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

// Updated to match database schema
export interface CargoVessel {
    _id?: string;  // MongoDB ID
    vesselName: string;  // Changed from 'name' to 'vesselName'
    arrivalDate: string;
    cargoDetails: string[];  // Changed from 'containers' to 'cargoDetails' (array of strings)
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
        // Try to parse existing format
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
        // Try ISO format
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
    // If already in correct format, return as is
    if (dateString.match(/^\d{2}-[A-Za-z]{3}-\d{2}$/)) {
        return dateString;
    }
    // Convert from YYYY-MM-DD to DD-MMM-YY
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
    const [tempCargoDetails, setTempCargoDetails] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update local state when props change
    useEffect(() => {
        console.log('CargoVesselsSection received data:', cargoVesselsData);
        setCargoVessels(cargoVesselsData);
    }, [cargoVesselsData]);

    const handleAddVessel = () => {
        const newVessel: CargoVessel = {
            vesselName: 'NEW VESSEL',
            arrivalDate: new Date().toISOString().split('T')[0],
            cargoDetails: []
        };
        setCargoVessels([...cargoVessels, newVessel]);
        handleEditVessel(newVessel);
    };

    const handleEditVessel = (vessel: CargoVessel) => {
        setEditingVessel(vessel);
        setTempName(vessel.vesselName);
        setTempDate(formatDateForInput(vessel.arrivalDate));
        setTempCargoDetails(vessel.cargoDetails ? [...vessel.cargoDetails] : []);
        setEditDialogOpen(true);
        setError(null);
    };

    const handleSaveVessel = async () => {
        if (!editingVessel) return;
        
        setSaving(true);
        setError(null);
        
        try {
            const updatedVessel = {
                ...editingVessel,
                vesselName: tempName,
                arrivalDate: formatDateForSave(tempDate),
                cargoDetails: tempCargoDetails
            };
            
            let updatedVessels: CargoVessel[];
            
            const index = cargoVessels.findIndex(v => v._id === editingVessel._id);
            if (index !== -1) {
                updatedVessels = [...cargoVessels];
                updatedVessels[index] = updatedVessel;
            } else {
                updatedVessels = [...cargoVessels, updatedVessel];
            }
            
            setCargoVessels(updatedVessels);
            
            if (onCargoUpdate && wellId) {
                await onCargoUpdate(updatedVessels);
            }
            
            setEditDialogOpen(false);
            setEditingVessel(null);
        } catch (err) {
            console.error('Failed to save cargo vessel:', err);
            setError('Failed to save vessel. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVessel = async () => {
        if (!editingVessel) return;
        
        if (!window.confirm('Are you sure you want to delete this cargo vessel?')) {
            return;
        }
        
        setSaving(true);
        setError(null);
        
        try {
            const updatedVessels = cargoVessels.filter(v => v._id !== editingVessel._id);
            setCargoVessels(updatedVessels);
            
            if (onCargoUpdate && wellId) {
                await onCargoUpdate(updatedVessels);
            }
            
            setEditDialogOpen(false);
            setEditingVessel(null);
        } catch (err) {
            console.error('Failed to delete cargo vessel:', err);
            setError('Failed to delete vessel. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddCargoDetail = () => {
        setTempCargoDetails([...tempCargoDetails, '']);
    };

    const handleUpdateCargoDetail = (index: number, value: string) => {
        const updated = [...tempCargoDetails];
        updated[index] = value;
        setTempCargoDetails(updated);
    };

    const handleRemoveCargoDetail = (index: number) => {
        setTempCargoDetails(tempCargoDetails.filter((_, i) => i !== index));
    };

    // Group by arrival date
    const groupedVessels = cargoVessels.reduce((groups, vessel) => {
        const date = vessel.arrivalDate;
        if (!groups[date]) groups[date] = [];
        groups[date].push(vessel);
        return groups;
    }, {} as Record<string, CargoVessel[]>);

    const sortedDates = Object.keys(groupedVessels).sort();

    // Helper to arrange cargo details in 2-column grid
    const arrangeCargoDetails = (cargoDetails: string[] = []) => {
        if (!cargoDetails || cargoDetails.length === 0) return [];
        const columns: string[][] = [];
        for (let i = 0; i < cargoDetails.length; i += 2) {
            columns.push(cargoDetails.slice(i, i + 2));
        }
        return columns;
    };

    return (
        <div className="cargo-section-ultra-compact">
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
                    {error}
                </Alert>
            )}
            
            <div className="cargo-scroll-horizontal">
                {sortedDates.map(date => (
                    <div key={date} className="cargo-date-group-ultra">
                        <div className="cargo-date-vertical-ultra">
                            <span>{formatDateToDisplay(date)}</span>
                        </div>
                        <div className="cargo-vessels-row-ultra">
                            {groupedVessels[date].map(vessel => {
                                const cargoColumns = arrangeCargoDetails(vessel.cargoDetails);
                                const hasCargo = cargoColumns && cargoColumns.length > 0;
                                
                                return (
                                    <div key={vessel._id || vessel.vesselName} className="cargo-vessel-ultra">
                                        <div className="cargo-containers-grid-ultra">
                                            {hasCargo ? (
                                                cargoColumns.map((column, colIdx) => (
                                                    <div key={colIdx} className="cargo-container-column">
                                                        {column.map((cargo, idx) => (
                                                            <div key={idx} className="cargo-container-stack-item-ultra">
                                                                <span>{cargo}</span>
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
                                            <span className="cargo-vessel-name-ultra">{vessel.vesselName}</span>
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
            <Dialog open={editDialogOpen} onClose={() => !saving && setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Cargo Vessel</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField 
                        label="Vessel Name" 
                        fullWidth 
                        margin="dense" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)} 
                        disabled={saving}
                    />
                    <TextField 
                        label="Arrival Date" 
                        type="date" 
                        fullWidth 
                        margin="dense" 
                        value={tempDate} 
                        onChange={(e) => setTempDate(e.target.value)} 
                        InputLabelProps={{ shrink: true }} 
                        disabled={saving}
                    />
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Cargo Details:</Typography>
                    {tempCargoDetails.length === 0 && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            No cargo items. Click "Add Cargo" to add one.
                        </Typography>
                    )}
                    {tempCargoDetails.map((cargo, idx) => (
                        <div key={idx} className="cargo-container-edit-row">
                            <TextField 
                                size="small" 
                                label={`Cargo ${idx + 1}`}
                                value={cargo} 
                                onChange={(e) => handleUpdateCargoDetail(idx, e.target.value)} 
                                fullWidth 
                                disabled={saving}
                            />
                            <IconButton onClick={() => handleRemoveCargoDetail(idx)} color="error" disabled={saving}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </div>
                    ))}
                    <Button startIcon={<Add />} onClick={handleAddCargoDetail} size="small" sx={{ mt: 1 }} disabled={saving}>
                        Add Cargo
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>Cancel</Button>
                    <Button onClick={handleDeleteVessel} color="error" disabled={saving}>Delete Vessel</Button>
                    <Button onClick={handleSaveVessel} variant="contained" color="primary" disabled={saving}>
                        {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CargoVesselsSection;