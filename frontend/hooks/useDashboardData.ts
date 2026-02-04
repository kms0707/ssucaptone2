/**
 * Custom hook for managing dashboard data with polling.
 * Fetches KPIs, alerts, and traffic data from the API.
 */

import { useState, useEffect } from "react";
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
}

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
            setAlerts(response.alerts);
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
            loadTrafficData(),
        ]);
    };

    useEffect(() => {
        loadAllData();

        const intervalId = setInterval(() => {
            info("Polling dashboard data");
            loadAllData();
        }, POLLING_INTERVAL);

        return () => {
            clearInterval(intervalId);
            info("Dashboard polling stopped");
        };
    }, []);

    return {
        kpiData,
        alerts,
        trafficData,
        kpiLoading,
        alertsLoading,
        trafficLoading,
        kpiError,
        alertsError,
        trafficError,
    };
};
