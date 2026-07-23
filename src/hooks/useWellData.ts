// src/hooks/useWellData.ts
import { useState, useCallback } from 'react';
import type { SupplyVessel, CargoVessel } from '../components/SupplyVessels';
import type { CasingProfile } from '../utils/casingDiagramUtils';
import type { BopSystem, MudPumpLiner } from '../components/Dashboard/BOPSystems';
import type { PitData } from '../components/Dashboard/MudPitFluidData';
import wellApiService from '../services/wellApi';

const { wellApi } = wellApiService;

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

export const useWellData = (showSnackbar?: (msg: string, severity: 'success' | 'error') => void) => {
    const [loading, setLoading] = useState(false);
    const [currentWellId, setCurrentWellId] = useState<string | null>(null);
    const [vessels, setVessels] = useState<SupplyVessel[]>([]);
    const [cargoVessels, setCargoVessels] = useState<CargoVessel[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [wellData, setWellData] = useState<{
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        HPWH?: number;
        casingProfile?: CasingProfile[];
    } | undefined>(undefined);
    const [fluidData, setFluidData] = useState<PitData[]>([]);
    const [bopSystemsData, setBopSystemsData] = useState<BopSystem[]>([]);
    const [mudPumpLinersData, setMudPumpLinersData] = useState<MudPumpLiner[]>([]);

    const updateLastUpdated = useCallback(() => {
        setLastUpdated(formatLastUpdated(new Date().toISOString()));
    }, []);

    const loadWellData = useCallback(async (wellId: string) => {
        try {
            setLoading(true);
            const well = await wellApi.getWell(wellId);
            setCurrentWellId(well._id);
            
            if (well.updatedAt) {
                setLastUpdated(formatLastUpdated(well.updatedAt));
            }
            
            // IMPORTANT: Use casingProfile (singular) to match the API response
            setWellData({
                wellName: well.wellName,
                waterDepth: well.waterDepth ? Number(well.waterDepth) : undefined,
                airGap: well.airGap ? Number(well.airGap) : undefined,
                HPWH: well.HPWH ? Number(well.HPWH) : undefined,
                casingProfile: well.casingProfile || []
            });
            
            setFluidData(well.mudPits || []);
            setBopSystemsData(well.bopSystems || []);
            setMudPumpLinersData(well.mudPumpLiners || []);
            
            // Load cargo vessels from API
            if (well.cargoVessels && Array.isArray(well.cargoVessels)) {
                console.log('Loading cargo vessels from API:', well.cargoVessels);
                setCargoVessels(well.cargoVessels);
            } else {
                setCargoVessels([]);
            }
            
            // Load supply vessels with additionalFields properly preserved
            if (well.supplyVessels && Array.isArray(well.supplyVessels)) {
                console.log('Loading supply vessels from API:', well.supplyVessels);
                
                const formattedVessels = well.supplyVessels.map((vessel: any, index: number) => {
                    // Log to debug
                    console.log(`Vessel ${index}:`, {
                        name: vessel.vesselName,
                        additionalFields: vessel.additionalFields
                    });
                    
                    return {
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
                        // ✅ IMPORTANT: Keep additionalFields as a separate property
                        additionalFields: vessel.additionalFields || {}
                    };
                });
                setVessels(formattedVessels);
            } else {
                setVessels([]);
            }
            
            return well;
        } catch (err) {
            console.error('Failed to load well data:', err);
            if (showSnackbar) {
                showSnackbar('Failed to load well data', 'error');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    const refreshWellData = useCallback(async (wellId: string) => {
        await loadWellData(wellId);
        if (showSnackbar) {
            showSnackbar('Data refreshed from server', 'success');
        }
    }, [loadWellData, showSnackbar]);

    const clearWellData = useCallback(() => {
        setCurrentWellId(null);
        setWellData(undefined);
        setVessels([]);
        setCargoVessels([]);
        setFluidData([]);
        setBopSystemsData([]);
        setMudPumpLinersData([]);
        setLastUpdated('');
    }, []);

    return {
        loading,
        currentWellId,
        vessels,
        cargoVessels,
        lastUpdated,
        wellData,
        fluidData,
        bopSystemsData,
        mudPumpLinersData,
        setVessels,
        setCargoVessels,
        setWellData,
        setFluidData,
        setBopSystemsData,
        setMudPumpLinersData,
        setCurrentWellId,
        loadWellData,
        refreshWellData,
        updateLastUpdated,
        clearWellData
    };
};