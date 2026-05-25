// src/components/Dashboard/LastUpdated.tsx
import { useState, useEffect } from 'react';
import { 
    Paper, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton, TextField, Dialog, 
    DialogTitle, DialogContent, DialogActions, Button, Tooltip
} from '@mui/material';
import { Edit, Save, Cancel, Add, Delete } from '@mui/icons-material';
import './LastUpdated.css';

export interface BopSystem {
    id: string;
    system: string;
    testDate: string;
    nextDate: string;
}

export interface MudPumpLiner {
    id: string;
    pump: number;
    liner: string;
    galPerStk: number;
    bblPerStk: number;
}

export interface LastUpdatedProps {
    wellId?: string;
    bopSystemsData?: BopSystem[];
    mudPumpLinersData?: MudPumpLiner[];
    onBopUpdate?: (data: BopSystem[]) => Promise<void>;
    onMudPumpUpdate?: (data: MudPumpLiner[]) => Promise<void>;
    readOnly?: boolean;
}

const LastUpdated = ({ 
    bopSystemsData: initialBopData,
    mudPumpLinersData: initialMudPumpData,
    onBopUpdate,
    onMudPumpUpdate,
    readOnly = false
}: LastUpdatedProps) => {
    const [bopSystems, setBopSystems] = useState<BopSystem[]>(initialBopData || []);
    const [mudPumpLiners, setMudPumpLiners] = useState<MudPumpLiner[]>(initialMudPumpData || []);
    const [editingBopId, setEditingBopId] = useState<string | null>(null);
    const [editingBopData, setEditingBopData] = useState<Partial<BopSystem>>({});
    const [editingMudId, setEditingMudId] = useState<string | null>(null);
    const [editingMudData, setEditingMudData] = useState<Partial<MudPumpLiner>>({});
    const [addBopDialogOpen, setAddBopDialogOpen] = useState(false);
    const [addMudDialogOpen, setAddMudDialogOpen] = useState(false);
    const [newBop, setNewBop] = useState<Partial<BopSystem>>({ system: '', testDate: '', nextDate: '' });
    const [newMud, setNewMud] = useState<Partial<MudPumpLiner>>({ pump: 0, liner: '', galPerStk: 0, bblPerStk: 0 });

    useEffect(() => {
        if (initialBopData) setBopSystems(initialBopData);
        if (initialMudPumpData) setMudPumpLiners(initialMudPumpData);
    }, [initialBopData, initialMudPumpData]);

    // BOP Systems handlers
    const handleEditBop = (system: BopSystem) => {
        setEditingBopId(system.id);
        setEditingBopData(system);
    };

    const handleCancelBopEdit = () => {
        setEditingBopId(null);
        setEditingBopData({});
    };

    const handleSaveBopEdit = async () => {
        if (editingBopId && editingBopData) {
            const updatedSystems = bopSystems.map(s => 
                s.id === editingBopId ? { ...s, ...editingBopData } : s
            );
            setBopSystems(updatedSystems);
            if (onBopUpdate) await onBopUpdate(updatedSystems);
            setEditingBopId(null);
            setEditingBopData({});
        }
    };

    const handleBopInputChange = (field: keyof BopSystem, value: string) => {
        setEditingBopData({ ...editingBopData, [field]: value });
    };

    const handleDeleteBop = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this BOP system?')) {
            const updatedSystems = bopSystems.filter(s => s.id !== id);
            setBopSystems(updatedSystems);
            if (onBopUpdate) await onBopUpdate(updatedSystems);
        }
    };

    const handleAddBop = async () => {
        if (newBop.system) {
            const newSystem: BopSystem = {
                id: Date.now().toString(),
                system: newBop.system,
                testDate: newBop.testDate || '',
                nextDate: newBop.nextDate || ''
            };
            const updatedSystems = [...bopSystems, newSystem];
            setBopSystems(updatedSystems);
            if (onBopUpdate) await onBopUpdate(updatedSystems);
            setAddBopDialogOpen(false);
            setNewBop({ system: '', testDate: '', nextDate: '' });
        }
    };

    // Reorder BOP Systems
    const moveBopUp = (index: number) => {
        if (index === 0) return;
        const newSystems = [...bopSystems];
        [newSystems[index - 1], newSystems[index]] = [newSystems[index], newSystems[index - 1]];
        setBopSystems(newSystems);
        if (onBopUpdate) onBopUpdate(newSystems);
    };

    const moveBopDown = (index: number) => {
        if (index === bopSystems.length - 1) return;
        const newSystems = [...bopSystems];
        [newSystems[index + 1], newSystems[index]] = [newSystems[index], newSystems[index + 1]];
        setBopSystems(newSystems);
        if (onBopUpdate) onBopUpdate(newSystems);
    };

    // Mud Pump Liners handlers
    const handleEditMud = (liner: MudPumpLiner) => {
        setEditingMudId(liner.id);
        setEditingMudData(liner);
    };

    const handleCancelMudEdit = () => {
        setEditingMudId(null);
        setEditingMudData({});
    };

    const handleSaveMudEdit = async () => {
        if (editingMudId && editingMudData) {
            const updatedLiners = mudPumpLiners.map(l => 
                l.id === editingMudId ? { ...l, ...editingMudData } : l
            );
            setMudPumpLiners(updatedLiners);
            if (onMudPumpUpdate) await onMudPumpUpdate(updatedLiners);
            setEditingMudId(null);
            setEditingMudData({});
        }
    };

    const handleMudInputChange = (field: keyof MudPumpLiner, value: string | number) => {
        setEditingMudData({ ...editingMudData, [field]: value });
    };

    const handleDeleteMud = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this mud pump liner?')) {
            const updatedLiners = mudPumpLiners.filter(l => l.id !== id);
            setMudPumpLiners(updatedLiners);
            if (onMudPumpUpdate) await onMudPumpUpdate(updatedLiners);
        }
    };

    const handleAddMud = async () => {
        if (newMud.pump) {
            const newLiner: MudPumpLiner = {
                id: Date.now().toString(),
                pump: newMud.pump || 0,
                liner: newMud.liner || '',
                galPerStk: newMud.galPerStk || 0,
                bblPerStk: newMud.bblPerStk || 0
            };
            const updatedLiners = [...mudPumpLiners, newLiner];
            setMudPumpLiners(updatedLiners);
            if (onMudPumpUpdate) await onMudPumpUpdate(updatedLiners);
            setAddMudDialogOpen(false);
            setNewMud({ pump: 0, liner: '', galPerStk: 0, bblPerStk: 0 });
        }
    };

    // Reorder Mud Pump Liners
    const moveMudUp = (index: number) => {
        if (index === 0) return;
        const newLiners = [...mudPumpLiners];
        [newLiners[index - 1], newLiners[index]] = [newLiners[index], newLiners[index - 1]];
        setMudPumpLiners(newLiners);
        if (onMudPumpUpdate) onMudPumpUpdate(newLiners);
    };

    const moveMudDown = (index: number) => {
        if (index === mudPumpLiners.length - 1) return;
        const newLiners = [...mudPumpLiners];
        [newLiners[index + 1], newLiners[index]] = [newLiners[index], newLiners[index + 1]];
        setMudPumpLiners(newLiners);
        if (onMudPumpUpdate) onMudPumpUpdate(newLiners);
    };

    // Truncate text for display
    const truncateText = (text: string, maxLen: number = 20) => {
        if (!text) return '—';
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + '...';
    };

    // Safe number formatting
    const formatNumber = (value: number, decimals: number = 4) => {
        if (value === undefined || value === null) return '—';
        return value.toFixed(decimals);
    };

    return (
        <div className="last-updated-container">
            {/* BOP Systems Data Table */}
            <Paper className="info-table" elevation={3}>
                <div className="table-header">
                    <Typography variant="h6" className="table-title">
                        BOP Systems Data
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={() => setAddBopDialogOpen(true)} className="add-row-btn" title="Add BOP System">
                            <Add fontSize="small" />
                        </IconButton>
                    )}
                </div>
                <TableContainer className="bop-table-container">
                    <Table size="small" stickyHeader className="compact-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="bop-header-cell">System</TableCell>
                                <TableCell className="bop-header-cell">Test Date</TableCell>
                                <TableCell className="bop-header-cell">Next Date</TableCell>
                                {!readOnly && <TableCell className="bop-header-cell actions-cell">Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bopSystems.map((system, idx) => (
                                <TableRow key={system.id} hover>
                                    {editingBopId === system.id ? (
                                        <>
                                            <TableCell className="editing-cell">
                                                <TextField
                                                    size="small"
                                                    value={editingBopData.system || ''}
                                                    onChange={(e) => handleBopInputChange('system', e.target.value)}
                                                    fullWidth
                                                    autoFocus
                                                    inputProps={{ style: { fontSize: '0.6rem', padding: '4px' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell">
                                                <TextField
                                                    size="small"
                                                    type="date"
                                                    value={editingBopData.testDate || ''}
                                                    onChange={(e) => handleBopInputChange('testDate', e.target.value)}
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ style: { fontSize: '0.6rem', padding: '4px' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell">
                                                <TextField
                                                    size="small"
                                                    type="date"
                                                    value={editingBopData.nextDate || ''}
                                                    onChange={(e) => handleBopInputChange('nextDate', e.target.value)}
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ style: { fontSize: '0.6rem', padding: '4px' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="actions-cell">
                                                <IconButton size="small" onClick={handleSaveBopEdit} color="primary">
                                                    <Save fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={handleCancelBopEdit} color="secondary">
                                                    <Cancel fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="bop-system-cell" title={system.system}>
                                                {truncateText(system.system, 25)}
                                            </TableCell>
                                            <TableCell className="bop-date-cell">{system.testDate || '—'}</TableCell>
                                            <TableCell className="bop-date-cell">{system.nextDate || '—'}</TableCell>
                                            {!readOnly && (
                                                <TableCell className="actions-cell">
                                                    <Tooltip title="Move Up">
                                                        <span>
                                                            <IconButton size="small" onClick={() => moveBopUp(idx)} disabled={idx === 0}>
                                                                ↑
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Move Down">
                                                        <span>
                                                            <IconButton size="small" onClick={() => moveBopDown(idx)} disabled={idx === bopSystems.length - 1}>
                                                                ↓
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <IconButton size="small" onClick={() => handleEditBop(system)} color="primary">
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDeleteBop(system.id)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
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

            {/* MUD PUMP LINERS Table */}
            <Paper className="info-table" elevation={3}>
                <div className="table-header">
                    <Typography variant="h6" className="table-title">
                        MUD PUMP LINERS
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={() => setAddMudDialogOpen(true)} className="add-row-btn" title="Add Mud Pump Liner">
                            <Add fontSize="small" />
                        </IconButton>
                    )}
                </div>
                <TableContainer>
                    <Table size="small" className="compact-table mud-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="pump-header-cell">Pump</TableCell>
                                <TableCell className="pump-header-cell">Liner</TableCell>
                                <TableCell className="pump-header-cell" align="right">gal/stk</TableCell>
                                <TableCell className="pump-header-cell" align="right">bbl/stk</TableCell>
                                {!readOnly && <TableCell className="pump-header-cell actions-cell">Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mudPumpLiners.map((liner, idx) => (
                                <TableRow key={liner.id} hover>
                                    {editingMudId === liner.id ? (
                                        <>
                                            <TableCell className="editing-cell">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={editingMudData.pump || 0}
                                                    onChange={(e) => handleMudInputChange('pump', parseInt(e.target.value) || 0)}
                                                    disabled
                                                    inputProps={{ style: { fontSize: '0.55rem', padding: '4px', textAlign: 'center' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell">
                                                <TextField
                                                    size="small"
                                                    value={editingMudData.liner || ''}
                                                    onChange={(e) => handleMudInputChange('liner', e.target.value)}
                                                    inputProps={{ style: { fontSize: '0.55rem', padding: '4px', width: '50px' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell" align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={editingMudData.galPerStk || 0}
                                                    onChange={(e) => handleMudInputChange('galPerStk', parseFloat(e.target.value) || 0)}
                                                    inputProps={{ style: { fontSize: '0.55rem', padding: '4px', textAlign: 'right' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell" align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={editingMudData.bblPerStk || 0}
                                                    onChange={(e) => handleMudInputChange('bblPerStk', parseFloat(e.target.value) || 0)}
                                                    inputProps={{ style: { fontSize: '0.55rem', padding: '4px', textAlign: 'right' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="actions-cell">
                                                <IconButton size="small" onClick={handleSaveMudEdit} color="primary">
                                                    <Save fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={handleCancelMudEdit} color="secondary">
                                                    <Cancel fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="pump-value-cell">{liner.pump}</TableCell>
                                            <TableCell className="pump-value-cell" title={liner.liner}>
                                                {truncateText(liner.liner, 6)}
                                            </TableCell>
                                            <TableCell className="pump-value-cell" align="right">{formatNumber(liner.galPerStk)}</TableCell>
                                            <TableCell className="pump-value-cell" align="right">{formatNumber(liner.bblPerStk)}</TableCell>
                                            {!readOnly && (
                                                <TableCell className="actions-cell">
                                                    <Tooltip title="Move Up">
                                                        <span>
                                                            <IconButton size="small" onClick={() => moveMudUp(idx)} disabled={idx === 0}>
                                                                ↑
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Move Down">
                                                        <span>
                                                            <IconButton size="small" onClick={() => moveMudDown(idx)} disabled={idx === mudPumpLiners.length - 1}>
                                                                ↓
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <IconButton size="small" onClick={() => handleEditMud(liner)} color="primary">
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDeleteMud(liner.id)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
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

            {/* Add BOP Dialog */}
            <Dialog open={addBopDialogOpen} onClose={() => setAddBopDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add BOP System</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="System Name"
                        fullWidth
                        value={newBop.system}
                        onChange={(e) => setNewBop({ ...newBop, system: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Test Date"
                        type="date"
                        fullWidth
                        value={newBop.testDate}
                        onChange={(e) => setNewBop({ ...newBop, testDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Next Date"
                        type="date"
                        fullWidth
                        value={newBop.nextDate}
                        onChange={(e) => setNewBop({ ...newBop, nextDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddBopDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddBop} variant="contained" color="primary">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Add Mud Pump Dialog */}
            <Dialog open={addMudDialogOpen} onClose={() => setAddMudDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Mud Pump Liner</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Pump Number"
                        type="number"
                        fullWidth
                        value={newMud.pump}
                        onChange={(e) => setNewMud({ ...newMud, pump: parseInt(e.target.value) || 0 })}
                    />
                    <TextField
                        margin="dense"
                        label="Liner Size"
                        fullWidth
                        value={newMud.liner}
                        onChange={(e) => setNewMud({ ...newMud, liner: e.target.value })}
                        placeholder='e.g., 6"'
                    />
                    <TextField
                        margin="dense"
                        label="gal/stk"
                        type="number"
                        fullWidth
                        value={newMud.galPerStk}
                        onChange={(e) => setNewMud({ ...newMud, galPerStk: parseFloat(e.target.value) || 0 })}
                    />
                    <TextField
                        margin="dense"
                        label="bbl/stk"
                        type="number"
                        fullWidth
                        value={newMud.bblPerStk}
                        onChange={(e) => setNewMud({ ...newMud, bblPerStk: parseFloat(e.target.value) || 0 })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddMudDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMud} variant="contained" color="primary">Add</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LastUpdated;