// src/components/Dashboard/BOPSystems.tsx
import { useState, useEffect } from 'react';
import { 
    Paper, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton, TextField, Dialog, 
    DialogTitle, DialogContent, DialogActions, Button,
    Tooltip
} from '@mui/material';
import { Edit, Save, Cancel, Add, Delete, ArrowUpward, ArrowDownward, Info } from '@mui/icons-material';
import './BOPSystems.css';

export interface BopSystem {
    id?: string;
    System: string;
    testDate: string;
    nextDate: string;
    testPeriod: string; // New field - stored as string but will contain number
}

export interface MudPumpLiner {
    id?: string;
    pump: string;
    liner: string;
    galStk: string;
    bblStk: string;
}

export interface BOPSystemsProps {
    wellId?: string;
    bopSystemsData?: BopSystem[];
    mudPumpLinersData?: MudPumpLiner[];
    onBopUpdate?: (data: BopSystem[]) => Promise<void>;
    onMudPumpUpdate?: (data: MudPumpLiner[]) => Promise<void>;
    readOnly?: boolean;
}

// Helper functions for date formatting - Fixing the day offset issue
const formatDateToDisplay = (dateString: string): string => {
    if (!dateString) return '—';
    try {
        // If it's already in DD-MMM-YYYY format, return as is
        if (dateString.match(/^\d{2}-[A-Za-z]{3}-\d{4}$/)) {
            return dateString;
        }
        
        // Parse the date without timezone offset
        let year: number, month: number, day: number;
        
        if (dateString.includes('T')) {
            // ISO format: 2026-05-22T00:00:00.000Z
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
        const displayYear = year;
        
        return `${displayDay}-${displayMonth}-${displayYear}`;
    } catch {
        return dateString;
    }
};

const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
        // Handle DD-MMM-YYYY format
        const match = dateString.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
        if (match) {
            const monthMap: { [key: string]: string } = {
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
                'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
                'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            const month = monthMap[match[2].toUpperCase()];
            if (month) {
                return `${match[3]}-${month}-${match[1]}`;
            }
        }
        
        // Handle ISO format
        const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        }
        
        // Handle any other format by trying to create a date at noon UTC to avoid offset
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        console.error('Date parsing error:', e);
    }
    return '';
};

const formatDateForSave = (dateString: string): string => {
    if (!dateString) return '';
    // If already in the correct format, return as is
    if (dateString.match(/^\d{2}-[A-Za-z]{3}-\d{4}$/)) {
        return dateString;
    }
    // Convert YYYY-MM-DD to DD-MMM-YYYY
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const monthMap: { [key: string]: string } = {
            '01': 'JAN', '02': 'FEB', '03': 'MAR', '04': 'APR',
            '05': 'MAY', '06': 'JUN', '07': 'JUL', '08': 'AUG',
            '09': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DEC'
        };
        const month = monthMap[match[2]];
        if (month) {
            return `${match[3]}-${month}-${match[1]}`;
        }
    }
    return dateString;
};

// Calculate next test date based on test period
const calculateNextDate = (testDate: string, testPeriod: string): string => {
    if (!testDate || !testPeriod) return '';
    
    // Validate that testPeriod is a valid number
    const periodDays = parseInt(testPeriod);
    if (isNaN(periodDays) || periodDays <= 0) return '';
    
    try {
        // Parse the test date
        let dateObj: Date;
        
        // Handle DD-MMM-YYYY format
        const match = testDate.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
        if (match) {
            const monthMap: { [key: string]: number } = {
                'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3,
                'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7,
                'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
            };
            const day = parseInt(match[1]);
            const month = monthMap[match[2].toUpperCase()];
            const year = parseInt(match[3]);
            dateObj = new Date(year, month, day);
        } else {
            // Try parsing as ISO or other formats
            dateObj = new Date(testDate);
        }
        
        if (isNaN(dateObj.getTime())) return '';
        
        // Add the test period in days
        const nextDate = new Date(dateObj);
        nextDate.setDate(nextDate.getDate() + periodDays);
        
        // Format as DD-MMM-YYYY
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const day = String(nextDate.getDate()).padStart(2, '0');
        const month = monthNames[nextDate.getMonth()];
        const year = nextDate.getFullYear();
        
        return `${day}-${month}-${year}`;
    } catch {
        return '';
    }
};

