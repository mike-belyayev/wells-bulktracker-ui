// src/hooks/useWellSelector.ts
import { useState, useEffect, useCallback } from 'react';
import wellApiService from '../services/wellApi';

const { wellApi, siteApi } = wellApiService;

export const useWellSelector = (
    userRig: string, 
    onWellSelect: (wellId: string) => Promise<void>,
    showSnackbar?: (msg: string, severity: 'success' | 'error') => void
) => {
    const [allWells, setAllWells] = useState<any[]>([]);
    const [selectedWellId, setSelectedWellId] = useState<string | null>(null);
    const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
    const [cloning, setCloning] = useState(false);

    const fetchAllWells = useCallback(async () => {
        try {
            const wells = await wellApi.getWellsByOwner(userRig);
            setAllWells(wells);
            return wells;
        } catch (err) {
            console.error('Failed to fetch wells:', err);
            if (showSnackbar) {
                showSnackbar('Failed to fetch wells', 'error');
            }
            return [];
        }
    }, [userRig, showSnackbar]);

    const handleWellChange = useCallback(async (wellId: string) => {
        setSelectedWellId(wellId);
        await onWellSelect(wellId);
        if (userRig) {
            try {
                await siteApi.setActiveWell(userRig, wellId);
            } catch (err) {
                console.error('Failed to update active well for site:', err);
            }
        }
    }, [userRig, onWellSelect]);

    const handleCloneWell = useCallback(async () => {
        if (!selectedWellId) return;
        setCloning(true);
        try {
            const result = await wellApi.cloneWell(selectedWellId);
            const updatedWells = await fetchAllWells();
            const clonedWell = updatedWells.find((w: { _id: any; }) => w._id === result.clonedWell._id);
            if (clonedWell) {
                setSelectedWellId(clonedWell._id);
                await onWellSelect(clonedWell._id);
                if (showSnackbar) {
                    showSnackbar(`Well cloned successfully: ${clonedWell.wellName}`, 'success');
                }
            }
            setCloneDialogOpen(false);
            return result;
        } catch (err) {
            console.error('Failed to clone well:', err);
            if (showSnackbar) {
                showSnackbar('Failed to clone well', 'error');
            }
            throw err;
        } finally {
            setCloning(false);
        }
    }, [selectedWellId, fetchAllWells, onWellSelect, showSnackbar]);

    // Initialize - load wells and select first one
    useEffect(() => {
        const init = async () => {
            const wells = await fetchAllWells();
            if (wells.length > 0 && !selectedWellId) {
                const firstWellId = wells[0]._id;
                setSelectedWellId(firstWellId);
                await onWellSelect(firstWellId);
            }
        };
        init();
    }, []);

    return {
        allWells,
        selectedWellId,
        cloneDialogOpen,
        cloning,
        setCloneDialogOpen,
        handleWellChange,
        handleCloneWell,
        fetchAllWells
    };
};