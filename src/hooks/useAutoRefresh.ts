// src/hooks/useAutoRefresh.ts
import { useState, useEffect, useRef } from 'react';

export const useAutoRefresh = (onRefresh: () => Promise<void>, isEnabled: boolean = true, intervalMs: number = 600000) => {
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(isEnabled);
    const [countdown, setCountdown] = useState(intervalMs / 1000);
    const intervalRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);

    const formatCountdown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startAutoRefresh = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        
        setCountdown(intervalMs / 1000);
        
        intervalRef.current = window.setInterval(() => {
            if (autoRefreshEnabled) {
                onRefresh();
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
        toggleAutoRefresh
    };
};