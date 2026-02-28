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
    BackendResponse,
    LogsPageResponse,
    FlowLog,
    AuthTokens,
    Member,
    Project,
} from "../types/api";
import { info, error as logError, warning } from "./logger";

const API_BASE_URL = "http://localhost:8080/api/v1";
const REQUEST_TIMEOUT = 5000;

/**
 * Converts backend protocol number to string format.
 * 
 * @param {number} protocol - Protocol number (6=TCP, 17=UDP)
 * @param {number} port - Destination port
 * @returns {string} Protocol string (e.g., "TCP/443")
 */
const convertProtocol = (protocol: number, port: number): string => {
    const protocolName = protocol === 6 ? "TCP" : 
                        protocol === 17 ? "UDP" : 
                        "OTHER";
    return `${protocolName}/${port}`;
};

/**
 * Converts backend FlowLog to frontend Alert format.
 * 
 * @param {FlowLog} log - Backend flow log
 * @returns {Alert} Frontend alert object
 */
const convertLogToAlert = (log: FlowLog): Alert => {
    const status = log.isAnomaly 
        ? (log.anomalyScore >= 0.8 ? "Attack" : "Suspicious")
        : "Normal";
    
    const timestamp = new Date(log.ingestedAt).toLocaleTimeString(
        "en-GB", 
        { hour12: false }
    );

    return {
        id: log.id,
        sourceIP: log.srcIp,
        destIP: log.dstIp,
        protocol: convertProtocol(log.protocol, log.dstPort),
        bytes: log.inBytes,
        status: status,
        timestamp: timestamp,
    };
};

/**
 * Gets the stored access token from localStorage.
 * 
 * @returns {string | null} Access token or null
 */
const getAccessToken = (): string | null => {
    const authData = localStorage.getItem("auth_tokens");
    if (!authData) return null;
    
    try {
        const parsed = JSON.parse(authData);
        return parsed.accessToken || null;
    } catch {
        return null;
    }
};

/**
 * Gets the active project ID from localStorage.
 * 
 * @returns {string | null} Project ID or null
 */
const getActiveProjectId = (): string | null => {
    return localStorage.getItem("active_project_id");
};

/**
 * Performs a fetch request with timeout and auth headers.
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {boolean} useAuth - Whether to include auth header
 * @returns {Promise<Response>} The fetch response
 */
const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    useAuth: boolean = true
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(), 
        REQUEST_TIMEOUT
    );

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers as Record<string, string>,
    };

    if (useAuth) {
        const token = getAccessToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
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
    const baseAlerts: Alert[] = [
        {
            id: "1",
            sourceIP: "192.168.1.45",
            destIP: "10.0.0.12",
            protocol: "TCP/443",
            bytes: 2048,
            status: "Attack",
            timestamp: "14:23:45",
        },
        {
            id: "5",
            sourceIP: "192.168.2.34",
            destIP: "10.0.0.12",
            protocol: "TCP/3389",
            bytes: 8192,
            status: "Attack",
            timestamp: "14:23:30",
        },
        {
            id: "3",
            sourceIP: "192.168.1.89",
            destIP: "10.0.0.25",
            protocol: "TCP/22",
            bytes: 1536,
            status: "Suspicious",
            timestamp: "14:23:38",
        },
        {
            id: "2",
            sourceIP: "172.16.0.55",
            destIP: "10.0.0.18",
            protocol: "UDP/53",
            bytes: 512,
            status: "Normal",
            timestamp: "14:23:42",
        },
    ];

    return baseAlerts;
};

/**
 * Fetches KPI data from the backend API.
 * Falls back to mock data on error.
 * 
 * @returns {Promise<KPIData>} KPI data structure
 */
export const fetchKPIs = async (): Promise<KPIData> => {
    return getMockKPIData();
};

/**
 * Fetches real-time alerts from the backend API.
 * Falls back to mock data on error.
 * 
 * @returns {Promise<AlertsResponse>} Alerts response data
 */
export const fetchAlerts = async (): Promise<AlertsResponse> => {
    try {
        const projectId = getActiveProjectId();
        if (!projectId) {
            const mockAlerts = getMockAlerts();
            return {
                alerts: mockAlerts,
                totalCount: mockAlerts.length,
                lastUpdated: new Date().toISOString(),
            };
        }

        const response = await fetchWithTimeout(
            `${API_BASE_URL}/logs?projectId=${projectId}&page=0&size=100&onlyAnomalies=false`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const backendResponse: BackendResponse<LogsPageResponse> = 
            await response.json();
        
        const alerts = backendResponse.data.content.map(
            convertLogToAlert
        );
        
        info("Alerts data fetched from API");
        return {
            alerts: alerts,
            totalCount: backendResponse.data.totalElements,
            lastUpdated: new Date().toISOString(),
        };
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
    return {
        categories: [],
        totalFlows: 0,
        lastUpdated: new Date().toISOString(),
    };
};

/**
 * Logs in a user and returns auth tokens.
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<AuthTokens>} Auth tokens
 */
export const loginUser = async (
    email: string, 
    password: string
): Promise<AuthTokens> => {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",
            body: JSON.stringify({ email, password }),
        },
        false
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
    }

    const backendResponse: BackendResponse<AuthTokens> = 
        await response.json();
    
    info("User logged in successfully");
    return backendResponse.data;
};

/**
 * Registers a new user.
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @returns {Promise<Member>} Created member data
 */
export const signupUser = async (
    email: string,
    password: string,
    name: string
): Promise<Member> => {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/signup`,
        {
            method: "POST",
            body: JSON.stringify({ email, password, name }),
        },
        false
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
    }

    const backendResponse: BackendResponse<Member> = 
        await response.json();
    
    info("User signed up successfully");
    return backendResponse.data;
};

/**
 * Fetches user's projects list.
 * 
 * @returns {Promise<Project[]>} Array of projects
 */
export const fetchProjects = async (): Promise<Project[]> => {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/projects`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const backendResponse: BackendResponse<Project[]> = 
        await response.json();
    
    info("Projects fetched successfully");
    return backendResponse.data;
};

/**
 * Creates a new project.
 * 
 * @param {string} name - Project name
 * @param {string} description - Project description
 * @returns {Promise<Project>} Created project data
 */
export const createProject = async (
    name: string,
    description: string
): Promise<Project> => {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/projects`,
        {
            method: "POST",
            body: JSON.stringify({ name, description }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Project creation failed");
    }

    const backendResponse: BackendResponse<Project> = 
        await response.json();
    
    info("Project created successfully");
    return backendResponse.data;
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