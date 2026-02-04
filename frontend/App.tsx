import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/pages/Dashboard";
import { DetectionDetail } from "./components/pages/DetectionDetail";
import { Settings } from "./components/pages/Settings";
import { LanguageProvider } from "./utils/LanguageContext";

/**
 * Main application component for the Network Intrusion Detection System.
 * Manages routing between dashboard, detection detail, and settings pages.
 * 
 * @returns {JSX.Element} The main application layout with sidebar navigation
 */
export default function App() {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(
        null
    );

    /**
     * Navigates to the detection detail page for a specific alert.
     * 
     * @param {string} alertId - The unique identifier of the alert to view
     * @returns {void}
     */
    const handleNavigateToDetection = (alertId: string): void => {
        setSelectedAlertId(alertId);
        setCurrentPage("detection");
    };

    /**
     * Renders the appropriate page component based on current navigation.
     * 
     * @returns {JSX.Element} The active page component
     */
    const renderPage = (): JSX.Element => {
        switch (currentPage) {
            case "dashboard":
                return (
                    <Dashboard 
                        onNavigateToDetection={handleNavigateToDetection} 
                    />
                );
            case "detection":
                return <DetectionDetail alertId={selectedAlertId} />;
            case "settings":
                return <Settings />;
            default:
                return (
                    <Dashboard 
                        onNavigateToDetection={handleNavigateToDetection} 
                    />
                );
        }
    };

    return (
        <LanguageProvider>
            <div className="min-h-screen bg-gray-900 flex">
                <Sidebar 
                    currentPage={currentPage} 
                    onPageChange={setCurrentPage} 
                />
                <div className="flex-1 ml-64">
                    <div className="p-10 max-w-[1920px]">
                        {renderPage()}
                    </div>
                </div>
            </div>
        </LanguageProvider>
    );
}
