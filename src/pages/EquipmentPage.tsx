// src/pages/EquipmentPage.tsx
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import { Settings, Dashboard, Refresh, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WellInformation, MudPitFluidData, LastUpdated } from '../components/Dashboard';
import { SupplyVesselsTable, type SupplyVessel } from '../components/SupplyVessels';
import './EquipmentPage.css';
import wellApiService from '../services/wellApi';
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
    const [currentWellId, setCurrentWellId] = useState<string | null>(null);
    const [vessels, setVessels] = useState<SupplyVessel[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    
    const [wellData, setWellData] = useState<{
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        casingProfiles?: CasingProfile[];
    } | undefined>(undefined);
    
    const [fluidData] = useState<any>(undefined);
    
    // BOP Systems and Mud Pump Liners data
    const [bopSystemsData, setBopSystemsData] = useState<BopSystem[]>([
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
    
    const [mudPumpLinersData, setMudPumpLinersData] = useState<MudPumpLiner[]>([
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

    const { wellApi, supplyVesselApi, bopSystemsApi, mudPumpLinersApi } = wellApiService;

    // Format date for display
    const formatLastUpdated = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Load well data from API
    const loadWellData = async (wellId: string) => {
        try {
            setLoading(true);
            const well = await wellApi.getWell(wellId);
            setCurrentWellId(well._id);
            
            // Set last updated from well's updatedAt timestamp
            if (well.updatedAt) {
                setLastUpdated(formatLastUpdated(well.updatedAt));
            }
            
            setWellData({
                wellName: well.wellName,
                waterDepth: well.waterDepth ? Number(well.waterDepth) : undefined,
                airGap: well.airGap ? Number(well.airGap) : undefined,
                casingProfiles: well.casingProfile
            });
            
            // Load BOP Systems
            if (well.bopSystems && Array.isArray(well.bopSystems)) {
                setBopSystemsData(well.bopSystems);
            }
            
            // Load Mud Pump Liners
            if (well.mudPumpLiners && Array.isArray(well.mudPumpLiners)) {
                setMudPumpLinersData(well.mudPumpLiners);
            }
            
            // Load supply vessels
            if (well.supplyVessels && Array.isArray(well.supplyVessels)) {
                const formattedVessels = well.supplyVessels.map((vessel: any, index: number) => ({
                    id: vessel._id || index.toString(),
                    vessel: vessel.vesselName || '',
                    location: vessel.location || '',
                    crewChange: vessel.crewChange || '',
                    fuelOil: Number(vessel.fuelOil) || 0,
                    potWater: Number(vessel.potWater) || 0,
                    drlWater: Number(vessel.drlWater) || 0,
                    barite: Number(vessel.barite) || 0,
                    baseOil: Number(vessel.baseOil) || 0,
                    cementG: Number(vessel.cementG) || 0,
                    ...vessel.additionalFields
                }));
                setVessels(formattedVessels);
            }
            
            console.log('Well data loaded:', well.wellName);
        } catch (err) {
            console.error('Failed to load well data:', err);
            showSnackbar('Failed to load well data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Update last updated after any save operation
    const updateLastUpdated = () => {
        setLastUpdated(formatLastUpdated(new Date().toISOString()));
    };

    // Get well ID based on user's rig
    useEffect(() => {
        const fetchWellId = async () => {
            try {
                const wells = await wellApi.getWellsByOwner(userRig);
                if (wells && wells.length > 0) {
                    loadWellData(wells[0]._id);
                } else {
                    console.log('No wells found for owner:', userRig);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Failed to fetch wells:', err);
                setLoading(false);
            }
        };
        
        fetchWellId();
    }, [userRig]);

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleRefresh = () => {
        if (currentWellId) {
            loadWellData(currentWellId);
            showSnackbar('Dashboard refreshed', 'success');
        }
    };

    // BOP Systems handlers
    const handleBopUpdate = async (bopSystems: BopSystem[]) => {
        if (currentWellId) {
            try {
                await bopSystemsApi.updateBopSystems(currentWellId, bopSystems);
                setBopSystemsData(bopSystems);
                updateLastUpdated();
                showSnackbar('BOP systems updated', 'success');
            } catch (err) {
                console.error('Failed to update BOP systems:', err);
                showSnackbar('Failed to update BOP systems', 'error');
            }
        }
    };

    // Mud Pump Liners handlers
    const handleMudPumpUpdate = async (mudPumpLiners: MudPumpLiner[]) => {
        if (currentWellId) {
            try {
                await mudPumpLinersApi.updateMudPumpLiners(currentWellId, mudPumpLiners);
                setMudPumpLinersData(mudPumpLiners);
                updateLastUpdated();
                showSnackbar('Mud pump liners updated', 'success');
            } catch (err) {
                console.error('Failed to update mud pump liners:', err);
                showSnackbar('Failed to update mud pump liners', 'error');
            }
        }
    };

    // Supply Vessel CRUD operations with API
    const handleVesselsChange = async (newVessels: SupplyVessel[]) => {
        const isAddOperation = newVessels.length > vessels.length;
        const isDeleteOperation = newVessels.length < vessels.length;
        
        if (isAddOperation && currentWellId) {
            const newVessel = newVessels.find(v => !vessels.some(old => old.id === v.id));
            if (newVessel) {
                try {
                    const apiVessel = {
                        vesselName: newVessel.vessel,
                        location: newVessel.location,
                        crewChange: newVessel.crewChange,
                        fuelOil: newVessel.fuelOil.toString(),
                        potWater: newVessel.potWater.toString(),
                        drlWater: newVessel.drlWater.toString(),
                        barite: newVessel.barite.toString(),
                        baseOil: newVessel.baseOil.toString(),
                        cementG: newVessel.cementG.toString()
                    };
                    await supplyVesselApi.addSupplyVessel(currentWellId, apiVessel);
                    showSnackbar('Vessel added successfully', 'success');
                    await loadWellData(currentWellId);
                    updateLastUpdated();
                } catch (err) {
                    console.error('Failed to add vessel:', err);
                    showSnackbar('Failed to add vessel', 'error');
                    return;
                }
            }
        } else if (isDeleteOperation && currentWellId) {
            const deletedVessel = vessels.find(v => !newVessels.some(old => old.id === v.id));
            if (deletedVessel) {
                try {
                    const index = vessels.findIndex(v => v.id === deletedVessel.id);
                    await supplyVesselApi.deleteSupplyVessel(currentWellId, index);
                    showSnackbar('Vessel deleted successfully', 'success');
                    updateLastUpdated();
                } catch (err) {
                    console.error('Failed to delete vessel:', err);
                    showSnackbar('Failed to delete vessel', 'error');
                    return;
                }
            }
        }
        
        setVessels(newVessels);
    };

    const handleSaveVessel = async (vessel: SupplyVessel) => {
        if (!currentWellId) return;
        
        try {
            const index = vessels.findIndex(v => v.id === vessel.id);
            const apiVessel = {
                vesselName: vessel.vessel,
                location: vessel.location,
                crewChange: vessel.crewChange,
                fuelOil: vessel.fuelOil.toString(),
                potWater: vessel.potWater.toString(),
                drlWater: vessel.drlWater.toString(),
                barite: vessel.barite.toString(),
                baseOil: vessel.baseOil.toString(),
                cementG: vessel.cementG.toString()
            };
            await supplyVesselApi.updateSupplyVessel(currentWellId, index, apiVessel);
            showSnackbar('Vessel saved successfully', 'success');
            updateLastUpdated();
        } catch (err) {
            console.error('Failed to save vessel:', err);
            showSnackbar('Failed to save vessel', 'error');
            throw err;
        }
    };

    const handleDeleteVessel = async (id: string) => {
        if (!currentWellId) return;
        
        try {
            const index = vessels.findIndex(v => v.id === id);
            await supplyVesselApi.deleteSupplyVessel(currentWellId, index);
            showSnackbar('Vessel deleted successfully', 'success');
            updateLastUpdated();
        } catch (err) {
            console.error('Failed to delete vessel:', err);
            showSnackbar('Failed to delete vessel', 'error');
            throw err;
        }
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

                    {/* Last Updated in the middle */}
                    <Box className="header-center">
                        {lastUpdated && (
                            <Typography variant="body2" className="last-updated-text">
                                Updated: {lastUpdated}
                            </Typography>
                        )}
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

            <div className="main-content">
                {/* TOP SECTION - 3 columns */}
                <div className="top-section">
                    <div className="three-column-layout">
                        <div className="column col-well">
                            <WellInformation wellData={wellData} />
                        </div>
                        <div className="column col-mud">
                            <MudPitFluidData fluidData={fluidData} />
                        </div>
                        <div className="column col-tables">
                            <LastUpdated 
                                wellId={currentWellId || undefined}
                                bopSystemsData={bopSystemsData}
                                mudPumpLinersData={mudPumpLinersData}
                                onBopUpdate={handleBopUpdate}
                                onMudPumpUpdate={handleMudPumpUpdate}
                                readOnly={!isAdmin}
                            />
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION - Supply Vessels */}
                <div className="bottom-section">
                    <SupplyVesselsTable 
                        vessels={vessels}
                        wellId={currentWellId || undefined}
                        onVesselsChange={handleVesselsChange}
                        onSave={handleSaveVessel}
                        onDelete={handleDeleteVessel}
                        readOnly={!isAdmin}
                    />
                </div>
            </div>

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