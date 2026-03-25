/**
 * Custom hook for managing dashboard data with polling.
 * Fetches KPIs, alerts, and traffic data from the API.
 */

import { useState, useEffect, useMemo } from "react";
import { 
    fetchAlerts, 
    fetchTrafficDistribution,
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
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    goToPage: (page: number) => void;
}

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
        suspiciousFlows: 0,
        accuracy: parseFloat(accuracy),
        lastUpdated: new Date().toISOString(),
    };
};

export const useDashboardData = (projectId: number): DashboardData => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [trafficData, setTrafficData] = useState<TrafficCategory[]>([]);
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [trafficLoading, setTrafficLoading] = useState(true);
    const [alertsError, setAlertsError] = useState<string | null>(null);
    const [trafficError, setTrafficError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(100);

    // Calculate KPI data from alerts
    const calculatedKPIData = useMemo(() => {
        if (alerts.length > 0) {
            return calculateKPIData(alerts);
        }
        return null;
    }, [alerts]);

    /**
     * Clears all dashboard data.
     * 
     * @returns {void}
     */
    const clearData = (): void => {
        info("Clearing all data");
        setAlerts([]);
        setTrafficData([]);
        setAlertsLoading(false);
        setTrafficLoading(false);
        setAlertsError(null);
        setTrafficError(null);
        setTotalPages(0);
        setTotalCount(0);
    };

    useEffect(() => {
        setCurrentPage(0);
    }, [projectId]);

    useEffect(() => {
        let isDisposed = false;
        const shouldPoll = currentPage === 0;

        setAlertsLoading(true);
        setTrafficLoading(true);
        info("Monitoring started", { projectId, currentPage });

        const loadAlertsData = async (): Promise<void> => {
            try {
                setAlertsError(null);
                const response = await fetchAlerts(
                    currentPage,
                    pageSize,
                    projectId
                );
                if (isDisposed) {
                    return;
                }

                setAlerts(response.alerts);
                setTotalPages(response.totalPages);
                setTotalCount(response.totalCount);
                setPageSize(response.pageSize);

                info("Alerts data updated successfully", {
                    projectId,
                    currentPage: response.currentPage,
                    loadedAlerts: response.alerts.length,
                    totalCount: response.totalCount,
                });
            } catch (err) {
                if (isDisposed) {
                    return;
                }

                const message = err instanceof Error
                    ? err.message
                    : "Unknown error";
                setAlertsError(message);
            } finally {
                if (!isDisposed) {
                    setAlertsLoading(false);
                }
            }
        };

        const loadTrafficData = async (): Promise<void> => {
            try {
                setTrafficError(null);
                const response = await fetchTrafficDistribution(projectId);
                if (isDisposed) {
                    return;
                }

                setTrafficData(response.categories);
                info("Traffic distribution updated successfully", {
                    projectId,
                    totalFlows: response.totalFlows,
                });
            } catch (err) {
                if (isDisposed) {
                    return;
                }

                const message = err instanceof Error
                    ? err.message
                    : "Unknown error";
                setTrafficError(message);
            } finally {
                if (!isDisposed) {
                    setTrafficLoading(false);
                }
            }
        };

        const loadDashboardData = async (): Promise<void> => {
            await Promise.all([
                loadAlertsData(),
                loadTrafficData(),
            ]);
        };

        void loadDashboardData();

        const pollingId = shouldPoll
            ? setInterval(() => {
                info("Polling dashboard data", { projectId, currentPage });
                void loadDashboardData();
            }, POLLING_INTERVAL)
            : null;

        return () => {
            isDisposed = true;
            if (pollingId) {
                clearInterval(pollingId);
            }
            info("Dashboard monitoring stopped", { projectId, currentPage });
        };
    }, [projectId, currentPage, pageSize]);

    return {
        kpiData: calculatedKPIData,
        alerts,
        trafficData,
        kpiLoading: alertsLoading,
        alertsLoading,
        trafficLoading,
        kpiError: alertsError,
        alertsError,
        trafficError,
        isMonitoring: currentPage === 0,
        startMonitoring: (): void => undefined,
        stopMonitoring: (): void => undefined,
        clearData,
        currentPage,
        totalPages,
        totalCount,
        pageSize,
        goToPage: (page: number): void => {
            setCurrentPage(Math.max(0, page));
        },
    };
};
