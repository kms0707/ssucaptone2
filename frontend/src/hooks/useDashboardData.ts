/**
 * Custom hook for managing dashboard data with polling.
 * Fetches KPIs, alerts, and traffic data from the API.
 */

import { useState, useEffect, useMemo } from "react";
import { 
    fetchKPIs, 
    fetchAlerts, 
    fetchTrafficDistribution 
} from "../utils/apiClient";
import { KPIData, Alert, TrafficCategory } from "../types/api";
import { info } from "../utils/logger";

const POLLING_INTERVAL = 2000;

interface DashboardData {
    kpiData: KPIData | null;
    alerts: Alert[];
    trafficData: TrafficCategory[];
    kpiLoading: boolean;
    alertsLoading: boolean;
    trafficLoading: boolean;
    kpiError: string | null;
    alertsError: string | null;
    trafficError: string | null;
    isMonitoring: boolean;
    startMonitoring: () => void;
    stopMonitoring: () => void;
    clearData: () => void;
}

/**
 * Calculates traffic distribution from alerts data.
 * 
 * @param {Alert[]} alerts - Array of alerts
 * @returns {TrafficCategory[]} Traffic distribution by status
 */
const calculateTrafficDistribution = (
    alerts: Alert[]
): TrafficCategory[] => {
    const counts = {
        Normal: 0,
        Suspicious: 0,
        Attack: 0,
    };

    alerts.forEach((alert) => {
        counts[alert.status]++;
    });

    return [
        { name: "Normal", value: counts.Normal, color: "#14b8a6" },
        { name: "Suspicious", value: counts.Suspicious, color: "#fb923c" },
        { name: "Attack", value: counts.Attack, color: "#ef4444" },
    ];
};

/**
 * Calculates KPI data from alerts.
 * 
 * @param {Alert[]} alerts - Array of alerts
 * @returns {KPIData} Calculated KPI data
 */
const calculateKPIData = (alerts: Alert[]): KPIData => {
    const attackCount = alerts.filter(
        (a) => a.status === "Attack"
    ).length;
    const suspiciousCount = alerts.filter(
        (a) => a.status === "Suspicious"
    ).length;
    const normalCount = alerts.filter(
        (a) => a.status === "Normal"
    ).length;

    const totalFlows = alerts.length;
    const accuracy = totalFlows > 0 
        ? ((normalCount / totalFlows) * 100).toFixed(1)
        : "98.4";

    return {
        totalFlows: totalFlows,
        attacksDetected: attackCount,
        suspiciousFlows: suspiciousCount,
        accuracy: parseFloat(accuracy),
        lastUpdated: new Date().toISOString(),
    };
};

/**
 * Fetches and manages dashboard data with automatic polling.
 * 
 * @returns {DashboardData} Dashboard data and loading states
 */
