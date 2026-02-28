/**
 * Session Management utilities for NIDS application.
 * Handles saving, loading, and managing detection sessions.
 */

export interface Alert {
    id: string;
    timestamp: string;
    sourceIP: string;
    destIP: string;
    protocol: string;
    status: string;
    score: number;
    bytes: number;
}

export interface SessionData {
    id: string;
    name: string;
    description: string;
    tags: string[];
    createdAt: string;
    alerts: Alert[];
    totalAlerts: number;
    attackCount: number;
    suspiciousCount: number;
    normalCount: number;
}

const STORAGE_KEY = "nids_sessions";

/**
 * Saves a new session to localStorage.
 * 
 * @param {SessionData} session - The session data to save
 * @returns {boolean} Success status
 */
export function saveSession(session: SessionData): boolean {
    try {
        const sessions = getAllSessions();
        sessions.push(session);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        return true;
    } catch (error) {
        console.error("Failed to save session:", error);
        return false;
    }
}

/**
 * Retrieves all saved sessions from localStorage.
 * 
 * @returns {SessionData[]} Array of all sessions
 */
export function getAllSessions(): SessionData[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load sessions:", error);
        return [];
    }
}

/**
 * Retrieves a specific session by ID.
 * 
 * @param {string} id - The session ID
 * @returns {SessionData | null} The session or null if not found
 */
export function getSessionById(id: string): SessionData | null {
    const sessions = getAllSessions();
    return sessions.find((s) => s.id === id) || null;
}

/**
 * Deletes a session by ID.
 * 
 * @param {string} id - The session ID to delete
 * @returns {boolean} Success status
 */
export function deleteSession(id: string): boolean {
    try {
        const sessions = getAllSessions();
        const filtered = sessions.filter((s) => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error("Failed to delete session:", error);
        return false;
    }
}

/**
 * Updates an existing session.
 * 
 * @param {string} id - The session ID to update
 * @param {Partial<SessionData>} updates - Partial updates
 * @returns {boolean} Success status
 */
export function updateSession(
    id: string,
    updates: Partial<SessionData>
): boolean {
    try {
        const sessions = getAllSessions();
        const index = sessions.findIndex((s) => s.id === id);
        
        if (index === -1) return false;
        
        sessions[index] = { ...sessions[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        return true;
    } catch (error) {
        console.error("Failed to update session:", error);
        return false;
    }
}

/**
 * Exports sessions to a JSON file.
 * 
 * @param {string[]} sessionIds - Array of session IDs to export
 * @returns {void}
 */
export function exportSessions(sessionIds: string[]): void {
    const sessions = getAllSessions();
    const toExport = sessions.filter((s) => sessionIds.includes(s.id));
    
    const dataStr = JSON.stringify(toExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `nids_sessions_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Imports sessions from a JSON file.
 * 
 * @param {File} file - The JSON file to import
 * @returns {Promise<boolean>} Success status
 */
export async function importSessions(file: File): Promise<boolean> {
    try {
        const text = await file.text();
        const imported: SessionData[] = JSON.parse(text);
        
        if (!Array.isArray(imported)) {
            throw new Error("Invalid session file format");
        }
        
        const existingSessions = getAllSessions();
        const merged = [...existingSessions, ...imported];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return true;
    } catch (error) {
        console.error("Failed to import sessions:", error);
        return false;
    }
}

/**
 * Generates a unique session ID.
 * 
 * @returns {string} A unique session ID
 */
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates session statistics from alerts.
 * 
 * @param {Alert[]} alerts - Array of alerts
 * @returns {object} Statistics object
 */
export function calculateSessionStats(alerts: Alert[]): {
    totalAlerts: number;
    attackCount: number;
    suspiciousCount: number;
    normalCount: number;
} {
    return {
        totalAlerts: alerts.length,
        attackCount: alerts.filter((a) => a.status === "Attack")
            .length,
        suspiciousCount: alerts.filter((a) => a.status === "Suspicious")
            .length,
        normalCount: alerts.filter((a) => a.status === "Normal")
            .length,
    };
}