// src/hooks/useAutoRefresh.ts
import { useState, useEffect, useRef } from 'react';

export const useAutoRefresh = (
    onRefresh: () => Promise<void>, 
    isEnabled: boolean = true, 
    intervalMs: number = 600000,
    fullReload: boolean = false // New parameter to control full page reload
) => {
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(isEnabled);
    const [countdown, setCountdown] = useState(intervalMs / 1000);
    const [isReloading, setIsReloading] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);

    const formatCountdown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const performRefresh = async () => {
        if (isReloading) return; // Prevent multiple reloads
        
        if (fullReload) {
            // Full page reload like F5
            setIsReloading(true);
            console.log('Performing full page reload...');
            window.location.reload();
        } else {
            // Just refresh data from API
            await onRefresh();
        }
    };

    const startAutoRefresh = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        
        setCountdown(intervalMs / 1000);
        
        intervalRef.current = window.setInterval(() => {
            if (autoRefreshEnabled) {
                performRefresh();
                setCountdown(intervalMs / 1000);
            }
        }, intervalMs);
        
        countdownRef.current = window.setInterval(() => {
            setCountdown(prev => prev <= 1 ? intervalMs / 1000 : prev - 1);
        }, 1000);
    };

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

    const toggleAutoRefresh = () => {
        setAutoRefreshEnabled(!autoRefreshEnabled);
        if (!autoRefreshEnabled) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    };

    // Manual full reload function
    const manualFullReload = () => {
        if (!isReloading) {
            setIsReloading(true);
            window.location.reload();
        }
    };

    useEffect(() => {
        if (autoRefreshEnabled) {
            startAutoRefresh();
        }
        return () => {
            stopAutoRefresh();
        };
    }, [autoRefreshEnabled]);

    return {
        autoRefreshEnabled,
        countdown,
        formatCountdown,
        toggleAutoRefresh,
        manualFullReload, // Export manual reload function
        isReloading // Export reloading state
    };
};