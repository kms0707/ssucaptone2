/**
 * API client for communicating with the NIDS backend.
 * Implements fetch logic with automatic mock fallback on failure.
 */

import {
    Alert,
    AlertsResponse,
    KPIData,
    TrafficDistributionResponse,
    APIError,
} from "../types/api";
import { info, error as logError, warning } from "./logger";

const API_BASE_URL = "/api";
const REQUEST_TIMEOUT = 5000;

/**
 * Mock KPI data for fallback when API is unavailable.
 * 
 * @returns {KPIData} Mock KPI data structure
 */
const getMockKPIData = (): KPIData => {
    return {
        totalFlows: 1248,
        attacksDetected: 2,
        suspiciousFlows: 1,
        accuracy: 98.4,
        lastUpdated: new Date().toISOString(),
    };
};

/**
 * Mock alerts data for fallback when API is unavailable.
 * 
 * @returns {Alert[]} Array of mock alert records
 */
const getMockAlerts = (): Alert[] => {
    return [
        {
            id: "1",
            sourceIP: "192.168.1.45",
            destIP: "10.0.0.12",
            protocol: "TCP/443",
            bytes: 2048,
            score: 0.95,
            status: "Attack",
            timestamp: "14:23:45",
        },
        {
            id: "5",
            sourceIP: "192.168.2.34",
            destIP: "10.0.0.12",
            protocol: "TCP/3389",
            bytes: 8192,
            score: 0.89,
            status: "Attack",
            timestamp: "14:23:30",
        },
        {
            id: "3",
            sourceIP: "192.168.1.89",
            destIP: "10.0.0.25",
            protocol: "TCP/22",
            bytes: 1536,
            score: 0.68,
            status: "Suspicious",
            timestamp: "14:23:38",
        },
        {
            id: "2",
            sourceIP: "172.16.0.55",
            destIP: "10.0.0.18",
            protocol: "UDP/53",
            bytes: 512,
            score: 0.23,
            status: "Normal",
            timestamp: "14:23:42",
        },
    ];
};

/**
 * Mock traffic distribution for fallback.
 * 
 * @returns {TrafficDistributionResponse} Mock traffic data
 */
const getMockTrafficDistribution = 
    (): TrafficDistributionResponse => {
    return {
        categories: [
            { name: "Normal", value: 1245, color: "#14b8a6" },
            { name: "Suspicious", value: 1, color: "#fb923c" },
            { name: "Attack", value: 2, color: "#ef4444" },
        ],
        totalFlows: 1248,
        lastUpdated: new Date().toISOString(),
    };
};

/**
 * Performs a fetch request with timeout.
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(), 
        REQUEST_TIMEOUT
    );

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
};

/**
 * Fetches KPI data from the backend API.
 * Falls back to mock data on error.
 * 
 * @returns {Promise<KPIData>} KPI data structure
 */
export const fetchKPIs = async (): Promise<KPIData> => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/kpis`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid response type");
        }

        const data = await response.json();
        info("KPI data fetched from API");
        return data;
    } catch (err) {
        return getMockKPIData();
    }
};

/**
 * Fetches real-time alerts from the backend API.
 * Falls back to mock data on error.
 * 
 * @returns {Promise<AlertsResponse>} Alerts response data
 */
export const fetchAlerts = async (): Promise<AlertsResponse> => {
    try {
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/alerts`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid response type");
        }

        const data = await response.json();
        info("Alerts data fetched from API");
        return data;
    } catch (err) {
        const mockAlerts = getMockAlerts();
        return {
            alerts: mockAlerts,
            totalCount: mockAlerts.length,
            lastUpdated: new Date().toISOString(),
        };
    }
};

/**
 * Fetches traffic distribution from the backend API.
 * Falls back to mock data on error.
 * 
 * @returns {Promise<TrafficDistributionResponse>} Traffic data
 */
export const fetchTrafficDistribution = async (): 
    Promise<TrafficDistributionResponse> => {
    try {
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/traffic/distribution`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid response type");
        }

        const data = await response.json();
        info("Traffic data fetched from API");
        return data;
    } catch (err) {
        return getMockTrafficDistribution();
    }
};

/**
 * Handles API errors and returns structured error data.
 * 
 * @param {unknown} err - The error object
 * @returns {APIError} Structured API error
 */
export const handleAPIError = (err: unknown): APIError => {
    logError("API error occurred", err);

    if (err instanceof Error) {
        return {
            message: err.message,
            timestamp: new Date().toISOString(),
        };
    }

    return {
        message: "An unknown error occurred",
        timestamp: new Date().toISOString(),
    };
};