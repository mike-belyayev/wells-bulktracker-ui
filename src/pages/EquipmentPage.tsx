// src/pages/EquipmentPage.tsx
import { useState, useCallback } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Snackbar, Alert, Select, MenuItem, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Settings, Dashboard, Refresh, ExitToApp, ContentCopy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WellInformation, MudPitFluidData, BOPSystems } from '../components/Dashboard';
import { SupplyVesselsTable } from '../components/SupplyVessels';
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

    // Well data hook
// In EquipmentPage.tsx, update the destructuring to include clearWellData
const {
    loading,
    currentWellId,
    vessels,
    lastUpdated,
    wellData,
    fluidData,
    bopSystemsData,
    mudPumpLinersData,
    setVessels,
    setWellData,
    setFluidData,
    setBopSystemsData,
    setMudPumpLinersData,
    setCurrentWellId,  // Add this
    loadWellData,
    refreshWellData,
    updateLastUpdated,
    clearWellData  // Add this
} = useWellData(showSnackbar);

    // Auto-refresh hook
    const { autoRefreshEnabled, countdown, formatCountdown, toggleAutoRefresh } = useAutoRefresh(
        async () => {
            if (currentWellId) {
                await refreshWellData(currentWellId);
            }
        },
        true,
        600000
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
        await loadWellData(wellId);
    }, showSnackbar);

    // Delete well handler - MUST be defined AFTER hooks
const handleDeleteWell = async () => {
    if (currentWellId) {
        try {
            await wellApi.deleteWell(currentWellId);
            showSnackbar('Well deleted successfully', 'success');
            
            // Refresh the wells list
            const wells = await wellApi.getWellsByOwner(userRig);
            if (wells.length > 0) {
                const newWellId = wells[0]._id;
                await loadWellData(newWellId);
                // Update active well in site
                await siteApi.setActiveWell(userRig, newWellId);
            } else {
                // No wells left, show empty state - use clearWellData
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

                        <Button variant="contained" size="small" startIcon={<Refresh />} onClick={handleRefresh} className="refresh-btn" disabled={loading}>
                            Refresh
                        </Button>

                        <Button variant={autoRefreshEnabled ? "contained" : "outlined"} size="small" onClick={toggleAutoRefresh} className={`auto-refresh-btn ${autoRefreshEnabled ? 'active' : ''}`}>
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
                        wellId={currentWellId || undefined}
                        onVesselsChange={handleVesselsChange}
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