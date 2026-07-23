// src/components/SupplyVessels/SupplyVesselsTable.tsx
import { useState, useEffect } from 'react';
import {
    Paper, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, TextField, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Typography,
    Tooltip
} from '@mui/material';
import { 
    Edit, 
    Add, 
    Delete, 
    Save, 
    Cancel, 
    ArrowUpward, 
    ArrowDownward,
    DriveFileRenameOutline
} from '@mui/icons-material';
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
    additionalFields?: {
        [key: string]: string | number;
    };
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

// Helper to generate a key from a name
const generateKey = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

const SupplyVesselsTable = ({ 
    vessels, 
    cargoVessels = [],
    wellId,
    onVesselsChange, 
    onCargoUpdate,
    onSave, 
    readOnly = false 
}: SupplyVesselsTableProps) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [tempVessels, setTempVessels] = useState<SupplyVessel[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingData, setEditingData] = useState<Partial<SupplyVessel>>({});
    const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([]);
    const [tempDynamicColumns, setTempDynamicColumns] = useState<DynamicColumn[]>([]); // Track columns in edit mode
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnUnit, setNewColumnUnit] = useState('');
    const [renamingColumn, setRenamingColumn] = useState<string | null>(null);
    const [renameColumnName, setRenameColumnName] = useState('');

    // Extract dynamic columns from vessels - ONLY if at least one vessel has a value
    useEffect(() => {
        const columnMap = new Map<string, { name: string; key: string; unit: string; hasValue: boolean }>();
        
        vessels.forEach(vessel => {
            if (vessel.additionalFields) {
                Object.keys(vessel.additionalFields).forEach(key => {
                    const value = vessel.additionalFields?.[key];
                    // Check if this column has a non-empty value
                    const hasValue = value !== undefined && value !== null && value !== '' && value !== 0;
                    
                    if (!columnMap.has(key)) {
                        // Initialize column with hasValue status
                        const displayName = key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        
                        columnMap.set(key, {
                            name: displayName,
                            key: key,
                            unit: extractUnit(key),
                            hasValue: hasValue
                        });
                    } else {
                        // Update hasValue if any vessel has a value
                        const existing = columnMap.get(key)!;
                        if (hasValue) {
                            existing.hasValue = true;
                        }
                    }
                });
            }
        });
        
        // Only include columns that have at least one non-empty value
        const columns = Array.from(columnMap.values())
            .filter(col => col.hasValue)
            .map(({ name, key, unit }) => ({
                name,
                key,
                unit
            }));
        
        console.log('Dynamic columns with values:', columns.map(c => `${c.name} (${c.key})`));
        setDynamicColumns(columns);
    }, [vessels]);

    const extractUnit = (key: string): string => {
        if (key.includes('oil') || key.includes('fuel')) return 'bbl';
        if (key.includes('water')) return 'bbl';
        if (key.includes('barite') || key.includes('cement')) return 'mt';
        return '';
    };

    // Helper to get dynamic field value from vessel
    const getDynamicField = (vessel: SupplyVessel, key: string): string | number => {
        if (vessel.additionalFields && vessel.additionalFields.hasOwnProperty(key)) {
            return vessel.additionalFields[key];
        }
        return '';
    };

    // Helper to check if a vessel has any dynamic fields with values

    const handleEditClick = () => {
        // Deep clone vessels with additionalFields
        const clonedVessels = vessels.map(v => ({
            ...v,
            additionalFields: { ...v.additionalFields }
        }));
        setTempVessels(clonedVessels);
        
        // Initialize temp dynamic columns from vessels (including empty ones for editing)
        const allKeys = new Set<string>();
        clonedVessels.forEach(vessel => {
            if (vessel.additionalFields) {
                Object.keys(vessel.additionalFields).forEach(key => {
                    allKeys.add(key);
                });
            }
        });
        
        const tempColumns = Array.from(allKeys).map(key => {
            const displayName = key
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            return {
                name: displayName,
                key: key,
                unit: extractUnit(key)
            };
        });
        setTempDynamicColumns(tempColumns);
        
        setEditingIndex(null);
        setShowAddColumn(false);
        setRenamingColumn(null);
        setEditDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditDialogOpen(false);
        setEditingIndex(null);
        setEditingData({});
        setShowAddColumn(false);
        setRenamingColumn(null);
        setNewColumnName('');
        setNewColumnUnit('');
        setRenameColumnName('');
        setTempDynamicColumns([]);
    };

    const handleSaveVessels = async () => {
        // Ensure all vessels have additionalFields and IDs
        const updatedVessels = tempVessels.map((v, idx) => {
            const vessel = { ...v };
            if (!vessel.id) {
                vessel.id = idx.toString();
            }
            if (!vessel.additionalFields) {
                vessel.additionalFields = {};
            }
            
            // Keep ALL fields in additionalFields (including empty ones)
            // We keep empty fields so the columns remain visible in edit mode
            // But for display, we'll filter out empty ones
            
            return vessel;
        });
        
        console.log('Saving vessels with additionalFields:', updatedVessels.map(v => ({
            name: v.vessel,
            additionalFields: v.additionalFields
        })));
        
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
        // Deep clone the vessel data including additionalFields
        const vessel = tempVessels[index];
        setEditingData({ 
            ...vessel,
            additionalFields: { ...vessel.additionalFields }
        });
        setShowAddColumn(false);
        setRenamingColumn(null);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingData({});
        setShowAddColumn(false);
        setRenamingColumn(null);
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null && editingData) {
            const updated = [...tempVessels];
            const currentVessel = updated[editingIndex];
            
            // Merge the editing data with the current vessel
            const vesselData = { 
                ...currentVessel,
                vessel: editingData.vessel !== undefined ? editingData.vessel : currentVessel.vessel,
                location: editingData.location !== undefined ? editingData.location : currentVessel.location,
                crewChange: editingData.crewChange !== undefined ? formatDateForSave(editingData.crewChange) : currentVessel.crewChange,
                fuelOil: editingData.fuelOil !== undefined ? editingData.fuelOil : currentVessel.fuelOil,
                potWater: editingData.potWater !== undefined ? editingData.potWater : currentVessel.potWater,
                drlWater: editingData.drlWater !== undefined ? editingData.drlWater : currentVessel.drlWater,
                barite: editingData.barite !== undefined ? editingData.barite : currentVessel.barite,
                baseOil: editingData.baseOil !== undefined ? editingData.baseOil : currentVessel.baseOil,
                cementG: editingData.cementG !== undefined ? editingData.cementG : currentVessel.cementG,
                additionalFields: {
                    ...currentVessel.additionalFields,
                    ...editingData.additionalFields
                }
            };
            
            updated[editingIndex] = vesselData;
            setTempVessels(updated);
            setEditingIndex(null);
            setEditingData({});
            setShowAddColumn(false);
            setRenamingColumn(null);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setEditingData({ ...editingData, [field]: value });
    };

    const handleDynamicInputChange = (key: string, value: string | number) => {
        const updatedData = { ...editingData };
        if (!updatedData.additionalFields) {
            updatedData.additionalFields = {};
        }
        updatedData.additionalFields[key] = value;
        setEditingData(updatedData);
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
            cementG: 0,
            additionalFields: {}
        };
        
        // Initialize with existing dynamic columns
        tempDynamicColumns.forEach(col => {
            if (newVessel.additionalFields) {
                newVessel.additionalFields[col.key] = '';
            }
        });
        
        setTempVessels([...tempVessels, newVessel]);
        setEditingIndex(tempVessels.length);
        setEditingData({ ...newVessel });
        setShowAddColumn(false);
        setRenamingColumn(null);
    };

    const handleDeleteVessel = (index: number) => {
        if (window.confirm('Are you sure you want to delete this supply vessel?')) {
            const updated = tempVessels.filter((_, i) => i !== index);
            setTempVessels(updated);
            if (editingIndex === index) {
                setEditingIndex(null);
                setEditingData({});
                setShowAddColumn(false);
                setRenamingColumn(null);
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

    const handleAddColumnFromEdit = () => {
        setShowAddColumn(true);
        setNewColumnName('');
        setNewColumnUnit('');
        setRenamingColumn(null);
    };

    const handleConfirmAddColumn = () => {
        if (newColumnName.trim()) {
            const newKey = generateKey(newColumnName);
            
            // Check if key already exists in temp columns
            if (tempDynamicColumns.some(col => col.key === newKey)) {
                alert(`A column with the name "${newColumnName}" already exists. Please use a different name.`);
                return;
            }
            
            // Add to temp dynamic columns
            const newColumn: DynamicColumn = {
                name: newColumnName,
                key: newKey,
                unit: newColumnUnit
            };
            setTempDynamicColumns([...tempDynamicColumns, newColumn]);
            
            // Add the new column to ALL vessels with EMPTY values
            const updatedVessels = tempVessels.map(vessel => ({
                ...vessel,
                additionalFields: {
                    ...vessel.additionalFields,
                    [newKey]: '' // Empty string for all vessels
                }
            }));
            setTempVessels(updatedVessels);
            
            // If currently editing, update editing data to include new field (empty)
            if (editingIndex !== null && editingData) {
                const updatedData = { ...editingData };
                if (!updatedData.additionalFields) {
                    updatedData.additionalFields = {};
                }
                updatedData.additionalFields[newKey] = '';
                setEditingData(updatedData);
            }
            
            setShowAddColumn(false);
            setNewColumnName('');
            setNewColumnUnit('');
        }
    };

    const handleCancelAddColumn = () => {
        setShowAddColumn(false);
        setNewColumnName('');
        setNewColumnUnit('');
    };

    const handleStartRenameColumn = (key: string, currentName: string) => {
        setRenamingColumn(key);
        setRenameColumnName(currentName);
        setShowAddColumn(false);
    };

    const handleCancelRenameColumn = () => {
        setRenamingColumn(null);
        setRenameColumnName('');
    };

    const handleConfirmRenameColumn = () => {
        if (renamingColumn && renameColumnName.trim()) {
            const oldKey = renamingColumn;
            const newKey = generateKey(renameColumnName);
            
            // Check if new key already exists
            if (oldKey !== newKey && tempDynamicColumns.some(col => col.key === newKey)) {
                alert(`A column with the name "${renameColumnName}" already exists. Please use a different name.`);
                return;
            }
            
            // Update temp dynamic columns
            const updatedColumns = tempDynamicColumns.map(col => {
                if (col.key === oldKey) {
                    return { ...col, name: renameColumnName, key: newKey };
                }
                return col;
            });
            setTempDynamicColumns(updatedColumns);
            
            // Update all vessels with the new key
            const updatedVessels = tempVessels.map(vessel => {
                const vesselCopy = { ...vessel };
                if (vesselCopy.additionalFields && vesselCopy.additionalFields[oldKey] !== undefined) {
                    // Copy value to new key
                    const value = vesselCopy.additionalFields[oldKey];
                    const newFields = { ...vesselCopy.additionalFields };
                    newFields[newKey] = value;
                    delete newFields[oldKey];
                    vesselCopy.additionalFields = newFields;
                }
                return vesselCopy;
            });
            setTempVessels(updatedVessels);
            
            // Update editing data if currently editing
            if (editingIndex !== null && editingData && editingData.additionalFields) {
                const updatedData = { ...editingData };
                if (updatedData.additionalFields && updatedData.additionalFields[oldKey] !== undefined) {
                    const value = updatedData.additionalFields[oldKey];
                    const newFields = { ...updatedData.additionalFields };
                    newFields[newKey] = value;
                    delete newFields[oldKey];
                    updatedData.additionalFields = newFields;
                    setEditingData(updatedData);
                }
            }
            
            setRenamingColumn(null);
            setRenameColumnName('');
        }
    };

    // Get columns to display in edit mode
    const getEditColumns = () => {
        // Start with temp dynamic columns
        const columns = [...tempDynamicColumns];
        
        // Also include any additionalFields from vessels that might not be in tempDynamicColumns
        tempVessels.forEach(vessel => {
            if (vessel.additionalFields) {
                Object.keys(vessel.additionalFields).forEach(key => {
                    if (!columns.some(col => col.key === key)) {
                        const displayName = key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        columns.push({
                            name: displayName,
                            key: key,
                            unit: extractUnit(key)
                        });
                    }
                });
            }
        });
        
        return columns;
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
                                {dynamicColumns.map(col => {
                                    const value = getDynamicField(vessel, col.key);
                                    return (
                                        <TableCell key={col.key} className={`table-body-cell ${(!value) ? 'empty-cell' : ''}`} align="center">
                                            {value || '—'}
                                        </TableCell>
                                    );
                                })}
                                {!readOnly && <TableCell className="table-body-cell" align="center"></TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Supply Vessels Dialog */}
            <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    Edit Supply Vessels
                </DialogTitle>
                <DialogContent>
                    <div className="supply-edit-list">
                        {tempVessels.map((vessel, idx) => {
                            const editColumns = getEditColumns();
                            return (
                                <div key={vessel.id || idx} className="supply-edit-row">
                                    {editingIndex === idx ? (
                                        <div className="supply-edit-fields">
                                            <TextField 
                                                size="small" 
                                                label="Vessel Name" 
                                                value={editingData.vessel || ''} 
                                                onChange={(e) => handleInputChange('vessel', e.target.value)} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Location" 
                                                value={editingData.location || ''} 
                                                onChange={(e) => handleInputChange('location', e.target.value)} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Crew Change" 
                                                type="date" 
                                                value={formatDateForInput(editingData.crewChange || '')} 
                                                onChange={(e) => handleInputChange('crewChange', e.target.value)} 
                                                InputLabelProps={{ shrink: true }} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Fuel Oil" 
                                                type="text" 
                                                value={editingData.fuelOil || ''} 
                                                onChange={(e) => handleInputChange('fuelOil', e.target.value)} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Pot Water" 
                                                type="text" 
                                                value={editingData.potWater || ''} 
                                                onChange={(e) => handleInputChange('potWater', e.target.value)} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Drl Water" 
                                                type="text" 
                                                value={editingData.drlWater || ''} 
                                                onChange={(e) => handleInputChange('drlWater', e.target.value)} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Barite" 
                                                type="text" 
                                                value={editingData.barite || ''} 
                                                onChange={(e) => handleInputChange('barite', e.target.value)} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Base Oil" 
                                                type="text" 
                                                value={editingData.baseOil || ''} 
                                                onChange={(e) => handleInputChange('baseOil', e.target.value)} 
                                                fullWidth 
                                            />
                                            <TextField 
                                                size="small" 
                                                label="Cement G" 
                                                type="text" 
                                                value={editingData.cementG || ''} 
                                                onChange={(e) => handleInputChange('cementG', e.target.value)} 
                                                fullWidth 
                                            />
                                            
                                            {/* Dynamic Columns - Editable with Rename Option */}
                                            {editColumns.map(col => {
                                                const value = editingData.additionalFields?.[col.key] || '';
                                                const isRenaming = renamingColumn === col.key;
                                                
                                                return (
                                                    <div key={col.key} style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                                        {isRenaming ? (
                                                            <>
                                                                <TextField 
                                                                    size="small" 
                                                                    label="New Column Name" 
                                                                    value={renameColumnName} 
                                                                    onChange={(e) => setRenameColumnName(e.target.value)}
                                                                    placeholder="Enter new name"
                                                                    sx={{ flex: 1 }}
                                                                    autoFocus
                                                                />
                                                                <IconButton onClick={handleConfirmRenameColumn} color="primary" size="small" title="Confirm Rename">
                                                                    <Save fontSize="small" />
                                                                </IconButton>
                                                                <IconButton onClick={handleCancelRenameColumn} color="secondary" size="small" title="Cancel">
                                                                    <Cancel fontSize="small" />
                                                                </IconButton>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <TextField 
                                                                    size="small" 
                                                                    label={`${col.name} ${col.unit ? `(${col.unit})` : ''}`}
                                                                    value={value} 
                                                                    onChange={(e) => handleDynamicInputChange(col.key, e.target.value)} 
                                                                    sx={{ flex: 1 }}
                                                                    placeholder={`Enter ${col.name.toLowerCase()}`}
                                                                />
                                                                <Tooltip title="Rename column">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleStartRenameColumn(col.key, col.name)}
                                                                        color="primary"
                                                                    >
                                                                        <DriveFileRenameOutline fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            
                                            {/* Add Column Section */}
                                            {!showAddColumn ? (
                                                <Button 
                                                    size="small" 
                                                    startIcon={<Add />} 
                                                    onClick={handleAddColumnFromEdit}
                                                    variant="outlined"
                                                    sx={{ mt: 1, mb: 1 }}
                                                >
                                                    Add New Column
                                                </Button>
                                            ) : (
                                                <div className="add-column-section" style={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: '8px', 
                                                    padding: '12px', 
                                                    backgroundColor: '#f5f5f5', 
                                                    borderRadius: '4px',
                                                    marginTop: '8px',
                                                    marginBottom: '8px',
                                                    width: '100%'
                                                }}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Add new column to all vessels (values will be empty by default):
                                                    </Typography>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        <TextField 
                                                            size="small" 
                                                            label="Column Name" 
                                                            value={newColumnName} 
                                                            onChange={(e) => setNewColumnName(e.target.value)}
                                                            placeholder="e.g., Chemicals"
                                                            sx={{ flex: 1, minWidth: '150px' }}
                                                            autoFocus
                                                        />
                                                        <TextField 
                                                            size="small" 
                                                            label="Unit (optional)" 
                                                            value={newColumnUnit} 
                                                            onChange={(e) => setNewColumnUnit(e.target.value)}
                                                            placeholder="e.g., mt"
                                                            sx={{ flex: 0.5, minWidth: '100px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                        <Button 
                                                            size="small" 
                                                            variant="contained" 
                                                            color="primary"
                                                            onClick={handleConfirmAddColumn}
                                                            disabled={!newColumnName.trim()}
                                                        >
                                                            Add Column
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            variant="outlined"
                                                            onClick={handleCancelAddColumn}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            
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
                                            {editColumns.map(col => {
                                                const value = getDynamicField(vessel, col.key);
                                                return (
                                                    <span key={col.key} className="supply-edit-number">{value || '—'}</span>
                                                );
                                            })}
                                            <div className="edit-actions">
                                                <IconButton onClick={() => moveVesselUp(idx)} disabled={idx === 0}><ArrowUpward /></IconButton>
                                                <IconButton onClick={() => moveVesselDown(idx)} disabled={idx === tempVessels.length - 1}><ArrowDownward /></IconButton>
                                                <IconButton onClick={() => handleEditVessel(idx)} color="primary"><Edit /></IconButton>
                                                <IconButton onClick={() => handleDeleteVessel(idx)} color="error"><Delete /></IconButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <Button startIcon={<Add />} onClick={handleAddVessel} variant="outlined" sx={{ mt: 2 }}>
                        Add Supply Vessel
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveVessels} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SupplyVesselsTable;