// src/components/Dashboard/LastUpdated.tsx
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import './LastUpdated.css';

export interface LastUpdatedProps {
    lastUpdatedDate?: string;
    bopSystemsData?: BopSystem[];
    mudPumpLinersData?: MudPumpLiner[];
}

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

const LastUpdated = ({ 
    lastUpdatedDate = '15-JAN-2025',
    bopSystemsData = [
        { id: '1', system: 'BOP Pressure Test', testDate: '10-JAN-2025', nextDate: '10-FEB-2025' },
        { id: '2', system: 'BSR Pressure Test', testDate: '12-JAN-2025', nextDate: '12-FEB-2025' },
        { id: '3', system: 'BOP Function Test', testDate: '08-JAN-2025', nextDate: '08-FEB-2025' },
        { id: '4', system: 'Choke Manifold', testDate: '05-JAN-2025', nextDate: '05-FEB-2025' },
        { id: '5', system: 'Standpipe Manifold', testDate: '15-JAN-2025', nextDate: '15-FEB-2025' },
        { id: '6', system: 'Cement Manifold', testDate: '09-JAN-2025', nextDate: '09-FEB-2025' },
        { id: '7', system: 'TIW Grey Valves', testDate: '11-JAN-2025', nextDate: '11-FEB-2025' },
        { id: '8', system: 'I-BOPs', testDate: '07-JAN-2025', nextDate: '07-FEB-2025' },
        { id: '9', system: 'Diverter Function', testDate: '13-JAN-2025', nextDate: '13-FEB-2025' },
        { id: '10', system: 'CSR Function', testDate: '14-JAN-2025', nextDate: '14-FEB-2025' },
        { id: '11', system: 'BSR Function', testDate: '16-JAN-2025', nextDate: '16-FEB-2025' },
        { id: '12', system: 'WH Glycol Injection', testDate: '17-JAN-2025', nextDate: '17-FEB-2025' }
    ],
    mudPumpLinersData = [
        { id: '1', pump: 1, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 },
        { id: '2', pump: 2, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 },
        { id: '3', pump: 3, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 },
        { id: '4', pump: 4, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 }
    ]
}: LastUpdatedProps) => {
    return (
        <div className="last-updated-container">
            {/* Table 1: Last Updated */}
            <Paper className="info-table" elevation={3}>
                <div className="table-header">
                    <Typography variant="h6" className="table-title">
                        Last Updated
                    </Typography>
                </div>
                <TableContainer>
                    <Table size="small" className="compact-table">
                        <TableBody>
                            <TableRow>
                                <TableCell className="label-cell">Date</TableCell>
                                <TableCell className="value-cell">{lastUpdatedDate}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Table 2: BOP Systems Data */}
            <Paper className="info-table" elevation={3}>
                <div className="table-header">
                    <Typography variant="h6" className="table-title">
                        BOP Systems Data
                    </Typography>
                </div>
                <TableContainer className="bop-table-container">
                    <Table size="small" stickyHeader className="compact-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="bop-header-cell">System</TableCell>
                                <TableCell className="bop-header-cell">Test Date</TableCell>
                                <TableCell className="bop-header-cell">Next Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bopSystemsData.map((system) => (
                                <TableRow key={system.id} hover>
                                    <TableCell className="bop-system-cell">{system.system}</TableCell>
                                    <TableCell className="bop-date-cell">{system.testDate}</TableCell>
                                    <TableCell className="bop-date-cell">{system.nextDate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Table 3: MUD PUMP LINERS */}
            <Paper className="info-table" elevation={3}>
                <div className="table-header">
                    <Typography variant="h6" className="table-title">
                        MUD PUMP LINERS
                    </Typography>
                </div>
                <TableContainer>
                    <Table size="small" className="compact-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="pump-header-cell">Pump</TableCell>
                                <TableCell className="pump-header-cell">Liner</TableCell>
                                <TableCell className="pump-header-cell" align="right">gal/stk</TableCell>
                                <TableCell className="pump-header-cell" align="right">bbl/stk</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mudPumpLinersData.map((liner) => (
                                <TableRow key={liner.id} hover>
                                    <TableCell className="pump-value-cell">{liner.pump}</TableCell>
                                    <TableCell className="pump-value-cell">{liner.liner}</TableCell>
                                    <TableCell className="pump-value-cell" align="right">{liner.galPerStk.toFixed(4)}</TableCell>
                                    <TableCell className="pump-value-cell" align="right">{liner.bblPerStk.toFixed(4)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
};

export default LastUpdated;