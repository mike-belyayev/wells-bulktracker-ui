// src/pages/EquipmentPage.tsx
import { useState, useCallback } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Snackbar, Alert, Select, MenuItem, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip } from '@mui/material';
import { Settings, Dashboard, Refresh, ExitToApp, ContentCopy, Cached } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WellInformation, MudPitFluidData, BOPSystems } from '../components/Dashboard';
import { SupplyVesselsTable, type CargoVessel } from '../components/SupplyVessels';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useWellData } from '../hooks/useWellData';
import { useWellOperations } from '../hooks/useWellOperations';
import { useWellSelector } from '../hooks/useWellSelector';
import { wellApi, siteApi } from '../services/wellApi';
import './EquipmentPage.css';

const EquipmentPage = () => {
    const { logout, user } = useAuth();
    const isAdmin = user?.isAdmin || false;
    const navigate = useNavigate();
    const userRig = user?.homeLocation || 'NSC';

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Well data hook - now includes cargoVessels
    const {
        loading,
        currentWellId,
        vessels,
        lastUpdated,
        wellData,
        fluidData,
        bopSystemsData,
        mudPumpLinersData,
        cargoVessels,
        setVessels,
        setWellData,
        setFluidData,
        setBopSystemsData,
        setMudPumpLinersData,
        setCargoVessels,
        loadWellData,
        refreshWellData,
        updateLastUpdated,
        clearWellData
    } = useWellData(showSnackbar);

    // Auto-refresh hook with full reload option
    const { 
        autoRefreshEnabled, 
        countdown, 
        formatCountdown, 
        toggleAutoRefresh,
        manualFullReload,
        isReloading
    } = useAutoRefresh(
        async () => {
            if (currentWellId) {
                await refreshWellData(currentWellId);
            }
        },
        true,
        600000,
        false // Set to true if you want auto-refresh to do full page reload
    );

    // Well operations hook
    const {
        handleWellInfoUpdate,
        handleCasingUpdate,
        handleBopUpdate,
        handleMudPumpUpdate,
        handleMudPitsUpdate,
        handleVesselsChange,
        handleSaveVessel,
        handleDeleteVessel
    } = useWellOperations(
        currentWellId,
        vessels,
        setVessels,
        setWellData,
        setFluidData,
        setBopSystemsData,
        setMudPumpLinersData,
        updateLastUpdated,
        loadWellData,
        showSnackbar
    );

    // Cargo vessels update handler - FIXED: Don't refresh immediately
    const handleCargoUpdate = useCallback(async (updatedVessels: CargoVessel[]) => {
        if (!currentWellId) {
            console.error('No current well ID');
            showSnackbar('Cannot save: No well selected', 'error');
            return;
        }

        console.log('=== CARGO VESSEL SAVE START ===');
        console.log('Current Well ID:', currentWellId);
        console.log('Vessels to save:', JSON.stringify(updatedVessels, null, 2));
        
        try {
            // First, update the local state immediately for UI responsiveness
            setCargoVessels(updatedVessels);
            
            // Then save to API
            const patchData = { cargoVessels: updatedVessels };
            console.log('Sending PATCH request with:', patchData);
            
            const response = await wellApi.patchWell(currentWellId, patchData);
            console.log('API Response:', response);
            
            if (response && response.cargoVessels) {
                console.log('API returned cargo vessels:', response.cargoVessels);
                // Update with the API response to ensure consistency
                setCargoVessels(response.cargoVessels);
            }
            
            updateLastUpdated();
            showSnackbar('Cargo vessels updated successfully', 'success');
            console.log('=== CARGO VESSEL SAVE SUCCESS ===');
            
            // Optional: Do a gentle refresh without showing loading indicator
            // This ensures we have the latest data but doesn't wipe out our changes
            setTimeout(async () => {
                if (currentWellId) {
                    try {
                        const refreshedWell = await wellApi.getWell(currentWellId);
                        if (refreshedWell.cargoVessels) {
                            setCargoVessels(refreshedWell.cargoVessels);
                        }
                    } catch (err) {
                        console.error('Background refresh failed:', err);
                    }
                }
            }, 500);
            
        } catch (err: any) {
            console.error('=== CARGO VESSEL SAVE FAILED ===');
            console.error('Error details:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            // Revert local state on error
            // Reload from API to get the actual current state
            try {
                const freshWell = await wellApi.getWell(currentWellId);
                if (freshWell.cargoVessels) {
                    setCargoVessels(freshWell.cargoVessels);
                }
            } catch (refreshErr) {
                console.error('Failed to revert state:', refreshErr);
            }
            
            showSnackbar(`Failed to update cargo vessels: ${err.response?.data?.message || err.message || 'Unknown error'}`, 'error');
            throw err;
        }
    }, [currentWellId, setCargoVessels, updateLastUpdated, showSnackbar]);

    // Well selector hook
    const {
        allWells,
        selectedWellId,
        cloneDialogOpen,
        cloning,
        setCloneDialogOpen,
        handleWellChange,
        handleCloneWell
    } = useWellSelector(userRig, async (wellId) => {
        console.log('=== WELL SELECTION CHANGED ===');
        console.log('Loading well:', wellId);
        const well = await loadWellData(wellId);
        console.log('Loaded well data:', well);
        console.log('Cargo vessels from loaded well:', well?.cargoVessels);
    }, showSnackbar);

    // Delete well handler
    const handleDeleteWell = async () => {
        if (currentWellId) {
            try {
                await wellApi.deleteWell(currentWellId);
                showSnackbar('Well deleted successfully', 'success');
                
                const wells = await wellApi.getWellsByOwner(userRig);
                if (wells.length > 0) {
                    const newWellId = wells[0]._id;
                    await loadWellData(newWellId);
                    await siteApi.setActiveWell(userRig, newWellId);
                } else {
                    clearWellData();
                }
            } catch (err) {
                console.error('Failed to delete well:', err);
                showSnackbar('Failed to delete well', 'error');
            }
        }
    };

    const handleRefresh = async () => {
        if (currentWellId) {
            await refreshWellData(currentWellId);
            showSnackbar('Data refreshed', 'success');
        }
    };

    // Handle full page reload with confirmation
    const handleFullReload = () => {
        if (window.confirm('This will reload the entire application. Any unsaved changes will be lost. Continue?')) {
            manualFullReload();
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
                            Dashboard
                        </Typography>

                        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                            <Select
                                value={selectedWellId || ''}
                                onChange={(e) => handleWellChange(e.target.value)}
                                displayEmpty
                                sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' } }}
                            >
                                {allWells.map((well) => (
                                    <MenuItem key={well._id} value={well._id}>
                                        {well.wellName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <IconButton size="small" onClick={() => setCloneDialogOpen(true)} sx={{ color: '#4caf50' }} title="Clone Well">
                            <ContentCopy />
                        </IconButton>

                        <Tooltip title="Refresh data from server (without page reload)">
                            <Button 
                                variant="contained" 
                                size="small" 
                                startIcon={<Refresh />} 
                                onClick={handleRefresh} 
                                className="refresh-btn" 
                                disabled={loading}
                            >
                                Refresh Data
                            </Button>
                        </Tooltip>

                        <Tooltip title={`Auto-refresh ${autoRefreshEnabled ? 'ON' : 'OFF'} - Updates every 10 minutes`}>
                            <Button 
                                variant={autoRefreshEnabled ? "contained" : "outlined"} 
                                size="small" 
                                onClick={toggleAutoRefresh} 
                                className={`auto-refresh-btn ${autoRefreshEnabled ? 'active' : ''}`}
                                sx={autoRefreshEnabled ? {} : { color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                            >
                                {autoRefreshEnabled ? `Auto: ${formatCountdown(countdown)}` : "Auto Off"}
                            </Button>
                        </Tooltip>
                    </Box>

                    <Box className="header-center">
                        {lastUpdated && (
                            <Typography variant="body2" className="last-updated-text">
                                Updated: {lastUpdated}
                            </Typography>
                        )}
                        {/* Reload App icon button positioned after the last updated text */}
                        <Tooltip title="Full page reload (like pressing F5) - reloads entire application">
                            <IconButton 
                                size="small" 
                                onClick={handleFullReload} 
                                className="reload-app-btn"
                                disabled={isReloading}
                                sx={{ 
                                    color: 'white',
                                    ml: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.15)'
                                    }
                                }}
                            >
                                <Cached fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box className="header-right">
                        <Box className="dev-credit">
                            <Typography variant="caption">App developed for Wells Team by:</Typography>
                            <Typography variant="caption" className="dev-email">Mike.Belyayev@exxonmobil.com</Typography>
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
                                onDelete={handleDeleteWell}
                                onRefresh={() => refreshWellData(currentWellId || '')}
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
                        cargoVessels={cargoVessels}
                        wellId={currentWellId || undefined}
                        onVesselsChange={handleVesselsChange}
                        onCargoUpdate={handleCargoUpdate}
                        onSave={handleSaveVessel}
                        onDelete={handleDeleteVessel}
                        readOnly={!isAdmin}
                    />
                </div>
            </div>

            {/* Clone Dialog */}
            <Dialog open={cloneDialogOpen} onClose={() => setCloneDialogOpen(false)}>
                <DialogTitle>Clone Well</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to clone the well "{allWells.find(w => w._id === selectedWellId)?.wellName}"?
                        This will create a new well with "- Clone" suffix and reset supply vessels and cargo.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCloneDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCloneWell} variant="contained" color="primary" disabled={cloning}>
                        {cloning ? <CircularProgress size={24} /> : 'Clone'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EquipmentPage;