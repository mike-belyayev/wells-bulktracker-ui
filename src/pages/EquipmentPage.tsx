// src/pages/EquipmentPage.tsx
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import { Settings, Dashboard, Refresh, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WellInformation, MudPitFluidData, LastUpdated } from '../components/Dashboard';
import { SupplyVesselsTable, type SupplyVessel } from '../components/SupplyVessels';
import './EquipmentPage.css';

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
    
    const [wellData, setWellData] = useState(null);
    const [fluidData, setFluidData] = useState(null);
    const [recentUpdates, setRecentUpdates] = useState([]);
    
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // API calls would go here
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch well data
            // const wellResponse = await fetch(API_ENDPOINTS.WELL_INFO);
            // setWellData(wellResponse.data);
            
            // Fetch fluid data
            // const fluidResponse = await fetch(API_ENDPOINTS.FLUID_DATA);
            // setFluidData(fluidResponse.data);
            
            // Fetch supply vessels
            // const vesselsResponse = await fetch(API_ENDPOINTS.SUPPLY_VESSELS);
            // setVessels(vesselsResponse.data);
            
            // Fetch recent updates
            // const updatesResponse = await fetch(API_ENDPOINTS.RECENT_UPDATES);
            // setRecentUpdates(updatesResponse.data);
            
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

    // API save handlers
    const handleVesselsChange = (newVessels: SupplyVessel[]) => {
        setVessels(newVessels);
        // Here you would also save to API
        // await saveVesselsToAPI(newVessels);
    };

    const handleSaveVessel = async (vessel: SupplyVessel) => {
        // Save individual vessel to API
        console.log('Saving vessel:', vessel);
        // await fetch(API_ENDPOINTS.SUPPLY_VESSEL, { method: 'PUT', body: JSON.stringify(vessel) });
    };

    const handleDeleteVessel = async (id: string) => {
        // Delete vessel from API
        console.log('Deleting vessel:', id);
        // await fetch(`${API_ENDPOINTS.SUPPLY_VESSEL}/${id}`, { method: 'DELETE' });
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
            {/* Header */}
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

            {/* Main Content */}
            <div className="main-content">
                {/* TOP SECTION - Three columns */}
                <div className="top-section">
                    <div className="three-column-layout">
                        <div className="column left-column">
                            <WellInformation 
                                wellData={wellData}
                                readOnly={!isAdmin}
                            />
                        </div>

                        <div className="column middle-column">
                            <MudPitFluidData 
                                fluidData={fluidData}
                                readOnly={!isAdmin}
                            />
                        </div>

                        <div className="column right-column">
                            <LastUpdated updates={recentUpdates} />
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION - Supply Vessels */}
                <div className="bottom-section">
                    <SupplyVesselsTable 
                        vessels={vessels}
                        onVesselsChange={handleVesselsChange}
                        onSave={handleSaveVessel}
                        onDelete={handleDeleteVessel}
                        readOnly={!isAdmin}
                    />
                </div>
            </div>

            {/* Snackbar */}
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