export const useDashboardData = (): DashboardData => {
    const [kpiData, setKpiData] = useState<KPIData | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [trafficData, setTrafficData] = useState<TrafficCategory[]>([]);
    
    const [kpiLoading, setKpiLoading] = useState(true);
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [trafficLoading, setTrafficLoading] = useState(true);
    
    const [kpiError, setKpiError] = useState<string | null>(null);
    const [alertsError, setAlertsError] = useState<string | null>(null);
    const [trafficError, setTrafficError] = useState<string | null>(null);

    const [isMonitoring, setIsMonitoring] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    /**
     * Loads KPI data from the API.
     * 
     * @returns {Promise<void>}
     */
    const loadKPIData = async (): Promise<void> => {
        try {
            setKpiError(null);
            const data = await fetchKPIs();
            setKpiData(data);
            info("KPI data updated successfully");
        } catch (err) {
            const message = err instanceof Error 
                ? err.message 
                : "Unknown error";
            setKpiError(message);
        } finally {
            setKpiLoading(false);
        }
    };

    /**
     * Loads alerts data from the API.
     * 
     * @returns {Promise<void>}
     */
    const loadAlertsData = async (): Promise<void> => {
        try {
            setAlertsError(null);
            const response = await fetchAlerts();
            
            // Accumulate new alerts with existing ones
            setAlerts(prevAlerts => {
                // Create a Set of existing alert IDs
                const existingIds = new Set(prevAlerts.map(a => a.id));
                
                // Filter out duplicates from new alerts
                const newAlerts = response.alerts.filter(
                    alert => !existingIds.has(alert.id)
                );
                
                // Combine and sort by timestamp (newest first)
                const combined = [...newAlerts, ...prevAlerts];
                combined.sort((a, b) => {
                    const timeA = a.timestamp || "00:00:00";
                    const timeB = b.timestamp || "00:00:00";
                    return timeB.localeCompare(timeA);
                });
                
                return combined;
            });
            
            info("Alerts data updated successfully");
        } catch (err) {
            const message = err instanceof Error 
                ? err.message 
                : "Unknown error";
            setAlertsError(message);
        } finally {
            setAlertsLoading(false);
        }
    };

    /**
     * Loads traffic distribution data from the API.
     * 
     * @returns {Promise<void>}
     */
    const loadTrafficData = async (): Promise<void> => {
        try {
            setTrafficError(null);
            const response = await fetchTrafficDistribution();
            setTrafficData(response.categories);
            info("Traffic data updated successfully");
        } catch (err) {
            const message = err instanceof Error 
                ? err.message 
                : "Unknown error";
            setTrafficError(message);
        } finally {
            setTrafficLoading(false);
        }
    };

    /**
     * Loads all dashboard data.
     * 
     * @returns {Promise<void>}
     */
    const loadAllData = async (): Promise<void> => {
        await Promise.all([
            loadKPIData(),
            loadAlertsData(),
        ]);
    };

    // Calculate traffic distribution from alerts data
    const calculatedTrafficData = useMemo(() => {
        if (alerts.length > 0) {
            return calculateTrafficDistribution(alerts);
        }
        return [];
    }, [alerts]);

    // Calculate KPI data from alerts
    const calculatedKPIData = useMemo(() => {
        if (alerts.length > 0) {
            return calculateKPIData(alerts);
        }
        return null;
    }, [alerts]);

    /**
     * Starts monitoring with automatic polling.
     * 
     * @returns {void}
     */
    const startMonitoring = (): void => {
        if (!isMonitoring) {
            setIsMonitoring(true);
            info("Monitoring started");
            const id = setInterval(() => {
                info("Polling dashboard data");
                loadAllData();
            }, POLLING_INTERVAL);
            setIntervalId(id);
        }
    };

    /**
     * Stops monitoring and clears polling interval.
     * 
     * @returns {void}
     */
    const stopMonitoring = (): void => {
        if (isMonitoring && intervalId) {
            setIsMonitoring(false);
            clearInterval(intervalId);
            setIntervalId(null);
            info("Monitoring stopped");
        }
    };

    /**
     * Manually refreshes all dashboard data.
     * 
     * @returns {void}
     */
    const refreshData = (): void => {
        info("Manual refresh triggered");
        loadAllData();
    };

    /**
     * Clears all dashboard data.
     * 
     * @returns {void}
     */
    const clearData = (): void => {
        info("Clearing all data");
        setAlerts([]);
        setKpiData(null);
        setAlertsLoading(false);
        setKpiLoading(false);
        setAlertsError(null);
        setKpiError(null);
    };

    useEffect(() => {
        loadAllData();
        startMonitoring();

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                info("Dashboard unmounted - polling stopped");
            }
        };
    }, []);

    return {
        kpiData: calculatedKPIData,
        alerts,
        trafficData: calculatedTrafficData,
        kpiLoading,
        alertsLoading,
        trafficLoading: alertsLoading,
        kpiError,
        alertsError,
        trafficError: null,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        clearData,
    };
};