// src/components/SupplyVessels/SupplyVesselsTable.tsx
import { useState, useEffect } from 'react';
import {
    Paper, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton as MuiIconButton, TextField, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField,
    Menu, MenuItem, Typography
} from '@mui/material';
import { Delete, Add, Edit, Save, Cancel, ViewColumn } from '@mui/icons-material';
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
    [key: string]: any; // Allow dynamic fields
}

export interface SupplyVesselsTableProps {
    vessels: SupplyVessel[];
    wellId?: string;
    onVesselsChange: (vessels: SupplyVessel[]) => void;
    onSave?: (vessel: SupplyVessel) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    readOnly?: boolean;
}

export interface DynamicColumn {
    name: string;
    key: string;
    unit?: string;
}

const SupplyVesselsTable = ({ 
    vessels, 
    wellId,
    onVesselsChange, 
    onSave, 
    onDelete, 
    readOnly = false 
}: SupplyVesselsTableProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SupplyVessel>>({});
    const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([]);
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnUnit, setNewColumnUnit] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

    // Extract all unique dynamic column keys from all vessels
    useEffect(() => {
        const allKeys = new Set<string>();
        vessels.forEach(vessel => {
            Object.keys(vessel).forEach(key => {
                // Skip static fields
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

    const handleAddColumn = () => {
        if (newColumnName.trim()) {
            const newKey = newColumnName.toLowerCase().replace(/\s+/g, '_');
            const newColumn: DynamicColumn = {
                name: newColumnName,
                key: newKey,
                unit: newColumnUnit
            };
            setDynamicColumns([...dynamicColumns, newColumn]);
            
            // Add this column to all existing vessels with default empty value
            const updatedVessels = vessels.map(vessel => ({
                ...vessel,
                [newKey]: ''
            }));
            onVesselsChange(updatedVessels);
            
            setNewColumnName('');
            setNewColumnUnit('');
            setColumnDialogOpen(false);
        }
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
        
        // Add dynamic columns with empty values
        dynamicColumns.forEach(col => {
            newVessel[col.key] = '';
        });
        
        onVesselsChange([...vessels, newVessel]);
        setEditingId(newVessel.id);
        setEditData(newVessel);
    };

    const handleDeleteVessel = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this vessel?')) {
            if (wellId && onDelete) {
                await onDelete(id);
            }
            onVesselsChange(vessels.filter(v => v.id !== id));
        }
    };

    const handleStartEdit = (vessel: SupplyVessel) => {
        setEditingId(vessel.id);
        setEditData(vessel);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSaveEdit = async () => {
        if (editingId && editData) {
            const updatedVessel = vessels.find(v => v.id === editingId);
            if (updatedVessel) {
                const mergedVessel = { ...updatedVessel, ...editData };
                
                if (wellId && onSave) {
                    await onSave(mergedVessel);
                }
                
                onVesselsChange(vessels.map(v => 
                    v.id === editingId ? mergedVessel : v
                ));
            }
            setEditingId(null);
            setEditData({});
        }
    };

    const handleInputChange = (field: keyof SupplyVessel | string, value: string | number) => {
        setEditData({
            ...editData,
            [field]: value
        });
    };

    const getCellValue = (vessel: SupplyVessel, field: string): string | number => {
        const value = vessel[field];
        if (value === undefined || value === null || value === '') {
            return '—';
        }
        return value;
    };

    const isFieldEmpty = (vessel: SupplyVessel, field: string): boolean => {
        const value = vessel[field];
        return value === undefined || value === null || value === '';
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, columnKey: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedColumn(columnKey);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedColumn(null);
    };

    const handleRemoveColumn = () => {
        if (selectedColumn) {
            if (window.confirm(`Are you sure you want to remove the column "${selectedColumn}"?`)) {
                // Remove column from all vessels
                const updatedVessels = vessels.map(vessel => {
                    const { [selectedColumn]: _, ...rest } = vessel;
                    return rest as SupplyVessel;
                });
                onVesselsChange(updatedVessels);
                setDynamicColumns(dynamicColumns.filter(col => col.key !== selectedColumn));
            }
            handleMenuClose();
        }
    };

    return (
        <Paper className="vessels-panel" elevation={3}>
            <div className="vessels-header">
                <Typography variant="h6" className="vessels-title">
                    Supply Vessels
                </Typography>
                <div className="header-buttons">
                    {!readOnly && (
                        <>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ViewColumn />}
                                onClick={() => setColumnDialogOpen(true)}
                                className="add-column-btn"
                            >
                                Add Column
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                onClick={handleAddVessel}
                                className="add-vessel-btn"
                            >
                                Add Vessel
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <Divider />
            <TableContainer className="vessels-table-container">
                <Table stickyHeader size="small" className="vessels-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header-cell">VESSEL</TableCell>
                            <TableCell className="table-header-cell">LOCATION</TableCell>
                            <TableCell className="table-header-cell">CREW CHANGE</TableCell>
                            <TableCell className="table-header-cell" align="center">
                                FUEL OIL <span className="unit-text">(m³)</span>
                            </TableCell>
                            <TableCell className="table-header-cell" align="center">
                                POT WATER <span className="unit-text">(m³)</span>
                            </TableCell>
                            <TableCell className="table-header-cell" align="center">
                                DRL WATER <span className="unit-text">(m³)</span>
                            </TableCell>
                            <TableCell className="table-header-cell" align="center">
                                BARITE <span className="unit-text">(mt)</span>
                            </TableCell>
                            <TableCell className="table-header-cell" align="center">
                                BASE OIL <span className="unit-text">(m³)</span>
                            </TableCell>
                            <TableCell className="table-header-cell" align="center">
                                CEMENT G <span className="unit-text">(mt)</span>
                            </TableCell>
                            {/* Dynamic Columns */}
                            {dynamicColumns.map(col => (
                                <TableCell 
                                    key={col.key} 
                                    className="table-header-cell dynamic-header"
                                    align="center"
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        handleMenuOpen(e, col.key);
                                    }}
                                >
                                    {col.name}
                                    {col.unit && <span className="unit-text">({col.unit})</span>}
                                </TableCell>
                            ))}
                            {!readOnly && (
                                <TableCell className="table-header-cell actions-header">ACTIONS</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vessels.map((vessel) => (
                            <TableRow key={vessel.id} hover>
                                {editingId === vessel.id ? (
                                    // Edit mode
                                    <>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={editData.vessel || ''}
                                                onChange={(e) => handleInputChange('vessel', e.target.value)}
                                                fullWidth
                                                autoFocus
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={editData.location || ''}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="date"
                                                value={editData.crewChange || ''}
                                                onChange={(e) => handleInputChange('crewChange', e.target.value)}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.fuelOil ?? 0}
                                                onChange={(e) => handleInputChange('fuelOil', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.potWater ?? 0}
                                                onChange={(e) => handleInputChange('potWater', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.drlWater ?? 0}
                                                onChange={(e) => handleInputChange('drlWater', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.barite ?? 0}
                                                onChange={(e) => handleInputChange('barite', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.baseOil ?? 0}
                                                onChange={(e) => handleInputChange('baseOil', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.cementG ?? 0}
                                                onChange={(e) => handleInputChange('cementG', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        {dynamicColumns.map(col => (
                                            <TableCell key={col.key} align="center">
                                                <TextField
                                                    size="small"
                                                    value={editData[col.key] || ''}
                                                    onChange={(e) => handleInputChange(col.key, e.target.value)}
                                                    sx={{ minWidth: 100 }}
                                                    inputProps={{ style: { textAlign: 'center' } }}
                                                    placeholder={`Enter ${col.name}`}
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">
                                            <MuiIconButton size="small" onClick={handleSaveEdit} color="primary">
                                                <Save fontSize="small" />
                                            </MuiIconButton>
                                            <MuiIconButton size="small" onClick={handleCancelEdit} color="secondary">
                                                <Cancel fontSize="small" />
                                            </MuiIconButton>
                                        </TableCell>
                                    </>
                                ) : (
                                    // View mode
                                    <>
                                        <TableCell className="table-body-cell">{vessel.vessel}</TableCell>
                                        <TableCell className="table-body-cell">{vessel.location || '—'}</TableCell>
                                        <TableCell className="table-body-cell">{vessel.crewChange || '—'}</TableCell>
                                        <TableCell align="center" className={`table-body-cell ${isFieldEmpty(vessel, 'fuelOil') ? 'empty-cell' : ''}`}>
                                            {getCellValue(vessel, 'fuelOil')}
                                        </TableCell>
                                        <TableCell align="center" className={`table-body-cell ${isFieldEmpty(vessel, 'potWater') ? 'empty-cell' : ''}`}>
                                            {getCellValue(vessel, 'potWater')}
                                        </TableCell>
                                        <TableCell align="center" className={`table-body-cell ${isFieldEmpty(vessel, 'drlWater') ? 'empty-cell' : ''}`}>
                                            {getCellValue(vessel, 'drlWater')}
                                        </TableCell>
                                        <TableCell align="center" className={`table-body-cell ${isFieldEmpty(vessel, 'barite') ? 'empty-cell' : ''}`}>
                                            {getCellValue(vessel, 'barite')}
                                        </TableCell>
                                        <TableCell align="center" className={`table-body-cell ${isFieldEmpty(vessel, 'baseOil') ? 'empty-cell' : ''}`}>
                                            {getCellValue(vessel, 'baseOil')}
                                        </TableCell>
                                        <TableCell align="center" className={`table-body-cell ${isFieldEmpty(vessel, 'cementG') ? 'empty-cell' : ''}`}>
                                            {getCellValue(vessel, 'cementG')}
                                        </TableCell>
                                        {dynamicColumns.map(col => (
                                            <TableCell 
                                                key={col.key} 
                                                align="center" 
                                                className={`table-body-cell ${isFieldEmpty(vessel, col.key) ? 'empty-cell' : ''}`}
                                            >
                                                {getCellValue(vessel, col.key)}
                                            </TableCell>
                                        ))}
                                        {!readOnly && (
                                            <TableCell align="center">
                                                <MuiIconButton size="small" onClick={() => handleStartEdit(vessel)} color="primary">
                                                    <Edit fontSize="small" />
                                                </MuiIconButton>
                                                <MuiIconButton size="small" onClick={() => handleDeleteVessel(vessel.id)} color="error">
                                                    <Delete fontSize="small" />
                                                </MuiIconButton>
                                            </TableCell>
                                        )}
                                    </>
                                )}
                            </TableRow>
                        ))}
                        {vessels.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10 + dynamicColumns.length + (readOnly ? 0 : 1)} align="center" className="empty-table-cell">
                                    No supply vessels found. Click "Add Vessel" to create one.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Column Dialog */}
            <Dialog open={columnDialogOpen} onClose={() => setColumnDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Dynamic Column</DialogTitle>
                <DialogContent>
                    <MuiTextField
                        autoFocus
                        margin="dense"
                        label="Column Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="e.g., Special Fluid, Extra Chemical"
                    />
                    <MuiTextField
                        margin="dense"
                        label="Unit (optional)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newColumnUnit}
                        onChange={(e) => setNewColumnUnit(e.target.value)}
                        placeholder="e.g., bbl, mt, m³"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setColumnDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddColumn} variant="contained" color="primary">
                        Add Column
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Context Menu for removing columns */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleRemoveColumn} style={{ color: '#f44336' }}>
                    Remove Column
                </MenuItem>
            </Menu>
        </Paper>
    );
};

export default SupplyVesselsTable;