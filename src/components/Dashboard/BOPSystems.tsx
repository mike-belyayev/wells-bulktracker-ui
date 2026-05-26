// src/components/Dashboard/BOPSystems.tsx
import { useState, useEffect } from 'react';
import { 
    Paper, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton, TextField, Dialog, 
    DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { Edit, Save, Cancel, Add, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import './BOPSystems.css';

export interface BopSystem {
    id?: string;
    _id?: string;
    System?: string;
    system?: string;
    testDate: string;
    nextDate: string;
}

export interface MudPumpLiner {
    id?: string;
    _id?: string;
    pump: number;
    liner: string;
    galStk?: number;
    bblStk?: number;
    galPerStk?: number;
    bblPerStk?: number;
}

export interface BOPSystemsProps {
    wellId?: string;
    bopSystemsData?: BopSystem[];
    mudPumpLinersData?: MudPumpLiner[];
    onBopUpdate?: (data: BopSystem[]) => Promise<void>;
    onMudPumpUpdate?: (data: MudPumpLiner[]) => Promise<void>;
    readOnly?: boolean;
}

// Helper functions for date formatting - DD-MMM-YY
const formatDateToDisplay = (dateString: string): string => {
    if (!dateString) return '—';
    try {
        if (dateString.match(/^\d{2}-[A-Za-z]{3}-\d{2}$/)) {
            return dateString;
        }
        
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
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
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
    
    const match = dateString.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
    if (match) {
        const monthMap: { [key: string]: number } = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3,
            'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7,
            'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };
        const day = parseInt(match[1]);
        const month = monthMap[match[2].toUpperCase()];
        const year = 2000 + parseInt(match[3]);
        
        const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
        return date.toISOString();
    }
    
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1]);
        const month = parseInt(isoMatch[2]) - 1;
        const day = parseInt(isoMatch[3]);
        const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
        return date.toISOString();
    }
    
    return dateString;
};

// Function to check if date is urgent (past OR within 3 days)
const isDateUrgent = (dateString: string): boolean => {
    if (!dateString || dateString === '—') return false;
    
    try {
        const match = dateString.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
        if (!match) return false;
        
        const monthMap: { [key: string]: number } = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3,
            'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7,
            'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };
        
        const day = parseInt(match[1]);
        const month = monthMap[match[2].toUpperCase()];
        const year = 2000 + parseInt(match[3]);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const targetDate = new Date(year, month, day);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Return true if date is in the past OR within 3 days in future
        return diffDays < 0 || (diffDays >= 0 && diffDays <= 3);
    } catch {
        return false;
    }
};

const getSystemName = (system: BopSystem): string => {
    return system.System || system.system || '';
};

