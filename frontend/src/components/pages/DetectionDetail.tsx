import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";
import { Alert } from "../../types/api";
import { Badge } from "../ui/badge";
import { fetchAlertDetail } from "../../utils/apiClient";

interface DetectionDetailProps {
    alertId: string;
    onBack: () => void;
}

/**
 * Displays detailed information about a specific security alert.
 * Shows packet details, flow information, and analysis results.
 * 
 * @param {DetectionDetailProps} props - Component properties
 * @param {string} props.alertId - The ID of the alert to display
 * @param {Function} props.onBack - Callback to navigate back
 * @returns {JSX.Element} The detection details page
 */
export function DetectionDetail({ 
    alertId, 
    onBack 
}: DetectionDetailProps) {
    const { t } = useLanguage();
    const [alert, setAlert] = useState<Alert | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAlertDetails();
    }, [alertId]);

    /**
     * Fetches alert details from the API.
     * 
     * @returns {Promise<void>}
     */
    const fetchAlertDetails = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchAlertDetail(alertId);
            setAlert(data);
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : "Failed to load flow log details";
            setAlert(null);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Renders page header with back button and alert status.
     * 
     * @returns {JSX.Element} The header section
     */
    const renderHeader = (): JSX.Element => {
        if (!alert) return <></>;
        
        const isAttack = alert.status === "Attack";
        
        let statusBadgeClass = "bg-transparent text-gray-500 border-gray-700";
        if (isAttack) {
            statusBadgeClass = "bg-red-900/50 text-red-300 border-red-800";
        }

        return (
            <div className="mb-4 pb-3 border-b border-gray-800">
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-400 mb-3 
                        flex items-center gap-2 text-xs"
                >
                    <ArrowLeft className="w-3 h-3" />
                    {t("backToDashboard")}
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg text-white mb-1">
                            {t("alertDetails")}
                        </h1>
                        <p className="text-gray-600 text-[10px] font-mono">
                            ID: {alert.id}
                        </p>
                    </div>
                    <Badge className={statusBadgeClass}>
                        {alert.status}
                    </Badge>
                </div>
            </div>
        );
    };

    /**
     * Renders a data field row with label and value.
     * 
     * @param {string} label - Field label
     * @param {string | number} value - Field value
     * @param {boolean} mono - Use monospace font
     * @returns {JSX.Element} Field row component
     */
    const renderField = (
        label: string,
        value: string | number | JSX.Element,
        mono: boolean = false
    ): JSX.Element => {
        return (
            <div className="flex items-center justify-between py-1.5 
                border-b border-gray-800">
                <span className="text-gray-600 text-[10px] uppercase">
                    {label}
                </span>
                {typeof value === "string" || typeof value === "number" ? (
                    <span className={`text-gray-300 text-xs 
                        ${mono ? "font-mono" : ""}`}>
                        {value}
                    </span>
                ) : (
                    value
                )}
            </div>
        );
    };

    /**
     * Renders network information section.
     * 
     * @returns {JSX.Element} Network info section
     */
    const renderNetworkInfo = (): JSX.Element => {
        if (!alert) return <></>;

        return (
            <div className="bg-gray-900 border border-gray-800 p-3">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider mb-2 pb-2 border-b border-gray-800">
                    {t("networkInformation")}
                </h3>
                <div className="space-y-0">
                    {renderField(t("sourceIP"), alert.sourceIP, true)}
                    {renderField(t("destinationIP"), alert.destIP, true)}
                    {renderField(t("protocol"), alert.protocol.split("/")[0])}
                    {renderField(t("port"), alert.protocol.split("/")[1])}
                    {renderField(t("timestamp"), alert.timestamp || "N/A", true)}
                </div>
            </div>
        );
    };

    /**
     * Renders detection analysis section.
     * 
     * @returns {JSX.Element} Detection analysis section
     */
    const renderAIScore = (): JSX.Element => {
        if (!alert) return <></>;

        const isAttack = alert.status === "Attack";
        
        let scoreColor = "text-teal-400";
        const alertScore = alert.score ?? 0;
        if (alertScore >= 0.8) scoreColor = "text-red-400";

        return (
            <div className="bg-gray-900 border border-gray-800 p-3">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider mb-2 pb-2 border-b border-gray-800">
                    AI Score
                </h3>
                <div className="border border-gray-800 bg-black/40 p-4 mb-3">
                    <p className="text-[10px] text-gray-600 uppercase mb-1">
                        Risk Score
                    </p>
                    <p className={`text-3xl font-mono ${scoreColor}`}>
                        {alertScore.toFixed(4)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2">
                        Confidence {(alertScore * 100).toFixed(1)}%
                    </p>
                </div>
                <div className="space-y-0">
                    {renderField(t("classification"), alert.status)}
                    {renderField(t("modelVersion"), "v2.4.1")}
                    {renderField(t("inBytes"),
                        alert.inBytes.toLocaleString())}
                    {renderField(t("outBytes"),
                        alert.outBytes.toLocaleString())}
                </div>
                
                {isAttack && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className={`w-3 h-3 mt-0.5 
                                ${isAttack ? "text-red-400" : "text-gray-500"}`} 
                            />
                            <div>
                                <p className="text-xs mb-1 text-red-400">
                                    {t("attackDetected")}
                                </p>
                                <p className="text-gray-600 text-[10px] \n                                    leading-relaxed">
                                    {t("attackMessage")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-600 text-xs">{t("loadingAlertDetails")}</p>
            </div>
        );
    }

    if (!alert) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-600 text-xs">
                    {error || t("alertNotFound")}
                </p>
            </div>
        );
    }

    return (
        <div>
            {renderHeader()}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                    {renderNetworkInfo()}
                </div>
                <div className="space-y-3">
                    {renderAIScore()}
                </div>
            </div>
        </div>
    );
}
