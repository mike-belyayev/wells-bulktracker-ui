// src/pages/EquipmentPage.tsx
import { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Box, Button,
    Paper, Divider, Snackbar, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton as MuiIconButton, TextField
} from '@mui/material';
import { 
    Settings, Dashboard, Refresh, ExitToApp, 
    Delete, Add, Edit, Save, Cancel 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './EquipmentPage.css';

// Supply Vessel interface
interface SupplyVessel {
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
}

const EquipmentPage = () => {
    const { logout, user } = useAuth();
    const isAdmin = user?.isAdmin || false;
    const navigate = useNavigate();
    const userRig = user?.homeLocation || 'NSC';

    const [loading, setLoading] = useState(false);
    const [vessels, setVessels] = useState<SupplyVessel[]>([
        {
            id: '1',
            vessel: 'Supply Boat 1',
            location: 'Dock A',
            crewChange: 'Scheduled',
            fuelOil: 150,
            potWater: 200,
            drlWater: 100,
            barite: 50,
            baseOil: 75,
            cementG: 30
        },
        {
            id: '2',
            vessel: 'Supply Boat 2',
            location: 'Dock B',
            crewChange: 'Completed',
            fuelOil: 180,
            potWater: 220,
            drlWater: 120,
            barite: 60,
            baseOil: 85,
            cementG: 35
        },
        {
            id: '3',
            vessel: 'Supply Boat 3',
            location: 'Offshore',
            crewChange: 'Pending',
            fuelOil: 120,
            potWater: 180,
            drlWater: 90,
            barite: 40,
            baseOil: 65,
            cementG: 25
        }
    ]);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SupplyVessel>>({});
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Mock data fetching - replace with your actual API calls
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Replace with your actual API endpoint
            // const response = await fetch(API_ENDPOINTS.DASHBOARD, {
            //     headers: { 'Authorization': `Bearer ${user?.token}` }
            // });
            // const data = await response.json();
            
            console.log('Dashboard data fetched');
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            showSnackbar('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleRefresh = () => {
        fetchDashboardData();
        showSnackbar('Dashboard refreshed', 'success');
    };

    // Supply Vessel CRUD operations
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
        setVessels([...vessels, newVessel]);
        setEditingId(newVessel.id);
        setEditData(newVessel);
        showSnackbar('New vessel row added', 'success');
    };

    const handleDeleteVessel = (id: string) => {
        setVessels(vessels.filter(v => v.id !== id));
        showSnackbar('Vessel deleted', 'success');
    };

    const handleStartEdit = (vessel: SupplyVessel) => {
        setEditingId(vessel.id);
        setEditData(vessel);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSaveEdit = () => {
        if (editingId && editData) {
            setVessels(vessels.map(v => 
                v.id === editingId ? { ...v, ...editData } : v
            ));
            setEditingId(null);
            setEditData({});
            showSnackbar('Vessel updated successfully', 'success');
        }
    };

    const handleInputChange = (field: keyof SupplyVessel, value: string | number) => {
        setEditData({
            ...editData,
            [field]: value
        });
    };

    if (loading && !vessels.length) {
        return (
            <div className="equipment-container">
                <div className="loading-container">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="equipment-container">
            {/* Header - Stays at top */}
            <AppBar position="static" className="equipment-header">
                <Toolbar className="header-toolbar">
                    <Box className="header-left">
                        <Dashboard className="header-icon" />
                        <Typography variant="h6" className="header-title">
                            Dashboard - {userRig}
                        </Typography>

                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            className="refresh-btn"
                        >
                            Refresh
                        </Button>
                    </Box>

                    <Box className="header-right">
                        <Box className="dev-credit">
                            <Typography variant="caption">App developed for Wells Team by:</Typography>
                            <Typography variant="caption" className="dev-email">
                                Mike.Belyayev@exxonmobil.com
                            </Typography>
                        </Box>

                        {isAdmin && (
                            <IconButton onClick={() => navigate('/admin')} size="small" className="admin-btn">
                                <Settings />
                            </IconButton>
                        )}

                        <Typography variant="body2" noWrap className="user-name">
                            {user?.userName}
                            {isAdmin && " (admin)"}
                        </Typography>

                        <Button variant="text" onClick={logout} size="small" className="logout-btn" startIcon={<ExitToApp />}>
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content - Dynamic layout */}
            <div className="main-content">
                {/* TOP SECTION - Takes remaining space */}
                <div className="top-section">
                    <div className="three-column-layout">
                        {/* Left Column - Well Information (25%) */}
                        <div className="column left-column">
                            <Paper className="info-panel" elevation={3}>
                                <div className="panel-header">
                                    <Typography variant="h6" className="panel-title">
                                        Well Information
                                    </Typography>
                                </div>
                                <Divider />
                                <div className="panel-content">
                                    <Typography variant="body2" color="textSecondary" className="placeholder-text">
                                        Well details will appear here
                                    </Typography>
                                </div>
                            </Paper>
                        </div>

                        {/* Middle Column - Mud Pit Capacities & Fluid Data (50%) */}
                        <div className="column middle-column">
                            <Paper className="info-panel" elevation={3}>
                                <div className="panel-header">
                                    <Typography variant="h6" className="panel-title">
                                        Mud Pit Capacities & Fluid Data
                                    </Typography>
                                </div>
                                <Divider />
                                <div className="panel-content">
                                    <Typography variant="body2" color="textSecondary" className="placeholder-text">
                                        Mud pit and fluid data will appear here
                                    </Typography>
                                </div>
                            </Paper>
                        </div>

                        {/* Right Column - Last Updated (25%) */}
                        <div className="column right-column">
                            <Paper className="info-panel" elevation={3}>
                                <div className="panel-header">
                                    <Typography variant="h6" className="panel-title">
                                        Last Updated
                                    </Typography>
                                </div>
                                <Divider />
                                <div className="panel-content">
                                    <Typography variant="body2" color="textSecondary" className="placeholder-text">
                                        Recent updates will appear here
                                    </Typography>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION - Height determined by content */}
                <div className="bottom-section">
                    <Paper className="vessels-panel" elevation={3}>
                        <div className="vessels-header">
                            <Typography variant="h6" className="vessels-title">
                                Supply Vessels
                            </Typography>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                onClick={handleAddVessel}
                                className="add-vessel-btn"
                            >
                                Add Vessel
                            </Button>
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
                                        <TableCell className="table-header-cell actions-header">ACTIONS</TableCell>
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
                                                    <TableCell align="center">
                                                        <MuiIconButton size="small" onClick={() => handleStartEdit(vessel)} color="primary">
                                                            <Edit fontSize="small" />
                                                        </MuiIconButton>
                                                        <MuiIconButton size="small" onClick={() => handleDeleteVessel(vessel.id)} color="error">
                                                            <Delete fontSize="small" />
                                                        </MuiIconButton>
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>
            </div>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EquipmentPage;