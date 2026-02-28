import { AlertsTable } from "../AlertsTable";
import { TrafficChart } from "../TrafficChart";
import { useLanguage } from "../../utils/LanguageContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import { SessionSaveModal } from "../SessionSaveModal";
import { Play, Square, Trash2, Save, ArrowLeft } from "lucide-react";
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
        kpiData,
        alerts,
        trafficData,
        kpiLoading,
        alertsLoading,
        trafficLoading,
        kpiError,
        alertsError,
        trafficError,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        clearData,
    } = useDashboardData();

    /**
     * Renders the top status bar with system metrics.
     * 
     * @returns {JSX.Element} The status bar
     */
    const renderStatusBar = (): JSX.Element => {
        if (kpiLoading) {
            return (
                <div className="bg-gray-900 border border-gray-800 px-4 
                    py-2 mb-4">
                    <span className="text-gray-500 text-xs">
                        Loading system status...
                    </span>
                </div>
            );
        }

        if (kpiError) {
            return (
                <div className="bg-gray-900 border border-gray-800 px-4 
                    py-2 mb-4">
                    <span className="text-red-400 text-xs">
                        System status unavailable
                    </span>
                </div>
            );
        }

        const totalFlows = kpiData?.totalFlows.toLocaleString() || "0";
        const attacks = kpiData?.attacksDetected || 0;
        const suspicious = kpiData?.suspiciousFlows || 0;
        const accuracy = kpiData?.accuracy || 0;
        
        const attackRate = kpiData?.totalFlows 
            ? ((attacks / kpiData.totalFlows) * 100).toFixed(2)
            : "0.00";

        return (
            <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 
                mb-3 flex items-center gap-4 text-[10px]">
                <span className="text-gray-500">
                    Sessions: <span className="text-white">{totalFlows}</span>
                </span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-500">
                    Attack Rate: 
                    <span className={attacks > 0 
                        ? "text-red-400 ml-1" 
                        : "text-white ml-1"}>
                        {attackRate}%
                    </span>
                </span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-500">
                    Active Alerts: 
                    <span className={attacks > 0 
                        ? "text-orange-400 ml-1" 
                        : "text-white ml-1"}>
                        {attacks}
                    </span>
                </span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-500">
                    Suspicious: <span className="text-white">{suspicious}</span>
                </span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-500">
                    Model: <span className="text-green-500">Online</span>
                </span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-500">
                    Accuracy: <span className="text-white">{accuracy}%</span>
                </span>
                
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-gray-500">
                        Status: 
                        <span className={isMonitoring 
                            ? "text-green-500 ml-1" 
                            : "text-gray-500 ml-1"}>
                            {isMonitoring ? "Active" : "Stopped"}
                        </span>
                    </span>
                    <span className="text-gray-700">|</span>
                    
                    {isMonitoring ? (
                        <button
                            onClick={stopMonitoring}
                            className="flex items-center gap-1 px-2 py-0.5 
                                bg-gray-800 border border-gray-700 
                                hover:bg-gray-700 rounded-none"
                            title="Stop Monitoring"
                        >
                            <Square className="w-3 h-3 text-red-400" />
                            <span className="text-[9px] text-gray-300">
                                Stop
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={startMonitoring}
                            className="flex items-center gap-1 px-2 py-0.5 
                                bg-gray-800 border border-gray-700 
                                hover:bg-gray-700 rounded-none"
                            title="Start Monitoring"
                        >
                            <Play className="w-3 h-3 text-green-500" />
                            <span className="text-[9px] text-gray-300">
                                Start
                            </span>
                        </button>
                    )}
                    
                    <button
                        onClick={clearData}
                        disabled={isMonitoring}
                        className={`flex items-center gap-1 px-2 py-0.5 
                            bg-gray-800 border transition-colors ${
                            isMonitoring 
                                ? "border-gray-800 opacity-40 \
                                    cursor-not-allowed" 
                                : "border-gray-700 hover:bg-gray-700"
                        }`}
                        title={isMonitoring 
                            ? "Stop monitoring to clear data" 
                            : "Clear all data"}
                    >
                        <Trash2 className="w-3 h-3 text-orange-400" />
                        <span className="text-[9px] text-gray-300">
                            Clear
                        </span>
                    </button>
                    
                    <button
                        onClick={handleOpenSaveModal}
                        disabled={isMonitoring || alerts.length === 0}
                        className={`flex items-center gap-1 px-2 py-0.5 
                            bg-gray-800 border transition-colors ${
                            isMonitoring || alerts.length === 0
                                ? "border-gray-800 opacity-40 \
                                    cursor-not-allowed" 
                                : "border-gray-700 hover:bg-gray-700"
                        }`}
                        title={
                            isMonitoring 
                                ? "Stop monitoring to save session" 
                                : alerts.length === 0
                                ? "No data to save"
                                : "Save current session"}
                    >
                        <Save className="w-3 h-3 text-teal-400" />
                        <span className="text-[9px] text-gray-300">
                            Save
                        </span>
                    </button>
                </div>
            </div>
        );
    };

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
            {renderStatusBar()}
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