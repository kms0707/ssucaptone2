/**
 * TypeScript type definitions for API data models.
 * Defines the structure of data exchanged with the backend.
 */

/**
 * Alert status type representing traffic classification.
 */
export type AlertStatus = "Normal" | "Suspicious" | "Attack";

/**
 * Individual alert record from the real-time monitoring system.
 */
export interface Alert {
    id: string;
    sourceIP: string;
    destIP: string;
    protocol: string;
    bytes: number;
    score: number;
    status: AlertStatus;
    timestamp: string;
}

/**
 * API response for fetching alerts.
 */
export interface AlertsResponse {
    alerts: Alert[];
    totalCount: number;
    lastUpdated: string;
}

/**
 * Key Performance Indicator data structure.
 */
export interface KPIData {
    totalFlows: number;
    attacksDetected: number;
    suspiciousFlows: number;
    accuracy: number;
    lastUpdated: string;
}

/**
 * Traffic distribution category data.
 */
export interface TrafficCategory {
    name: string;
    value: number;
    color: string;
}

/**
 * API response for traffic distribution.
 */
export interface TrafficDistributionResponse {
    categories: TrafficCategory[];
    totalFlows: number;
    lastUpdated: string;
}

/**
 * Generic API error response.
 */
export interface APIError {
    message: string;
    code?: string;
    timestamp: string;
}

/**
 * Detection detail data for a specific alert.
 */
export interface DetectionDetail {
    detectionTime: string;
    sourceIP: string;
    destIP: string;
    attackType: string;
    riskLevel: string;
    anomalyScore: number;
    protocol: string;
    bytes: number;
}
