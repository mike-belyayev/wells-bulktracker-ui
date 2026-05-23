// src/pages/EquipmentPage.tsx
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import { Settings, Dashboard, Refresh, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WellInformation, MudPitFluidData, LastUpdated } from '../components/Dashboard';
import { SupplyVesselsTable, type SupplyVessel } from '../components/SupplyVessels';
import './EquipmentPage.css';

// Import types from LastUpdated
import type { BopSystem, MudPumpLiner } from '../components/Dashboard/LastUpdated';
// Import CasingProfile type from WellInformation
import type { CasingProfile } from '../components/Dashboard/WellInformation';

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
    
    // Fix: Use undefined instead of null with proper typing
    const [wellData, setWellData] = useState<{
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        casingProfiles?: CasingProfile[];
    } | undefined>(undefined);
    
    const [fluidData, setFluidData] = useState<any>(undefined);
    
    // Last Updated data states
    const [lastUpdatedDate] = useState<string>('15-JAN-2025');
    const [bopSystemsData] = useState<BopSystem[]>([
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
    ]);
    
    const [mudPumpLinersData] = useState<MudPumpLiner[]>([
        { id: '1', pump: 1, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 },
        { id: '2', pump: 2, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 },
        { id: '3', pump: 3, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 },
        { id: '4', pump: 4, liner: "6''", galPerStk: 5.34, bblPerStk: 0.1272 }
    ]);
    
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
    const handleVesselsChange = (newVessels: SupplyVessel[]) => {
        setVessels(newVessels);
        // Here you would also save to API
    };

    const handleSaveVessel = async (vessel: SupplyVessel) => {
        console.log('Saving vessel:', vessel);
        // await fetch(API_ENDPOINTS.SUPPLY_VESSEL, { method: 'PUT', body: JSON.stringify(vessel) });
    };

    const handleDeleteVessel = async (id: string) => {
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
                            <WellInformation wellData={wellData} />
                        </div>

                        {/* Middle Column - Mud Pit Capacities & Fluid Data (50%) */}
                        <div className="column middle-column">
                            <MudPitFluidData fluidData={fluidData} />
                        </div>

                        {/* Right Column - Last Updated (25%) */}
                        <div className="column right-column">
                            <LastUpdated 
                                lastUpdatedDate={lastUpdatedDate}
                                bopSystemsData={bopSystemsData}
                                mudPumpLinersData={mudPumpLinersData}
                            />
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION - Height determined by content */}
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