import { StatCard } from "../StatCard";
import { AlertsTable } from "../AlertsTable";
import { TrafficChart } from "../TrafficChart";
import { Activity, AlertTriangle, Shield, Target } from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";
import { useDashboardData } from "../../hooks/useDashboardData";

interface DashboardProps {
    onNavigateToDetection?: (alertId: string) => void;
}

/**
 * Main dashboard page component for the NIDS application.
 * Displays key metrics, real-time alerts, and traffic distribution.
 * 
 * @param {DashboardProps} props - Component properties
 * @param {Function} props.onNavigateToDetection - Callback for alert clicks
 * @returns {JSX.Element} The dashboard page layout
 */
export function Dashboard({ onNavigateToDetection }: DashboardProps) {
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
    } = useDashboardData();

    /**
     * Renders the page header with title and description.
     * 
     * @returns {JSX.Element} The header section
     */
    const renderHeader = (): JSX.Element => {
        return (
            <div className="mb-10">
                <h1 className="text-4xl text-white mb-3">
                    {t("nidsTitle")}
                </h1>
                <p className="text-gray-400 text-lg">
                    {t("nidsSubtitle")}
                </p>
            </div>
        );
    };

    /**
     * Renders the statistics cards grid showing key metrics.
     * 
     * @returns {JSX.Element} Grid of statistic cards
     */
    const renderStatistics = (): JSX.Element => {
        const totalFlows = kpiData?.totalFlows.toLocaleString() || "...";
        const attacksDetected = kpiData?.attacksDetected.toString() 
            || "...";
        const suspiciousFlows = kpiData?.suspiciousFlows.toString() 
            || "...";
        const accuracy = kpiData?.accuracy 
            ? `${kpiData.accuracy}%` 
            : "...";

        return (
            <div className="col-span-3 grid grid-cols-4 gap-8">
                <StatCard
                    title={t("totalFlows")}
                    value={totalFlows}
                    icon={Activity}
                    iconColor="bg-teal-500/20 text-teal-400"
                    trend={t("fromLastHour")}
                    loading={kpiLoading}
                    error={kpiError}
                />
                <StatCard
                    title={t("attacksDetected")}
                    value={attacksDetected}
                    icon={AlertTriangle}
                    iconColor="bg-red-500/20 text-red-400"
                    trend={t("criticalAttention")}
                    loading={kpiLoading}
                    error={kpiError}
                />
                <StatCard
                    title={t("suspiciousFlows")}
                    value={suspiciousFlows}
                    icon={Shield}
                    iconColor="bg-orange-500/20 text-orange-400"
                    trend={t("underInvestigation")}
                    loading={kpiLoading}
                    error={kpiError}
                />
                <StatCard
                    title={t("accuracy")}
                    value={accuracy}
                    icon={Target}
                    iconColor="bg-teal-500/20 text-teal-400"
                    trend={t("modelConfidence")}
                    loading={kpiLoading}
                    error={kpiError}
                />
            </div>
        );
    };

    return (
        <div>
            {renderHeader()}
            <div className="grid grid-cols-4 gap-8">
                {renderStatistics()}
                <div className="col-span-1 row-span-2">
                    <TrafficChart 
                        data={trafficData}
                        loading={trafficLoading}
                        error={trafficError}
                    />
                </div>
                <div className="col-span-3">
                    <AlertsTable 
                        alerts={alerts}
                        loading={alertsLoading}
                        error={alertsError}
                        onAlertClick={onNavigateToDetection} 
                    />
                </div>
            </div>
        </div>
    );
}
