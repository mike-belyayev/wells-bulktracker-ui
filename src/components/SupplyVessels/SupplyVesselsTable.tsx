// src/components/SupplyVessels/SupplyVesselsTable.tsx
import { useState } from 'react';
import {
    Paper, Button, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton as MuiIconButton, TextField, Divider,
    Typography
} from '@mui/material';
import { Delete, Add, Edit, Save, Cancel } from '@mui/icons-material';
import type { SupplyVessel, SupplyVesselsTableProps } from './SupplyVesselsTypes';
import './SupplyVesselsTable.css';

const SupplyVesselsTable = ({ 
    vessels, 
    onVesselsChange, 
    onSave, 
    onDelete, 
    readOnly = false 
}: SupplyVesselsTableProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SupplyVessel>>({});

    const handleAddVessel = () => {
        const newVessel: SupplyVessel = {
            id: Date.now().toString(),
            vessel: 'New Vessel',
            location: 'Dock',
            crewChange: 'Scheduled',
            fuelOil: 0,
            potWater: 0,
            drlWater: 0,
            barite: 0,
            baseOil: 0,
            cementG: 0
        };
        onVesselsChange([...vessels, newVessel]);
        setEditingId(newVessel.id);
        setEditData(newVessel);
    };

    const handleDeleteVessel = async (id: string) => {
        if (onDelete) {
            await onDelete(id);
        }
        onVesselsChange(vessels.filter(v => v.id !== id));
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
            const updatedVessel = { ...vessels.find(v => v.id === editingId), ...editData } as SupplyVessel;
            
            if (onSave) {
                await onSave(updatedVessel);
            }
            
            onVesselsChange(vessels.map(v => 
                v.id === editingId ? updatedVessel : v
            ));
            setEditingId(null);
            setEditData({});
        }
    };

    const handleInputChange = (field: keyof SupplyVessel, value: string | number) => {
        setEditData({ ...editData, [field]: value });
    };

    return (
        <Paper className="vessels-panel" elevation={3}>
            <div className="vessels-header">
                <Typography variant="h6" className="vessels-title">
                    Supply Vessels
                </Typography>
                {!readOnly && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={handleAddVessel}
                        className="add-vessel-btn"
                    >
                        Add Vessel
                    </Button>
                )}
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
                            {!readOnly && (
                                <TableCell className="table-header-cell actions-header">ACTIONS</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vessels.map((vessel) => (
                            <TableRow key={vessel.id} hover>
                                {editingId === vessel.id && !readOnly ? (
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
                                                value={editData.crewChange || ''}
                                                onChange={(e) => handleInputChange('crewChange', e.target.value)}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.fuelOil || 0}
                                                onChange={(e) => handleInputChange('fuelOil', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.potWater || 0}
                                                onChange={(e) => handleInputChange('potWater', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.drlWater || 0}
                                                onChange={(e) => handleInputChange('drlWater', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.barite || 0}
                                                onChange={(e) => handleInputChange('barite', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.baseOil || 0}
                                                onChange={(e) => handleInputChange('baseOil', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.cementG || 0}
                                                onChange={(e) => handleInputChange('cementG', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 80 }}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
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
                                        <TableCell className="table-body-cell">{vessel.location}</TableCell>
                                        <TableCell className="table-body-cell">{vessel.crewChange}</TableCell>
                                        <TableCell align="center" className="table-body-cell">{vessel.fuelOil}</TableCell>
                                        <TableCell align="center" className="table-body-cell">{vessel.potWater}</TableCell>
                                        <TableCell align="center" className="table-body-cell">{vessel.drlWater}</TableCell>
                                        <TableCell align="center" className="table-body-cell">{vessel.barite}</TableCell>
                                        <TableCell align="center" className="table-body-cell">{vessel.baseOil}</TableCell>
                                        <TableCell align="center" className="table-body-cell">{vessel.cementG}</TableCell>
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
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default SupplyVesselsTable;