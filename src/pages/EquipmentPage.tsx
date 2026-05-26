// src/pages/EquipmentPage.tsx
import { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import { Settings, Dashboard, Refresh, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WellInformation, MudPitFluidData, BOPSystems } from '../components/Dashboard';
import { SupplyVesselsTable, type SupplyVessel } from '../components/SupplyVessels';
import './EquipmentPage.css';
import wellApiService from '../services/wellApi';
import type { CasingProfile } from '../components/Dashboard/WellInformation';
import type { BopSystem, MudPumpLiner } from '../components/Dashboard/BOPSystems';
import type { PitData } from '../components/Dashboard/MudPitFluidData';

const EquipmentPage = () => {
    const { logout, user } = useAuth();
    const isAdmin = user?.isAdmin || false;
    const navigate = useNavigate();
    const userRig = user?.homeLocation || 'NSC';

    const [loading, setLoading] = useState(false);
    const [currentWellId, setCurrentWellId] = useState<string | null>(null);
    const [vessels, setVessels] = useState<SupplyVessel[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    
    // Auto-refresh state
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [countdown, setCountdown] = useState(600);
    const intervalRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);
    
    const [wellData, setWellData] = useState<{
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        casingProfiles?: CasingProfile[];
    } | undefined>(undefined);
    
    const [fluidData, setFluidData] = useState<PitData[]>([]);
    
    // BOP Systems and Mud Pump Liners data
    const [bopSystemsData, setBopSystemsData] = useState<BopSystem[]>([]);
    const [mudPumpLinersData, setMudPumpLinersData] = useState<MudPumpLiner[]>([]);
    
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

    // Format countdown time
    const formatCountdown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCasingUpdate = async (casingProfiles: CasingProfile[]) => {
    if (currentWellId) {
        try {
            await wellApi.updateCasingProfile(currentWellId, casingProfiles);
            // Update local state
            setWellData(prev => ({ ...prev, casingProfiles }));
            updateLastUpdated();
            showSnackbar('Casing profiles updated', 'success');
        } catch (err) {
            console.error('Failed to update casing profiles:', err);
            showSnackbar('Failed to update casing profiles', 'error');
        }
    }
};
    // Add this function to EquipmentPage.tsx
const handleWellInfoUpdate = async (updates: any) => {
    if (currentWellId) {
        try {
            await wellApi.patchWell(currentWellId, updates);
            // Refresh the well data to show updated values
            await loadWellData(currentWellId, false);
            updateLastUpdated();
            showSnackbar('Well information updated', 'success');
        } catch (err) {
            console.error('Failed to update well info:', err);
            showSnackbar('Failed to update well information', 'error');
        }
    }
};
    // Load well data from API
    const loadWellData = async (wellId: string, showNotification: boolean = false) => {
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
            
            // Load Mud Pits
            if (well.mudPits && Array.isArray(well.mudPits)) {
                setFluidData(well.mudPits);
            } else {
                setFluidData([]);
            }
            
            // Load BOP Systems
            if (well.bopSystems && Array.isArray(well.bopSystems)) {
                setBopSystemsData(well.bopSystems);
            } else {
                setBopSystemsData([]);
            }
            
            // Load Mud Pump Liners
            if (well.mudPumpLiners && Array.isArray(well.mudPumpLiners)) {
                setMudPumpLinersData(well.mudPumpLiners);
            } else {
                setMudPumpLinersData([]);
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
            } else {
                setVessels([]);
            }
            
            if (showNotification) {
                showSnackbar('Data refreshed from server', 'success');
            }
            
            console.log('Well data loaded:', well.wellName);
        } catch (err) {
            console.error('Failed to load well data:', err);
            if (showNotification) {
                showSnackbar('Failed to refresh data', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Start auto-refresh timer
    const startAutoRefresh = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        
        setCountdown(600);
        
        intervalRef.current = window.setInterval(() => {
            if (currentWellId && autoRefreshEnabled) {
                loadWellData(currentWellId, true);
                setCountdown(600);
            }
        }, 600000);
        
        countdownRef.current = window.setInterval(() => {
            setCountdown(prev => prev <= 1 ? 600 : prev - 1);
        }, 1000);
    };

    // Stop auto-refresh
    const stopAutoRefresh = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    };

    // Toggle auto-refresh
    const toggleAutoRefresh = () => {
        setAutoRefreshEnabled(!autoRefreshEnabled);
        if (!autoRefreshEnabled) {
            startAutoRefresh();
            showSnackbar('Auto-refresh enabled (every 10 minutes)', 'success');
        } else {
            stopAutoRefresh();
            showSnackbar('Auto-refresh disabled', 'success');
        }
    };

    // Get well ID based on user's rig
    useEffect(() => {
        const fetchWellId = async () => {
            try {
                setLoading(true);
                const wells = await wellApi.getWellsByOwner(userRig);
                if (wells && wells.length > 0) {
                    await loadWellData(wells[0]._id);
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

    // Start auto-refresh when well is loaded
    useEffect(() => {
        if (currentWellId && autoRefreshEnabled) {
            startAutoRefresh();
        }
        
        return () => {
            stopAutoRefresh();
        };
    }, [currentWellId]);

    // Update auto-refresh when enabled state changes
    useEffect(() => {
        if (currentWellId && autoRefreshEnabled) {
            startAutoRefresh();
        } else if (!autoRefreshEnabled) {
            stopAutoRefresh();
        }
    }, [autoRefreshEnabled]);

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleRefresh = async () => {
        if (currentWellId) {
            setLoading(true);
            await loadWellData(currentWellId, true);
            setCountdown(600);
            setLoading(false);
        }
    };

    // Update last updated after any save operation
    const updateLastUpdated = () => {
        setLastUpdated(formatLastUpdated(new Date().toISOString()));
        setCountdown(600);
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

    // Mud Pits handler
    const handleMudPitsUpdate = async (updatedPits: PitData[]) => {
        if (currentWellId) {
            try {
                await wellApi.patchWell(currentWellId, { mudPits: updatedPits });
                setFluidData(updatedPits);
                updateLastUpdated();
                showSnackbar('Mud pits updated', 'success');
            } catch (err) {
                console.error('Failed to update mud pits:', err);
                showSnackbar('Failed to update mud pits', 'error');
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
                    await loadWellData(currentWellId, false);
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

    if (loading && !vessels.length && !fluidData.length) {
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
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                        
                        <Button
                            variant={autoRefreshEnabled ? "contained" : "outlined"}
                            size="small"
                            onClick={toggleAutoRefresh}
                            className={`auto-refresh-btn ${autoRefreshEnabled ? 'active' : ''}`}
                            title={autoRefreshEnabled ? `Auto-refresh in ${formatCountdown(countdown)}` : "Enable auto-refresh (every 10 minutes)"}
                        >
                            {autoRefreshEnabled ? `Auto: ${formatCountdown(countdown)}` : "Auto Off"}
                        </Button>
                    </Box>

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
                <div className="top-section">
                    <div className="three-column-layout">
                        <div className="column col-well">

<WellInformation 
    wellData={wellData}
    wellId={currentWellId || undefined}
    onUpdate={handleWellInfoUpdate}
    onCasingUpdate={handleCasingUpdate}
    readOnly={!isAdmin}
/>
                        </div>
                        <div className="column col-mud">
                            <MudPitFluidData 
                                fluidData={fluidData}
                                wellId={currentWellId || undefined}
                                onUpdate={handleMudPitsUpdate}
                                readOnly={!isAdmin}
                            />
                        </div>
                        <div className="column col-tables">
                            <BOPSystems 
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