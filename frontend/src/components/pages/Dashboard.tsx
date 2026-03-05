import { AlertsTable } from "../AlertsTable";
import { TrafficChart } from "../TrafficChart";
import { useLanguage } from "../../utils/LanguageContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import { SessionSaveModal } from "../SessionSaveModal";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
    saveSession,
    generateSessionId,
    calculateSessionStats,
    SessionData,
    Alert,
} from "../../utils/sessionManager";

interface DashboardProps {
    onNavigateToDetection?: (alertId: string) => void;
    projectId: number;
    projectName: string;
    onBackToProjects: () => void;
}

/**
 * Main dashboard page component for the NIDS application.
 * Displays key metrics, real-time alerts, and traffic distribution.
 * 
 * @param {DashboardProps} props - Component properties
 * @param {Function} props.onNavigateToDetection - Callback for alert clicks
 * @returns {JSX.Element} The dashboard page layout
 */
export function Dashboard({ onNavigateToDetection, projectId, projectName, onBackToProjects }: DashboardProps) {
    const { t } = useLanguage();
    
    const {
        alerts,
        trafficData,
        alertsLoading,
        trafficLoading,
        alertsError,
        trafficError,
        isMonitoring,
    } = useDashboardData();

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    /**
     * Handles opening the save session modal.
     * 
     * @returns {void}
     */
    const handleOpenSaveModal = (): void => {
        if (alerts.length === 0) return;
        setIsSaveModalOpen(true);
    };

    /**
     * Handles saving a session with metadata.
     * 
     * @param {string} name - Session name
     * @param {string} description - Session description
     * @param {string[]} tags - Session tags
     * @returns {void}
     */
    const handleSaveSession = (
        name: string,
        description: string,
        tags: string[]
    ): void => {
        const stats = calculateSessionStats(alerts as Alert[]);
        
        const session: SessionData = {
            id: generateSessionId(),
            name,
            description,
            tags,
            createdAt: new Date().toISOString(),
            alerts: alerts as Alert[],
            ...stats,
        };
        
        const success = saveSession(session);
        
        if (success) {
            alert(t("sessionSaved"));
        }
        
        setIsSaveModalOpen(false);
    };

    return (
        <div>
            <div className="bg-gray-900 border border-gray-800 px-3 py-2 
                mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBackToProjects}
                        className="text-gray-600 hover:text-gray-500 
                            flex items-center gap-1.5 text-xs"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Projects
                    </button>
                    <span className="text-gray-700">|</span>
                    <span className="text-gray-500 text-[10px]">
                        Current Project: 
                        <span className="text-white ml-1.5">
                            {projectName}
                        </span>
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                    <AlertsTable 
                        alerts={alerts}
                        loading={alertsLoading}
                        error={alertsError}
                        onAlertClick={onNavigateToDetection}
                        isMonitoring={isMonitoring}
                    />
                </div>
                <div className="col-span-1">
                    <TrafficChart 
                        data={trafficData}
                        loading={trafficLoading}
                        error={trafficError}
                    />
                </div>
            </div>
            <SessionSaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSaveSession}
            />
        </div>
    );
}