// Check if date is urgent (past due OR within 3 days)
const isDateUrgent = (dateString: string): boolean => {
    if (!dateString || dateString === '—') return false;
    try {
        // Parse DD-MMM-YYYY format
        const match = dateString.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
        if (match) {
            const monthMap: { [key: string]: number } = {
                'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3,
                'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7,
                'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
            };
            const day = parseInt(match[1]);
            const month = monthMap[match[2].toUpperCase()];
            const year = parseInt(match[3]);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const targetDate = new Date(year, month, day);
            targetDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Highlight if date is past (diffDays < 0) OR within 3 days (diffDays <= 3)
            return diffDays < 0 || (diffDays >= 0 && diffDays <= 3);
        }
    } catch {
        return false;
    }
    return false;
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
    const [bopDialogOpen, setBopDialogOpen] = useState(false);
    const [mudDialogOpen, setMudDialogOpen] = useState(false);
    const [tempBopSystems, setTempBopSystems] = useState<BopSystem[]>([]);
    const [tempMudLiners, setTempMudLiners] = useState<MudPumpLiner[]>([]);
    const [editingBopIndex, setEditingBopIndex] = useState<number | null>(null);
    const [editingBopData, setEditingBopData] = useState<Partial<BopSystem>>({});
    const [editingMudIndex, setEditingMudIndex] = useState<number | null>(null);
    const [editingMudData, setEditingMudData] = useState<Partial<MudPumpLiner>>({});
    const [bopTableName, setBopTableName] = useState('BOP SYSTEMS DATA');
    const [mudTableName, setMudTableName] = useState('MUD PUMP LINERS');

    useEffect(() => {
        if (initialBopData && initialBopData.length > 0) {
            const formattedData = initialBopData.map((system, idx) => ({
                id: system.id || `bop_${idx}`,
                System: system.System || '',
                testDate: formatDateToDisplay(system.testDate),
                nextDate: formatDateToDisplay(system.nextDate),
                testPeriod: system.testPeriod || '' // Include testPeriod
            }));
            setBopSystems(formattedData);
        } else {
            setBopSystems([]);
        }
        
        if (initialMudPumpData && initialMudPumpData.length > 0) {
            const formattedData = initialMudPumpData.map((liner, idx) => ({
                id: liner.id || `mud_${idx}`,
                pump: liner.pump || '',
                liner: liner.liner || '',
                galStk: liner.galStk || '',
                bblStk: liner.bblStk || ''
            }));
            setMudPumpLiners(formattedData);
        } else {
            setMudPumpLiners([]);
        }
    }, [initialBopData, initialMudPumpData]);

    const handleOpenBopDialog = () => {
        setTempBopSystems(JSON.parse(JSON.stringify(bopSystems)));
        setEditingBopIndex(null);
        setBopDialogOpen(true);
    };

    const handleOpenMudDialog = () => {
        setTempMudLiners(JSON.parse(JSON.stringify(mudPumpLiners)));
        setEditingMudIndex(null);
        setMudDialogOpen(true);
    };

    const handleCloseBopDialog = () => {
        setBopDialogOpen(false);
        setEditingBopIndex(null);
        setEditingBopData({});
    };

    const handleCloseMudDialog = () => {
        setMudDialogOpen(false);
        setEditingMudIndex(null);
        setEditingMudData({});
    };

    const handleSaveBopSystems = async () => {
        if (onBopUpdate) {
            const systemsToSave = tempBopSystems.map((s) => ({
                System: s.System,
                testDate: formatDateForSave(s.testDate),
                nextDate: formatDateForSave(s.nextDate),
                testPeriod: s.testPeriod || '' // Include testPeriod
            }));
            await onBopUpdate(systemsToSave);
            setBopSystems(tempBopSystems);
            handleCloseBopDialog();
        }
    };

    const handleSaveMudLiners = async () => {
        if (onMudPumpUpdate) {
            const linersToSave = tempMudLiners.map((l) => ({
                pump: l.pump,
                liner: l.liner,
                galStk: l.galStk,
                bblStk: l.bblStk
            }));
            await onMudPumpUpdate(linersToSave);
            setMudPumpLiners(tempMudLiners);
            handleCloseMudDialog();
        }
    };

    // BOP edit handlers
    const handleEditBop = (index: number) => {
        setEditingBopIndex(index);
        setEditingBopData({ ...tempBopSystems[index] });
    };

    const handleCancelBopEdit = () => {
        setEditingBopIndex(null);
        setEditingBopData({});
    };

    const handleSaveBopEdit = () => {
        if (editingBopIndex !== null && editingBopData) {
            const updated = [...tempBopSystems];
            const updatedSystem = { ...updated[editingBopIndex], ...editingBopData };
            
            // Auto-calculate next date if test date and period are set
            if (updatedSystem.testDate && updatedSystem.testPeriod) {
                const calculatedNextDate = calculateNextDate(updatedSystem.testDate, updatedSystem.testPeriod);
                if (calculatedNextDate) {
                    updatedSystem.nextDate = calculatedNextDate;
                }
            } else if (!updatedSystem.testPeriod) {
                // If no test period, don't auto-update next date
                // Keep the existing next date or clear it
                if (!updatedSystem.nextDate) {
                    updatedSystem.nextDate = '';
                }
            }
            
            updated[editingBopIndex] = updatedSystem;
            setTempBopSystems(updated);
            setEditingBopIndex(null);
            setEditingBopData({});
        }
    };

    const handleBopInputChange = (field: keyof BopSystem, value: string) => {
        setEditingBopData({ ...editingBopData, [field]: value });
    };

    // Special handler for test date changes - auto-calculate next date if period is set
    const handleTestDateChange = (value: string) => {
        const updatedData = { ...editingBopData, testDate: value };
        
        // If test period is set, auto-calculate next date
        if (value && editingBopData.testPeriod) {
            const calculatedNextDate = calculateNextDate(value, editingBopData.testPeriod);
            if (calculatedNextDate) {
                updatedData.nextDate = calculatedNextDate;
            }
        }
        
        setEditingBopData(updatedData);
    };

    // Special handler for test period changes - auto-calculate next date if test date is set
    const handleTestPeriodChange = (value: string) => {
        // Only allow numbers, empty string
        if (value !== '' && !/^\d+$/.test(value)) {
            return;
        }
        
        const updatedData = { ...editingBopData, testPeriod: value };
        
        // If test date is set and period is not empty, auto-calculate next date
        if (editingBopData.testDate && value) {
            const calculatedNextDate = calculateNextDate(editingBopData.testDate, value);
            if (calculatedNextDate) {
                updatedData.nextDate = calculatedNextDate;
            }
        } else if (!value) {
            // If period is cleared, clear the next date
            updatedData.nextDate = '';
        }
        
        setEditingBopData(updatedData);
    };

    const handleAddBop = () => {
        const newSystem: BopSystem = {
            id: `bop_${Date.now()}`,
            System: '',
            testDate: '',
            nextDate: '',
            testPeriod: ''
        };
        setTempBopSystems([...tempBopSystems, newSystem]);
        setEditingBopIndex(tempBopSystems.length);
        setEditingBopData(newSystem);
    };

    const handleDeleteBop = (index: number) => {
        if (window.confirm('Are you sure you want to delete this BOP system?')) {
            const updated = tempBopSystems.filter((_, i) => i !== index);
            setTempBopSystems(updated);
            if (editingBopIndex === index) {
                setEditingBopIndex(null);
                setEditingBopData({});
            }
        }
    };

    const moveBopUp = (index: number) => {
        if (index === 0) return;
        const newSystems = [...tempBopSystems];
        [newSystems[index - 1], newSystems[index]] = [newSystems[index], newSystems[index - 1]];
        setTempBopSystems(newSystems);
    };

    const moveBopDown = (index: number) => {
        if (index === tempBopSystems.length - 1) return;
        const newSystems = [...tempBopSystems];
        [newSystems[index + 1], newSystems[index]] = [newSystems[index], newSystems[index + 1]];
        setTempBopSystems(newSystems);
    };

    // Mud Pump edit handlers
    const handleEditMud = (index: number) => {
        setEditingMudIndex(index);
        setEditingMudData({ ...tempMudLiners[index] });
    };

    const handleCancelMudEdit = () => {
        setEditingMudIndex(null);
        setEditingMudData({});
    };

    const handleSaveMudEdit = () => {
        if (editingMudIndex !== null && editingMudData) {
            const updated = [...tempMudLiners];
            updated[editingMudIndex] = { ...updated[editingMudIndex], ...editingMudData };
            setTempMudLiners(updated);
            setEditingMudIndex(null);
            setEditingMudData({});
        }
    };

    const handleMudInputChange = (field: keyof MudPumpLiner, value: string) => {
        setEditingMudData({ ...editingMudData, [field]: value });
    };

    const handleAddMud = () => {
        const newLiner: MudPumpLiner = {
            id: `mud_${Date.now()}`,
            pump: '',
            liner: '',
            galStk: '',
            bblStk: ''
        };
        setTempMudLiners([...tempMudLiners, newLiner]);
        setEditingMudIndex(tempMudLiners.length);
        setEditingMudData(newLiner);
    };

    const handleDeleteMud = (index: number) => {
        if (window.confirm('Are you sure you want to delete this mud pump liner?')) {
            const updated = tempMudLiners.filter((_, i) => i !== index);
            setTempMudLiners(updated);
            if (editingMudIndex === index) {
                setEditingMudIndex(null);
                setEditingMudData({});
            }
        }
    };

    const moveMudUp = (index: number) => {
        if (index === 0) return;
        const newLiners = [...tempMudLiners];
        [newLiners[index - 1], newLiners[index]] = [newLiners[index], newLiners[index - 1]];
        setTempMudLiners(newLiners);
    };

    const moveMudDown = (index: number) => {
        if (index === tempMudLiners.length - 1) return;
        const newLiners = [...tempMudLiners];
        [newLiners[index + 1], newLiners[index]] = [newLiners[index], newLiners[index + 1]];
        setTempMudLiners(newLiners);
    };

    const truncateText = (text: string, maxLen: number = 15) => {
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
                        {bopTableName}
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={handleOpenBopDialog} className="edit-table-btn" title="Edit Table">
                            <Edit fontSize="small" />
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bopSystems.map((system, idx) => {
                                const isUrgent = isDateUrgent(system.nextDate);
                                return (
                                    <TableRow key={system.id || idx}>
                                        <TableCell className="bop-system-cell-dark" title={system.System}>
                                            {truncateText(system.System, 20)}
                                        </TableCell>
                                        <TableCell className="bop-date-cell-dark">{system.testDate || '—'}</TableCell>
                                        <TableCell 
                                            className={`bop-date-cell-dark ${isUrgent ? 'date-urgent' : ''}`}
                                            title={isUrgent ? '⚠️ Date is past or within 3 days!' : ''}
                                        >
                                            {system.nextDate || '—'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {bopSystems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" className="empty-cell">
                                        No data. Click Edit to add records.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* MUD PUMP LINERS Table */}
            <Paper className="info-table" elevation={0}>
                <div className="table-header-dark">
                    <Typography variant="h6" className="table-title-dark">
                        {mudTableName}
                    </Typography>
                    {!readOnly && (
                        <IconButton size="small" onClick={handleOpenMudDialog} className="edit-table-btn" title="Edit Table">
                            <Edit fontSize="small" />
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mudPumpLiners.map((liner, idx) => (
                                <TableRow key={liner.id || idx}>
                                    <TableCell className="pump-value-cell-dark">{liner.pump || '—'}</TableCell>
                                    <TableCell className="pump-value-cell-dark">{truncateText(liner.liner, 8)}</TableCell>
                                    <TableCell className="pump-value-cell-dark" align="right">{liner.galStk || '—'}</TableCell>
                                    <TableCell className="pump-value-cell-dark" align="right">{liner.bblStk || '—'}</TableCell>
                                </TableRow>
                            ))}
                            {mudPumpLiners.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" className="empty-cell">
                                        No data. Click Edit to add records.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Edit BOP Systems Dialog */}
            <Dialog open={bopDialogOpen} onClose={handleCloseBopDialog} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <TextField
                        value={bopTableName}
                        onChange={(e) => setBopTableName(e.target.value)}
                        variant="standard"
                        InputProps={{ style: { fontSize: '1.25rem', fontWeight: 'bold' } }}
                        fullWidth
                    />
                </DialogTitle>
                <DialogContent>
                    <div className="edit-list">
                        {tempBopSystems.map((system, idx) => (
                            <div key={idx} className="edit-row">
                                {editingBopIndex === idx ? (
                                    <div className="edit-fields">
                                        <TextField
                                            size="small"
                                            label="System Name"
                                            value={editingBopData.System || ''}
                                            onChange={(e) => handleBopInputChange('System', e.target.value)}
                                            sx={{ width: 180 }}
                                            autoFocus
                                        />
                                        <TextField
                                            size="small"
                                            label="Test Date"
                                            type="date"
                                            value={formatDateForInput(editingBopData.testDate || '')}
                                            onChange={(e) => handleTestDateChange(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: 140 }}
                                        />
                                        <TextField
                                            size="small"
                                            label="Test Period (days)"
                                            value={editingBopData.testPeriod || ''}
                                            onChange={(e) => handleTestPeriodChange(e.target.value)}
                                            placeholder="e.g., 7, 14, 30"
                                            helperText="Enter number of days"
                                            sx={{ width: 160 }}
                                            InputProps={{
                                                inputProps: { 
                                                    min: 1,
                                                    step: 1,
                                                    pattern: '[0-9]*'
                                                }
                                            }}
                                        />
                                        <TextField
                                            size="small"
                                            label="Next Date"
                                            type="date"
                                            value={formatDateForInput(editingBopData.nextDate || '')}
                                            onChange={(e) => handleBopInputChange('nextDate', e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: 140 }}
                                            disabled={!!(editingBopData.testDate && editingBopData.testPeriod)}
                                            helperText={editingBopData.testDate && editingBopData.testPeriod ? "Auto-calculated" : "Manual entry"}
                                        />
                                        <Tooltip title="Next date auto-calculates when both Test Date and Test Period are set">
                                            <Info fontSize="small" color="info" sx={{ ml: 1 }} />
                                        </Tooltip>
                                        <div className="edit-actions">
                                            <IconButton size="small" onClick={handleSaveBopEdit} color="primary">
                                                <Save fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={handleCancelBopEdit} color="secondary">
                                                <Cancel fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="edit-row-content">
                                        <span className="edit-system" title={system.System}>{truncateText(system.System, 25)}</span>
                                        <span className="edit-date">{system.testDate || '—'}</span>
                                        <span className="edit-date">{system.nextDate || '—'}</span>
                                        <div className="edit-actions">
                                            <IconButton size="small" onClick={() => moveBopUp(idx)} disabled={idx === 0}>
                                                <ArrowUpward fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => moveBopDown(idx)} disabled={idx === tempBopSystems.length - 1}>
                                                <ArrowDownward fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEditBop(idx)} color="primary">
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteBop(idx)} color="error">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button size="small" startIcon={<Add />} onClick={handleAddBop} className="add-row-btn">
                        Add BOP System
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBopDialog}>Cancel</Button>
                    <Button onClick={handleSaveBopSystems} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Mud Pump Liners Dialog */}
            <Dialog open={mudDialogOpen} onClose={handleCloseMudDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <TextField
                        value={mudTableName}
                        onChange={(e) => setMudTableName(e.target.value)}
                        variant="standard"
                        InputProps={{ style: { fontSize: '1.25rem', fontWeight: 'bold' } }}
                        fullWidth
                    />
                </DialogTitle>
                <DialogContent>
                    <div className="edit-list">
                        {tempMudLiners.map((liner, idx) => (
                            <div key={idx} className="edit-row">
                                {editingMudIndex === idx ? (
                                    <div className="edit-fields">
                                        <TextField
                                            size="small"
                                            label="Pump"
                                            value={editingMudData.pump || ''}
                                            onChange={(e) => handleMudInputChange('pump', e.target.value)}
                                            sx={{ width: 80 }}
                                            autoFocus
                                        />
                                        <TextField
                                            size="small"
                                            label="Liner"
                                            value={editingMudData.liner || ''}
                                            onChange={(e) => handleMudInputChange('liner', e.target.value)}
                                            sx={{ width: 100 }}
                                        />
                                        <TextField
                                            size="small"
                                            label="gal/stk"
                                            value={editingMudData.galStk || ''}
                                            onChange={(e) => handleMudInputChange('galStk', e.target.value)}
                                            sx={{ width: 90 }}
                                        />
                                        <TextField
                                            size="small"
                                            label="bbl/stk"
                                            value={editingMudData.bblStk || ''}
                                            onChange={(e) => handleMudInputChange('bblStk', e.target.value)}
                                            sx={{ width: 90 }}
                                        />
                                        <div className="edit-actions">
                                            <IconButton size="small" onClick={handleSaveMudEdit} color="primary">
                                                <Save fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={handleCancelMudEdit} color="secondary">
                                                <Cancel fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="edit-row-content">
                                        <span className="edit-pump">{liner.pump || '—'}</span>
                                        <span className="edit-liner">{liner.liner || '—'}</span>
                                        <span className="edit-number">{liner.galStk || '—'}</span>
                                        <span className="edit-number">{liner.bblStk || '—'}</span>
                                        <div className="edit-actions">
                                            <IconButton size="small" onClick={() => moveMudUp(idx)} disabled={idx === 0}>
                                                <ArrowUpward fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => moveMudDown(idx)} disabled={idx === tempMudLiners.length - 1}>
                                                <ArrowDownward fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEditMud(idx)} color="primary">
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteMud(idx)} color="error">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button size="small" startIcon={<Add />} onClick={handleAddMud} className="add-row-btn">
                        Add Mud Pump Liner
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMudDialog}>Cancel</Button>
                    <Button onClick={handleSaveMudLiners} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BOPSystems;