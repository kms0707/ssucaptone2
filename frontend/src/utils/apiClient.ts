/**
 * API client for communicating with the NIDS backend.
 */

import {
    Alert,
    AlertsResponse,
    TrafficDistributionResponse,
    APIError,
    BackendResponse,
    LogsPageResponse,
    FlowLog,
    AuthTokens,
    Member,
    Project,
} from "../types/api";
import { info, error as logError } from "./logger";
import { AUTH_UNAUTHORIZED_EVENT } from "./authEvents";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"
).replace(/\/$/, "");
const REQUEST_TIMEOUT = 5000;
const ALERTS_PAGE_SIZE = 100;
const SUMMARY_PAGE_SIZE = 1;

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

const normalizeNumber = (value: number | null | undefined): number => {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const normalizeText = (value: string | null | undefined, fallback = "N/A"): string => {
    return typeof value === "string" && value.trim().length > 0
        ? value
        : fallback;
};

/**
 * Converts backend FlowLog to frontend Alert format.
 * 
 * @param {FlowLog} log - Backend flow log
 * @returns {Alert} Frontend alert object
 */
const convertLogToAlert = (log: FlowLog): Alert => {
    const status = log.isAnomaly ? "Attack" : "Normal";
    
    const parsedDate = log.ingestedAt ? new Date(log.ingestedAt) : null;
    const timestamp = parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleTimeString("en-GB", { hour12: false })
        : "N/A";

    return {
        id: normalizeText(log.id, "unknown-flow-log"),
        sourceIP: normalizeText(log.srcIp),
        destIP: normalizeText(log.dstIp),
        protocol: convertProtocol(
            normalizeNumber(log.protocol),
            normalizeNumber(log.dstPort)
        ),
        inBytes: normalizeNumber(log.inBytes),
        outBytes: normalizeNumber(log.outBytes),
        status: status,
        timestamp: timestamp,
        ingestedAt: log.ingestedAt,
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
 * Clears persisted auth state when the backend rejects the current token.
 *
 * @returns {void}
 */
const handleUnauthorizedResponse = (): void => {
    if (!getAccessToken()) {
        return;
    }

    localStorage.removeItem("auth_tokens");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("active_project_id");
    localStorage.removeItem("active_project_name");
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
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
            cache: options.cache ?? "no-store",
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (useAuth && response.status === 401) {
            handleUnauthorizedResponse();
        }

        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
};

const fetchLogsPage = async (
    page: number,
    size: number,
    onlyAnomalies: boolean,
    projectIdOverride?: number
): Promise<LogsPageResponse> => {
    const projectId = projectIdOverride?.toString() ?? getActiveProjectId();
    if (!projectId) {
        throw new Error("No active project selected");
    }

    const response = await fetchWithTimeout(
        `${API_BASE_URL}/logs?projectId=${projectId}&page=${page}` +
        `&size=${size}&onlyAnomalies=${onlyAnomalies}`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const backendResponse: BackendResponse<LogsPageResponse> =
        await response.json();

    return backendResponse.data;
};

/**
 * Fetches real-time alerts from the backend API.
 * 
 * @returns {Promise<AlertsResponse>} Alerts response data
 */
export const fetchAlerts = async (
    page: number = 0,
    size: number = ALERTS_PAGE_SIZE,
    projectIdOverride?: number
): Promise<AlertsResponse> => {
    const pageData = await fetchLogsPage(
        page,
        size,
        false,
        projectIdOverride
    );
    const alerts = pageData.content.map(convertLogToAlert);

    info("Alerts data fetched from API");
    return {
        alerts,
        totalCount: pageData.totalElements,
        lastUpdated: new Date().toISOString(),
        currentPage: pageData.number,
        pageSize: pageData.size,
        totalPages: pageData.totalPages,
    };
};

/**
 * Fetches alert details for a specific alert ID.
 * 
 * @param {string} alertId - Alert ID
 * @returns {Promise<Alert>} Alert detail data
 */
export const fetchAlertDetail = async (
    alertId: string,
    projectIdOverride?: number
): Promise<Alert> => {
    const projectId = projectIdOverride?.toString() ?? getActiveProjectId();
    if (!projectId) {
        throw new Error("No active project selected");
    }

    const response = await fetchWithTimeout(
        `${API_BASE_URL}/logs/${alertId}?projectId=${projectId}`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const backendResponse: BackendResponse<FlowLog> = await response.json();

    return {
        ...convertLogToAlert(backendResponse.data),
        score: backendResponse.data.anomalyScore,
    };
};

/**
 * Fetches KPI data from the backend API.
 * 
 * @returns {Promise<never>} KPI endpoint is not implemented separately
 */
export const fetchKPIs = async (): Promise<never> => {
    throw new Error("KPI data should be derived from fetched alerts");
};

/**
 * Fetches traffic distribution from the backend API.
 * 
 * @returns {Promise<TrafficDistributionResponse>} Traffic data
 */
export const fetchTrafficDistribution = async (
    projectIdOverride?: number
):
    Promise<TrafficDistributionResponse> => {
    const [allLogsPage, anomalyLogsPage] = await Promise.all([
        fetchLogsPage(0, SUMMARY_PAGE_SIZE, false, projectIdOverride),
        fetchLogsPage(0, SUMMARY_PAGE_SIZE, true, projectIdOverride),
    ]);
    const totalFlows = allLogsPage.totalElements;
    const attackCount = anomalyLogsPage.totalElements;
    const normalCount = Math.max(totalFlows - attackCount, 0);
    const categories = [
        {
            name: "Normal",
            value: normalCount,
            color: "#14b8a6",
        },
        {
            name: "Attack",
            value: attackCount,
            color: "#ef4444",
        },
    ];

    return {
        categories,
        totalFlows,
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
 * Reissues the API key for a project.
 * 
 * @param {number} projectId - Project ID
 * @param {string} reason - Reissue reason
 * @returns {Promise<Project>} Updated project data
 */
export const reissueProjectApiKey = async (
    projectId: number,
    reason: string = "User requested regeneration"
): Promise<Project> => {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/projects/${projectId}/api-key/reissue?reason=${encodeURIComponent(reason)}`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "API key regeneration failed");
    }

    const backendResponse: BackendResponse<Project> =
        await response.json();

    info("Project API key reissued successfully", { projectId });
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
 * Deletes a project.
 *
 * @param {number} projectId - Project ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId: number): Promise<void> => {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/projects/${projectId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || "Project deletion failed");
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }

            throw new Error("Project deletion failed");
        }
    }

    info("Project deleted successfully", { projectId });
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
