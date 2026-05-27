// src/components/SupplyVessels/SupplyVesselsTable.tsx
import { useState, useEffect } from 'react';
import {
    Paper, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, TextField, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import { Edit, Add, Delete, Save, Cancel, ArrowUpward, ArrowDownward, ViewColumn } from '@mui/icons-material';
import CargoVesselsSection, { type CargoVessel } from './CargoVesselsSection';
import './SupplyVesselsTable.css';

// Types
export interface SupplyVessel {
    id: string;
    vessel: string;
    location: string;
    crewChange: string;
    fuelOil: number;
    potWater: number;
    drlWater: number;
    barite: number;
    baseOil: number;
    cementG: number;
    [key: string]: any;
}

export interface DynamicColumn {
    name: string;
    key: string;
    unit?: string;
}

export interface SupplyVesselsTableProps {
    vessels: SupplyVessel[];
    cargoVessels?: CargoVessel[];
    wellId?: string;
    onVesselsChange: (vessels: SupplyVessel[]) => void;
    onCargoUpdate?: (vessels: CargoVessel[]) => Promise<void>;
    onSave?: (vessel: SupplyVessel) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    readOnly?: boolean;
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

const SupplyVesselsTable = ({ 
    vessels, 
    cargoVessels = [],  // Add cargoVessels prop with default empty array
    wellId,
    onVesselsChange, 
    onCargoUpdate,      // Add onCargoUpdate prop
    onSave, 
    readOnly = false 
}: SupplyVesselsTableProps) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [tempVessels, setTempVessels] = useState<SupplyVessel[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingData, setEditingData] = useState<Partial<SupplyVessel>>({});
    const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([]);
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnUnit, setNewColumnUnit] = useState('');

    useEffect(() => {
        const allKeys = new Set<string>();
        vessels.forEach(vessel => {
            Object.keys(vessel).forEach(key => {
                if (!['id', 'vessel', 'location', 'crewChange', 'fuelOil', 'potWater', 
                       'drlWater', 'barite', 'baseOil', 'cementG'].includes(key)) {
                    allKeys.add(key);
                }
            });
        });
        
        const columns = Array.from(allKeys).map(key => ({
            name: key.charAt(0).toUpperCase() + key.replace(/_/g, ' '),
            key: key,
            unit: extractUnit(key)
        }));
        
        setDynamicColumns(columns);
    }, [vessels]);

    const extractUnit = (key: string): string => {
        if (key.includes('oil') || key.includes('fuel')) return 'bbl';
        if (key.includes('water')) return 'bbl';
        if (key.includes('barite') || key.includes('cement')) return 'mt';
        return '';
    };

    const handleEditClick = () => {
        setTempVessels(JSON.parse(JSON.stringify(vessels)));
        setEditingIndex(null);
        setEditDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditDialogOpen(false);
        setEditingIndex(null);
        setEditingData({});
    };

    const handleSaveVessels = async () => {
        const updatedVessels = tempVessels.map((v, idx) => ({ ...v, id: v.id || idx.toString() }));
        onVesselsChange(updatedVessels);
        if (onSave) {
            for (const vessel of updatedVessels) {
                await onSave(vessel);
            }
        }
        handleCloseDialog();
    };

    const handleEditVessel = (index: number) => {
        setEditingIndex(index);
        setEditingData({ ...tempVessels[index] });
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingData({});
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null && editingData) {
            const updated = [...tempVessels];
            updated[editingIndex] = { 
                ...updated[editingIndex], 
                ...editingData,
                crewChange: formatDateForSave(editingData.crewChange || '')
            };
            setTempVessels(updated);
            setEditingIndex(null);
            setEditingData({});
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setEditingData({ ...editingData, [field]: value });
    };

    const handleAddVessel = () => {
        const newVessel: SupplyVessel = {
            id: Date.now().toString(),
            vessel: 'New Vessel',
            location: '',
            crewChange: '',
            fuelOil: 0,
            potWater: 0,
            drlWater: 0,
            barite: 0,
            baseOil: 0,
            cementG: 0
        };
        dynamicColumns.forEach(col => {
            newVessel[col.key] = '';
        });
        setTempVessels([...tempVessels, newVessel]);
        setEditingIndex(tempVessels.length);
        setEditingData(newVessel);
    };

    const handleDeleteVessel = (index: number) => {
        if (window.confirm('Are you sure you want to delete this supply vessel?')) {
            const updated = tempVessels.filter((_, i) => i !== index);
            setTempVessels(updated);
            if (editingIndex === index) {
                setEditingIndex(null);
                setEditingData({});
            }
        }
    };

    const moveVesselUp = (index: number) => {
        if (index === 0) return;
        const newVessels = [...tempVessels];
        [newVessels[index - 1], newVessels[index]] = [newVessels[index], newVessels[index - 1]];
        setTempVessels(newVessels);
    };

    const moveVesselDown = (index: number) => {
        if (index === tempVessels.length - 1) return;
        const newVessels = [...tempVessels];
        [newVessels[index + 1], newVessels[index]] = [newVessels[index], newVessels[index + 1]];
        setTempVessels(newVessels);
    };

    const handleAddColumn = () => {
        if (newColumnName.trim()) {
            const newKey = newColumnName.toLowerCase().replace(/\s+/g, '_');
            const newColumn: DynamicColumn = {
                name: newColumnName,
                key: newKey,
                unit: newColumnUnit
            };
            setDynamicColumns([...dynamicColumns, newColumn]);
            
            const updatedVessels = tempVessels.map(vessel => ({
                ...vessel,
                [newKey]: ''
            }));
            setTempVessels(updatedVessels);
            
            setColumnDialogOpen(false);
            setNewColumnName('');
            setNewColumnUnit('');
        }
    };

    return (
        <Paper className="vessels-panel" elevation={3}>
            {/* Cargo Vessels Section - on top */}
            <CargoVesselsSection 
                wellId={wellId}
                readOnly={readOnly}
                cargoVesselsData={cargoVessels}
                onCargoUpdate={onCargoUpdate}
            />
            
            <Divider />
            
            {/* Supply Vessels Table */}
            <TableContainer className="vessels-table-container">
                <Table stickyHeader size="small" className="vessels-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header-cell-inverted">VESSEL</TableCell>
                            <TableCell className="table-header-cell-inverted">LOCATION</TableCell>
                            <TableCell className="table-header-cell-inverted">CREW CHANGE</TableCell>
                            <TableCell className="table-header-cell-inverted" align="center">FUEL OIL (m³)</TableCell>
                            <TableCell className="table-header-cell-inverted" align="center">POT WATER (m³)</TableCell>
                            <TableCell className="table-header-cell-inverted" align="center">DRL WATER (m³)</TableCell>
                            <TableCell className="table-header-cell-inverted" align="center">BARITE (mt)</TableCell>
                            <TableCell className="table-header-cell-inverted" align="center">BASE OIL (m³)</TableCell>
                            <TableCell className="table-header-cell-inverted" align="center">CEMENT G (mt)</TableCell>
                            {dynamicColumns.map(col => (
                                <TableCell key={col.key} className="table-header-cell-inverted" align="center">
                                    {col.name} {col.unit && `(${col.unit})`}
                                </TableCell>
                            ))}
                            {!readOnly && (
                                <TableCell className="table-header-cell-inverted actions-header-cell" align="center">
                                    <IconButton size="small" onClick={handleEditClick} className="edit-table-icon" title="Edit Supply Vessels">
                                        <Edit fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vessels.map((vessel) => (
                            <TableRow key={vessel.id} hover>
                                <TableCell className="table-body-cell">{vessel.vessel}</TableCell>
                                <TableCell className="table-body-cell">{vessel.location || '—'}</TableCell>
                                <TableCell className="table-body-cell">{formatDateToDisplay(vessel.crewChange)}</TableCell>
                                <TableCell className={`table-body-cell ${(!vessel.fuelOil || vessel.fuelOil === 0) ? 'empty-cell' : ''}`} align="center">
                                    {vessel.fuelOil || '—'}
                                </TableCell>
                                <TableCell className={`table-body-cell ${(!vessel.potWater || vessel.potWater === 0) ? 'empty-cell' : ''}`} align="center">
                                    {vessel.potWater || '—'}
                                </TableCell>
                                <TableCell className={`table-body-cell ${(!vessel.drlWater || vessel.drlWater === 0) ? 'empty-cell' : ''}`} align="center">
                                    {vessel.drlWater || '—'}
                                </TableCell>
                                <TableCell className={`table-body-cell ${(!vessel.barite || vessel.barite === 0) ? 'empty-cell' : ''}`} align="center">
                                    {vessel.barite || '—'}
                                </TableCell>
                                <TableCell className={`table-body-cell ${(!vessel.baseOil || vessel.baseOil === 0) ? 'empty-cell' : ''}`} align="center">
                                    {vessel.baseOil || '—'}
                                </TableCell>
                                <TableCell className={`table-body-cell ${(!vessel.cementG || vessel.cementG === 0) ? 'empty-cell' : ''}`} align="center">
                                    {vessel.cementG || '—'}
                                </TableCell>
                                {dynamicColumns.map(col => (
                                    <TableCell key={col.key} className={`table-body-cell ${(!vessel[col.key]) ? 'empty-cell' : ''}`} align="center">
                                        {vessel[col.key] || '—'}
                                    </TableCell>
                                ))}
                                {!readOnly && <TableCell className="table-body-cell" align="center"></TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Supply Vessels Dialog */}
            <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Edit Supply Vessels
                    <IconButton onClick={() => setColumnDialogOpen(true)} size="small" title="Add Column">
                        <ViewColumn fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="supply-edit-list">
                        {tempVessels.map((vessel, idx) => (
                            <div key={vessel.id || idx} className="supply-edit-row">
                                {editingIndex === idx ? (
                                    <div className="supply-edit-fields">
                                        <TextField size="small" label="Vessel Name" value={editingData.vessel || ''} onChange={(e) => handleInputChange('vessel', e.target.value)} fullWidth />
                                        <TextField size="small" label="Location" value={editingData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} fullWidth />
                                        <TextField size="small" label="Crew Change" type="date" value={formatDateForInput(editingData.crewChange || '')} onChange={(e) => handleInputChange('crewChange', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                                        <TextField size="small" label="Fuel Oil" type="text" value={editingData.fuelOil || ''} onChange={(e) => handleInputChange('fuelOil', e.target.value)} fullWidth />
                                        <TextField size="small" label="Pot Water" type="text" value={editingData.potWater || ''} onChange={(e) => handleInputChange('potWater', e.target.value)} fullWidth />
                                        <TextField size="small" label="Drl Water" type="text" value={editingData.drlWater || ''} onChange={(e) => handleInputChange('drlWater', e.target.value)} fullWidth />
                                        <TextField size="small" label="Barite" type="text" value={editingData.barite || ''} onChange={(e) => handleInputChange('barite', e.target.value)} fullWidth />
                                        <TextField size="small" label="Base Oil" type="text" value={editingData.baseOil || ''} onChange={(e) => handleInputChange('baseOil', e.target.value)} fullWidth />
                                        <TextField size="small" label="Cement G" type="text" value={editingData.cementG || ''} onChange={(e) => handleInputChange('cementG', e.target.value)} fullWidth />
                                        {dynamicColumns.map(col => (
                                            <TextField key={col.key} size="small" label={col.name} value={editingData[col.key] || ''} onChange={(e) => handleInputChange(col.key, e.target.value)} fullWidth />
                                        ))}
                                        <div className="edit-actions">
                                            <IconButton onClick={handleSaveEdit} color="primary"><Save /></IconButton>
                                            <IconButton onClick={handleCancelEdit} color="secondary"><Cancel /></IconButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="supply-edit-row-content">
                                        <span className="supply-edit-value">{vessel.vessel}</span>
                                        <span className="supply-edit-value">{vessel.location || '—'}</span>
                                        <span className="supply-edit-value">{formatDateToDisplay(vessel.crewChange)}</span>
                                        <span className="supply-edit-number">{vessel.fuelOil}</span>
                                        <span className="supply-edit-number">{vessel.potWater}</span>
                                        <span className="supply-edit-number">{vessel.drlWater}</span>
                                        <span className="supply-edit-number">{vessel.barite}</span>
                                        <span className="supply-edit-number">{vessel.baseOil}</span>
                                        <span className="supply-edit-number">{vessel.cementG}</span>
                                        {dynamicColumns.map(col => (
                                            <span key={col.key} className="supply-edit-number">{vessel[col.key] || '—'}</span>
                                        ))}
                                        <div className="edit-actions">
                                            <IconButton onClick={() => moveVesselUp(idx)} disabled={idx === 0}><ArrowUpward /></IconButton>
                                            <IconButton onClick={() => moveVesselDown(idx)} disabled={idx === tempVessels.length - 1}><ArrowDownward /></IconButton>
                                            <IconButton onClick={() => handleEditVessel(idx)} color="primary"><Edit /></IconButton>
                                            <IconButton onClick={() => handleDeleteVessel(idx)} color="error"><Delete /></IconButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button startIcon={<Add />} onClick={handleAddVessel} variant="outlined" sx={{ mt: 2 }}>Add Supply Vessel</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveVessels} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Add Column Dialog */}
            <Dialog open={columnDialogOpen} onClose={() => setColumnDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Dynamic Column</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Column Name" fullWidth value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} />
                    <TextField margin="dense" label="Unit (optional)" fullWidth value={newColumnUnit} onChange={(e) => setNewColumnUnit(e.target.value)} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        This column will be added to all vessels. Enter values in edit mode.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setColumnDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddColumn} variant="contained" color="primary">Add Column</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SupplyVesselsTable;