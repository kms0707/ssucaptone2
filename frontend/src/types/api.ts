/**
 * TypeScript type definitions for API data models.
 * Defines the structure of data exchanged with the backend.
 */

/**
 * Alert status type representing traffic classification.
 */
export type AlertStatus = "Normal" | "Attack";

/**
 * Individual alert record from the real-time monitoring system.
 */
export interface Alert {
    id: string;
    sourceIP: string;
    destIP: string;
    protocol: string;
    inBytes: number;
    outBytes: number;
    status: AlertStatus;
    timestamp: string;
    score?: number;
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
    inBytes: number;
    outBytes: number;
}

/**
 * Backend API common wrapper response.
 */
export interface BackendResponse<T> {
    status: number;
    message: string;
    data: T;
}

/**
 * Backend flow log structure (49 AI features).
 */
export interface FlowLog {
    id: string;
    projectId: string;
    ingestedAt: string;
    srcIp: string;
    dstIp: string;
    srcPort: number;
    dstPort: number;
    protocol: number;
    inBytes: number;
    inPkts: number;
    outBytes: number;
    outPkts: number;
    flowDuration: number;
    tcpFlags: number;
    isAnomaly: boolean;
    anomalyScore: number;
}

/**
 * Backend paginated logs response.
 */
export interface LogsPageResponse {
    content: FlowLog[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * Backend auth login response.
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
}

/**
 * Backend member (user) structure.
 */
export interface Member {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Backend project structure.
 */
export interface Project {
    id: number;
    name: string;
    description: string;
    apiKey: string;
    apiKeyStatus: string;
    apiKeyCreatedAt: string;
    createdAt: string;
}
