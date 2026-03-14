/**
 * Custom hook for managing dashboard data with polling.
 * Fetches KPIs, alerts, and traffic data from the API.
 */

import { useState, useEffect, useMemo } from "react";
import { 
    fetchAlerts, 
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
        Attack: 0,
    };

    alerts.forEach((alert) => {
        counts[alert.status]++;
    });

    return [
        { name: "Normal", value: counts.Normal, color: "#14b8a6" },
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
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [alertsError, setAlertsError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(100);

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
     * Clears all dashboard data.
     * 
     * @returns {void}
     */
    const clearData = (): void => {
        info("Clearing all data");
        setAlerts([]);
        setAlertsLoading(false);
        setAlertsError(null);
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
        info("Monitoring started", { projectId, currentPage });

        const loadAlertsData = async (): Promise<void> => {
            try {
                setAlertsError(null);
                const response = await fetchAlerts(currentPage, pageSize);
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

        void loadAlertsData();

        const pollingId = shouldPoll
            ? setInterval(() => {
                info("Polling dashboard data", { projectId, currentPage });
                void loadAlertsData();
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
        trafficData: calculatedTrafficData,
        kpiLoading: alertsLoading,
        alertsLoading,
        trafficLoading: alertsLoading,
        kpiError: alertsError,
        alertsError,
        trafficError: null,
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
