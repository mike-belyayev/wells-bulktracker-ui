// src/hooks/useWellOperations.ts
import { useCallback } from 'react';
import wellApiService from '../services/wellApi';
import type { SupplyVessel } from '../components/SupplyVessels';
import type { CasingProfile } from '../components/Dashboard/WellInformation';
import type { BopSystem, MudPumpLiner } from '../components/Dashboard/BOPSystems';
import type { PitData } from '../components/Dashboard/MudPitFluidData';

const { wellApi, supplyVesselApi, bopSystemsApi, mudPumpLinersApi } = wellApiService;

export const useWellOperations = (
    currentWellId: string | null,
    vessels: SupplyVessel[],
    setVessels: (vessels: SupplyVessel[]) => void,
    setWellData: (data: any) => void,
    setFluidData: (data: PitData[]) => void,
    setBopSystemsData: (data: BopSystem[]) => void,
    setMudPumpLinersData: (data: MudPumpLiner[]) => void,
    updateLastUpdated: () => void,
    loadWellData: (wellId: string, showNotification?: boolean) => Promise<any>,
    showSnackbar: (msg: string, severity: 'success' | 'error') => void
) => {
    const handleWellInfoUpdate = useCallback(async (updates: any) => {
        if (!currentWellId) return;
        try {
            await wellApi.patchWell(currentWellId, {
                wellName: updates.wellName,
                waterDepth: updates.waterDepth.toString(),
                airGap: updates.airGap.toString(),
                HPWH: updates.HPWH.toString()
            });
            // Reload fresh data from API
            await loadWellData(currentWellId, false);
            updateLastUpdated();
            showSnackbar('Well information updated', 'success');
        } catch (err) {
            console.error('Failed to update well info:', err);
            showSnackbar('Failed to update well information', 'error');
        }
    }, [currentWellId, loadWellData, updateLastUpdated, showSnackbar]);

    const handleCasingUpdate = useCallback(async (casingProfiles: CasingProfile[]) => {
        if (!currentWellId) return;
        try {
            await wellApi.patchWell(currentWellId, { casingProfile: casingProfiles });
            setWellData((prev: any) => ({ ...prev, casingProfiles }));
            updateLastUpdated();
            showSnackbar('Casing profiles updated', 'success');
        } catch (err) {
            console.error('Failed to update casing profiles:', err);
            showSnackbar('Failed to update casing profiles', 'error');
        }
    }, [currentWellId, setWellData, updateLastUpdated, showSnackbar]);

    const handleBopUpdate = useCallback(async (bopSystems: BopSystem[]) => {
        if (!currentWellId) return;
        try {
            await bopSystemsApi.updateBopSystems(currentWellId, bopSystems);
            setBopSystemsData(bopSystems);
            updateLastUpdated();
            showSnackbar('BOP systems updated', 'success');
        } catch (err) {
            console.error('Failed to update BOP systems:', err);
            showSnackbar('Failed to update BOP systems', 'error');
        }
    }, [currentWellId, setBopSystemsData, updateLastUpdated, showSnackbar]);

    const handleMudPumpUpdate = useCallback(async (mudPumpLiners: MudPumpLiner[]) => {
        if (!currentWellId) return;
        try {
            await mudPumpLinersApi.updateMudPumpLiners(currentWellId, mudPumpLiners);
            setMudPumpLinersData(mudPumpLiners);
            updateLastUpdated();
            showSnackbar('Mud pump liners updated', 'success');
        } catch (err) {
            console.error('Failed to update mud pump liners:', err);
            showSnackbar('Failed to update mud pump liners', 'error');
        }
    }, [currentWellId, setMudPumpLinersData, updateLastUpdated, showSnackbar]);

    const handleMudPitsUpdate = useCallback(async (updatedPits: PitData[]) => {
        if (!currentWellId) return;
        try {
            await wellApi.patchWell(currentWellId, { mudPits: updatedPits });
            setFluidData(updatedPits);
            updateLastUpdated();
            showSnackbar('Mud pits updated', 'success');
        } catch (err) {
            console.error('Failed to update mud pits:', err);
            showSnackbar('Failed to update mud pits', 'error');
        }
    }, [currentWellId, setFluidData, updateLastUpdated, showSnackbar]);

    const handleVesselsChange = useCallback(async (newVessels: SupplyVessel[]) => {
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
    }, [currentWellId, vessels, setVessels, loadWellData, updateLastUpdated, showSnackbar]);

    const handleSaveVessel = useCallback(async (vessel: SupplyVessel) => {
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
    }, [currentWellId, vessels, updateLastUpdated, showSnackbar]);

    const handleDeleteVessel = useCallback(async (id: string) => {
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
    }, [currentWellId, vessels, updateLastUpdated, showSnackbar]);

    return {
        handleWellInfoUpdate,
        handleCasingUpdate,
        handleBopUpdate,
        handleMudPumpUpdate,
        handleMudPitsUpdate,
        handleVesselsChange,
        handleSaveVessel,
        handleDeleteVessel
    };
};