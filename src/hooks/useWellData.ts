// src/hooks/useWellData.ts
import { useState, useCallback } from 'react';
import type { SupplyVessel } from '../components/SupplyVessels';
import type { CasingProfile } from '../components/Dashboard/WellInformation';
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
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [wellData, setWellData] = useState<{
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        HPWH?: number;
        casingProfiles?: CasingProfile[];
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
            
            setWellData({
                wellName: well.wellName,
                waterDepth: well.waterDepth ? Number(well.waterDepth) : undefined,
                airGap: well.airGap ? Number(well.airGap) : undefined,
                HPWH: well.HPWH ? Number(well.HPWH) : undefined,
                casingProfiles: well.casingProfile || []
            });
            
            setFluidData(well.mudPits || []);
            setBopSystemsData(well.bopSystems || []);
            setMudPumpLinersData(well.mudPumpLiners || []);
            
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
            
            console.log('Well data loaded:', well.wellName);
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

    return {
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
        loadWellData,
        refreshWellData,
        updateLastUpdated
    };
};