const formatNumber = (value: number | string | undefined, decimals: number = 4): string => {
    if (value === undefined || value === null || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    return num.toFixed(decimals);
};

const BOPSystems = ({ 
    bopSystemsData: initialBopData,
    mudPumpLinersData: initialMudPumpData,
    onBopUpdate,
    onMudPumpUpdate,
    readOnly = false
}: BOPSystemsProps) => {
    const [bopSystems, setBopSystems] = useState<BopSystem[]>([]);
    const [mudPumpLiners, setMudPumpLiners] = useState<MudPumpLiner[]>([]);
    const [editingBopIndex, setEditingBopIndex] = useState<number | null>(null);
    const [editingBopData, setEditingBopData] = useState<Partial<BopSystem>>({});
    const [editingMudIndex, setEditingMudIndex] = useState<number | null>(null);
    const [editingMudData, setEditingMudData] = useState<Partial<MudPumpLiner>>({});
    const [addBopDialogOpen, setAddBopDialogOpen] = useState(false);
    const [addMudDialogOpen, setAddMudDialogOpen] = useState(false);
    const [newBop, setNewBop] = useState<Partial<BopSystem>>({ System: '', testDate: '', nextDate: '' });
    const [newMud, setNewMud] = useState<Partial<MudPumpLiner>>({ pump: 0, liner: '', galStk: 0, bblStk: 0 });

    useEffect(() => {
        if (initialBopData && initialBopData.length > 0) {
            const formattedData = initialBopData.map((system, idx) => ({
                ...system,
                id: system._id || `bop_${idx}`,
                testDate: formatDateToDisplay(system.testDate),
                nextDate: formatDateToDisplay(system.nextDate)
            }));
            setBopSystems(formattedData);
        } else {
            setBopSystems([]);
        }
        
        if (initialMudPumpData && initialMudPumpData.length > 0) {
            const formattedData = initialMudPumpData.map((liner, idx) => ({
                ...liner,
                id: liner._id || `mud_${idx}`,
                galStk: liner.galStk || liner.galPerStk || 0,
                bblStk: liner.bblStk || liner.bblPerStk || 0,
                galPerStk: liner.galStk || liner.galPerStk || 0,
                bblPerStk: liner.bblStk || liner.bblPerStk || 0
            }));
            setMudPumpLiners(formattedData);
        } else {
            setMudPumpLiners([]);
        }
    }, [initialBopData, initialMudPumpData]);

    // BOP Systems handlers
    const handleEditBop = (index: number) => {
        const system = bopSystems[index];
        setEditingBopIndex(index);
        setEditingBopData({
            System: getSystemName(system),
            testDate: formatDateForInput(system.testDate),
            nextDate: formatDateForInput(system.nextDate)
        });
    };

    const handleCancelBopEdit = () => {
        setEditingBopIndex(null);
        setEditingBopData({});
    };

    const handleSaveBopEdit = async () => {
        if (editingBopIndex !== null && editingBopData) {
            const currentSystem = bopSystems[editingBopIndex];
            const savedData = {
                ...currentSystem,
                System: editingBopData.System || getSystemName(currentSystem),
                testDate: formatDateForSave(editingBopData.testDate || ''),
                nextDate: formatDateForSave(editingBopData.nextDate || '')
            };
            const updatedSystems = [...bopSystems];
            updatedSystems[editingBopIndex] = savedData;
            setBopSystems(updatedSystems);
            if (onBopUpdate) {
                const apiData = updatedSystems.map(({ id, _id, system, ...rest }) => ({
                    System: rest.System,
                    testDate: rest.testDate,
                    nextDate: rest.nextDate
                }));
                await onBopUpdate(apiData);
            }
            setEditingBopIndex(null);
            setEditingBopData({});
        }
    };

    const handleBopInputChange = (field: string, value: string) => {
        setEditingBopData({ ...editingBopData, [field]: value });
    };

    const handleDeleteBop = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this BOP system?')) {
            const updatedSystems = bopSystems.filter((_, i) => i !== index);
            setBopSystems(updatedSystems);
            if (onBopUpdate) {
                const apiData = updatedSystems.map(({ id, _id, system, ...rest }) => ({
                    System: rest.System,
                    testDate: rest.testDate,
                    nextDate: rest.nextDate
                }));
                await onBopUpdate(apiData);
            }
        }
    };

    const handleAddBop = async () => {
        if (newBop.System) {
            const newSystem: BopSystem = {
                id: `bop_${Date.now()}`,
                System: newBop.System,
                testDate: formatDateForSave(newBop.testDate || ''),
                nextDate: formatDateForSave(newBop.nextDate || '')
            };
            const updatedSystems = [...bopSystems, newSystem];
            setBopSystems(updatedSystems);
            if (onBopUpdate) {
                const apiData = updatedSystems.map(({ id, _id, system, ...rest }) => ({
                    System: rest.System,
                    testDate: rest.testDate,
                    nextDate: rest.nextDate
                }));
                await onBopUpdate(apiData);
            }
            setAddBopDialogOpen(false);
            setNewBop({ System: '', testDate: '', nextDate: '' });
        }
    };

    const moveBopUp = async (index: number) => {
        if (index === 0) return;
        const newSystems = [...bopSystems];
        [newSystems[index - 1], newSystems[index]] = [newSystems[index], newSystems[index - 1]];
        setBopSystems(newSystems);
        if (onBopUpdate) {
            const apiData = newSystems.map(({ id, _id, system, ...rest }) => ({
                System: rest.System,
                testDate: rest.testDate,
                nextDate: rest.nextDate
            }));
            await onBopUpdate(apiData);
        }
    };

    const moveBopDown = async (index: number) => {
        if (index === bopSystems.length - 1) return;
        const newSystems = [...bopSystems];
        [newSystems[index + 1], newSystems[index]] = [newSystems[index], newSystems[index + 1]];
        setBopSystems(newSystems);
        if (onBopUpdate) {
            const apiData = newSystems.map(({ id, _id, system, ...rest }) => ({
                System: rest.System,
                testDate: rest.testDate,
                nextDate: rest.nextDate
            }));
            await onBopUpdate(apiData);
        }
    };

    // Mud Pump Liners handlers
    const handleEditMud = (index: number) => {
        const liner = mudPumpLiners[index];
        setEditingMudIndex(index);
        setEditingMudData({ 
            pump: liner.pump,
            liner: liner.liner,
            galStk: liner.galStk || liner.galPerStk || 0,
            bblStk: liner.bblStk || liner.bblPerStk || 0
        });
    };

    const handleCancelMudEdit = () => {
        setEditingMudIndex(null);
        setEditingMudData({});
    };

    const handleSaveMudEdit = async () => {
        if (editingMudIndex !== null && editingMudData) {
            const updatedLiners = [...mudPumpLiners];
            const currentLiner = mudPumpLiners[editingMudIndex];
            updatedLiners[editingMudIndex] = {
                ...currentLiner,
                pump: editingMudData.pump || currentLiner.pump,
                liner: editingMudData.liner || currentLiner.liner,
                galStk: editingMudData.galStk !== undefined ? editingMudData.galStk : currentLiner.galStk,
                bblStk: editingMudData.bblStk !== undefined ? editingMudData.bblStk : currentLiner.bblStk,
                galPerStk: editingMudData.galStk !== undefined ? editingMudData.galStk : currentLiner.galPerStk,
                bblPerStk: editingMudData.bblStk !== undefined ? editingMudData.bblStk : currentLiner.bblPerStk
            };
            setMudPumpLiners(updatedLiners);
            if (onMudPumpUpdate) {
                const apiData = updatedLiners.map(({ id, _id, galPerStk, bblPerStk, ...rest }) => rest);
                await onMudPumpUpdate(apiData);
            }
            setEditingMudIndex(null);
            setEditingMudData({});
        }
    };

    const handleMudInputChange = (field: keyof MudPumpLiner, value: string | number) => {
        setEditingMudData({ ...editingMudData, [field]: value });
    };

    const handleDeleteMud = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this mud pump liner?')) {
            const updatedLiners = mudPumpLiners.filter((_, i) => i !== index);
            setMudPumpLiners(updatedLiners);
            if (onMudPumpUpdate) {
                const apiData = updatedLiners.map(({ id, _id, galPerStk, bblPerStk, ...rest }) => rest);
                await onMudPumpUpdate(apiData);
            }
        }
    };

    const handleAddMud = async () => {
        if (newMud.pump) {
            const newLiner: MudPumpLiner = {
                id: `mud_${Date.now()}`,
                pump: newMud.pump || 0,
                liner: newMud.liner || '',
                galStk: newMud.galStk || 0,
                bblStk: newMud.bblStk || 0,
                galPerStk: newMud.galStk || 0,
                bblPerStk: newMud.bblStk || 0
            };
            const updatedLiners = [...mudPumpLiners, newLiner];
            setMudPumpLiners(updatedLiners);
            if (onMudPumpUpdate) {
                const apiData = updatedLiners.map(({ id, _id, galPerStk, bblPerStk, ...rest }) => rest);
                await onMudPumpUpdate(apiData);
            }
            setAddMudDialogOpen(false);
            setNewMud({ pump: 0, liner: '', galStk: 0, bblStk: 0 });
        }
    };

    const moveMudUp = async (index: number) => {
        if (index === 0) return;
        const newLiners = [...mudPumpLiners];
        [newLiners[index - 1], newLiners[index]] = [newLiners[index], newLiners[index - 1]];
        setMudPumpLiners(newLiners);
        if (onMudPumpUpdate) {
            const apiData = newLiners.map(({ id, _id, galPerStk, bblPerStk, ...rest }) => rest);
            await onMudPumpUpdate(apiData);
        }
    };

    const moveMudDown = async (index: number) => {
        if (index === mudPumpLiners.length - 1) return;
        const newLiners = [...mudPumpLiners];
        [newLiners[index + 1], newLiners[index]] = [newLiners[index], newLiners[index + 1]];
        setMudPumpLiners(newLiners);
        if (onMudPumpUpdate) {
            const apiData = newLiners.map(({ id, _id, galPerStk, bblPerStk, ...rest }) => rest);
            await onMudPumpUpdate(apiData);
        }
    };

    const truncateText = (text: string, maxLen: number = 12) => {
        if (!text) return '—';
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + '...';
    };

    return (
        <div className="bop-container">
            {/* BOP Systems Data Table */}
            <Paper className="info-table" elevation={0}>
                <div className="table-header-dark">
                    <Typography variant="h6" className="table-title-dark">
                        BOP SYSTEMS DATA
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={() => setAddBopDialogOpen(true)} className="add-row-btn-dark">
                            <Add fontSize="small" />
                        </IconButton>
                    )}
                </div>
                <TableContainer className="bop-table-container">
                    <Table size="small" className="bop-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="bop-header-cell-dark">System</TableCell>
                                <TableCell className="bop-header-cell-dark date-header">Test Date</TableCell>
                                <TableCell className="bop-header-cell-dark date-header">Next Date</TableCell>
                                {!readOnly && <TableCell className="bop-header-cell-dark action-header-cell"> </TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bopSystems.map((system, idx) => {
                                const isUrgent = isDateUrgent(system.nextDate);
                                return (
                                    <TableRow key={system.id || idx}>
                                        {editingBopIndex === idx ? (
                                            <>
                                                <TableCell className="editing-cell compact">
                                                    <TextField
                                                        size="small"
                                                        value={editingBopData.System || ''}
                                                        onChange={(e) => handleBopInputChange('System', e.target.value)}
                                                        fullWidth
                                                        inputProps={{ style: { fontSize: '0.55rem', padding: '2px 4px' } }}
                                                    />
                                                </TableCell>
                                                <TableCell className="editing-cell compact">
                                                    <TextField
                                                        size="small"
                                                        type="date"
                                                        value={editingBopData.testDate || ''}
                                                        onChange={(e) => handleBopInputChange('testDate', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        inputProps={{ style: { fontSize: '0.55rem', padding: '2px 4px', width: '90px' } }}
                                                    />
                                                </TableCell>
                                                <TableCell className="editing-cell compact">
                                                    <TextField
                                                        size="small"
                                                        type="date"
                                                        value={editingBopData.nextDate || ''}
                                                        onChange={(e) => handleBopInputChange('nextDate', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        inputProps={{ style: { fontSize: '0.55rem', padding: '2px 4px', width: '90px' } }}
                                                    />
                                                </TableCell>
                                                <TableCell className="editing-actions-cell">
                                                    <IconButton size="small" onClick={() => moveBopUp(idx)} disabled={idx === 0}>
                                                        <ArrowUpward fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => moveBopDown(idx)} disabled={idx === bopSystems.length - 1}>
                                                        <ArrowDownward fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDeleteBop(idx)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
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
                                                <TableCell className="bop-system-cell-dark" title={getSystemName(system)}>
                                                    {truncateText(getSystemName(system), 18)}
                                                </TableCell>
                                                <TableCell className="bop-date-cell-dark">{system.testDate || '—'}</TableCell>
                                                <TableCell 
                                                    className={`bop-date-cell-dark ${isUrgent ? 'date-urgent' : ''}`}
                                                    title={isUrgent ? '⚠️ Date is past or within 3 days!' : ''}
                                                >
                                                    {system.nextDate || '—'}
                                                </TableCell>
                                                {!readOnly && (
                                                    <TableCell className="action-cell">
                                                        <IconButton size="small" onClick={() => handleEditBop(idx)}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* MUD PUMP LINERS Table */}
            <Paper className="info-table" elevation={0}>
                <div className="table-header-dark">
                    <Typography variant="h6" className="table-title-dark">
                        MUD PUMP LINERS
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={() => setAddMudDialogOpen(true)} className="add-row-btn-dark">
                            <Add fontSize="small" />
                        </IconButton>
                    )}
                </div>
                <TableContainer>
                    <Table size="small" className="mud-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="pump-header-cell-dark">Pump</TableCell>
                                <TableCell className="pump-header-cell-dark">Liner</TableCell>
                                <TableCell className="pump-header-cell-dark" align="right">gal/stk</TableCell>
                                <TableCell className="pump-header-cell-dark" align="right">bbl/stk</TableCell>
                                {!readOnly && <TableCell className="pump-header-cell-dark action-header-cell"> </TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mudPumpLiners.map((liner, idx) => (
                                <TableRow key={liner.id || idx}>
                                    {editingMudIndex === idx ? (
                                        <>
                                            <TableCell className="editing-cell compact">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={editingMudData.pump || 0}
                                                    onChange={(e) => handleMudInputChange('pump', parseInt(e.target.value) || 0)}
                                                    inputProps={{ style: { fontSize: '0.5rem', padding: '2px', textAlign: 'center' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell compact">
                                                <TextField
                                                    size="small"
                                                    value={editingMudData.liner || ''}
                                                    onChange={(e) => handleMudInputChange('liner', e.target.value)}
                                                    inputProps={{ style: { fontSize: '0.5rem', padding: '2px', width: '50px' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell compact" align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={editingMudData.galStk || 0}
                                                    onChange={(e) => handleMudInputChange('galStk', parseFloat(e.target.value) || 0)}
                                                    inputProps={{ style: { fontSize: '0.5rem', padding: '2px', width: '55px', textAlign: 'right' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-cell compact" align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={editingMudData.bblStk || 0}
                                                    onChange={(e) => handleMudInputChange('bblStk', parseFloat(e.target.value) || 0)}
                                                    inputProps={{ style: { fontSize: '0.5rem', padding: '2px', width: '55px', textAlign: 'right' } }}
                                                />
                                            </TableCell>
                                            <TableCell className="editing-actions-cell">
                                                <IconButton size="small" onClick={() => moveMudUp(idx)} disabled={idx === 0}>
                                                    <ArrowUpward fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => moveMudDown(idx)} disabled={idx === mudPumpLiners.length - 1}>
                                                    <ArrowDownward fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDeleteMud(idx)} color="error">
                                                    <Delete fontSize="small" />
                                                </IconButton>
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
                                            <TableCell className="pump-value-cell-dark">{liner.pump}</TableCell>
                                            <TableCell className="pump-value-cell-dark">{truncateText(liner.liner, 8)}</TableCell>
                                            <TableCell className="pump-value-cell-dark" align="right">{formatNumber(liner.galStk || liner.galPerStk, 2)}</TableCell>
                                            <TableCell className="pump-value-cell-dark" align="right">{formatNumber(liner.bblStk || liner.bblPerStk, 4)}</TableCell>
                                            {!readOnly && (
                                                <TableCell className="action-cell">
                                                    <IconButton size="small" onClick={() => handleEditMud(idx)}>
                                                        <Edit fontSize="small" />
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
                        value={newBop.System}
                        onChange={(e) => setNewBop({ ...newBop, System: e.target.value })}
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
                    />
                    <TextField
                        margin="dense"
                        label="gal/stk"
                        type="number"
                        fullWidth
                        value={newMud.galStk}
                        onChange={(e) => setNewMud({ ...newMud, galStk: parseFloat(e.target.value) || 0 })}
                    />
                    <TextField
                        margin="dense"
                        label="bbl/stk"
                        type="number"
                        fullWidth
                        value={newMud.bblStk}
                        onChange={(e) => setNewMud({ ...newMud, bblStk: parseFloat(e.target.value) || 0 })}
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

export default BOPSystems;