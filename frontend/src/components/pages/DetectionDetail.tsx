import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";
import { Alert } from "../../types/api";
import { Badge } from "../ui/badge";

interface DetectionDetailProps {
    alertId: string;
    onBack: () => void;
}

/**
 * Mock data generator for alert details.
 * 
 * @returns {Alert[]} Array of mock alerts
 */
const getMockAlerts = (): Alert[] => {
    const baseAlerts: Alert[] = [
        {
            id: "1",
            sourceIP: "192.168.1.45",
            destIP: "10.0.0.12",
            protocol: "TCP/443",
            bytes: 2048,
            score: 0.95,
            status: "Attack",
            timestamp: "14:23:45",
        },
        {
            id: "5",
            sourceIP: "192.168.2.34",
            destIP: "10.0.0.12",
            protocol: "TCP/3389",
            bytes: 8192,
            score: 0.89,
            status: "Attack",
            timestamp: "14:23:30",
        },
        {
            id: "3",
            sourceIP: "192.168.1.89",
            destIP: "10.0.0.25",
            protocol: "TCP/22",
            bytes: 1536,
            score: 0.68,
            status: "Suspicious",
            timestamp: "14:23:38",
        },
        {
            id: "2",
            sourceIP: "172.16.0.55",
            destIP: "10.0.0.18",
            protocol: "UDP/53",
            bytes: 512,
            score: 0.23,
            status: "Normal",
            timestamp: "14:23:42",
        },
    ];

    // Generate additional mock data matching apiClient.ts
    const additionalAlerts: Alert[] = [];
    const protocols = ["TCP/80", "TCP/443", "UDP/53", "TCP/22", "TCP/3389", 
        "TCP/21", "UDP/123", "TCP/25"];
    const statuses: Alert["status"][] = ["Normal", "Normal", "Normal", 
        "Suspicious", "Attack"];
    
    // Generate timestamps in descending order (newest first)
    let currentTime = new Date();
    currentTime.setHours(14, 24, 0, 0);
    
    for (let i = 0; i < 20; i++) {
        const status = statuses[
            Math.floor(Math.random() * statuses.length)
        ];
        const score = status === "Attack" 
            ? 0.8 + Math.random() * 0.2
            : status === "Suspicious"
            ? 0.5 + Math.random() * 0.3
            : Math.random() * 0.5;
        
        // Decrement time by 5-15 seconds for each entry
        const timeDecrement = Math.floor(Math.random() * 10) + 5;
        currentTime = new Date(currentTime.getTime() - timeDecrement * 1000);
        
        const hour = currentTime.getHours();
        const minute = currentTime.getMinutes();
        const second = currentTime.getSeconds();
        
        additionalAlerts.push({
            id: `${i + 10}`,
            sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${
                Math.floor(Math.random() * 255)
            }`,
            destIP: `10.0.0.${Math.floor(Math.random() * 255)}`,
            protocol: protocols[
                Math.floor(Math.random() * protocols.length)
            ],
            bytes: Math.floor(Math.random() * 10000) + 500,
            score: parseFloat(score.toFixed(2)),
            status: status,
            timestamp: `${hour.toString().padStart(2, "0")}:${
                minute.toString().padStart(2, "0")
            }:${second.toString().padStart(2, "0")}`,
        });
    }
    
    // Combine and sort by timestamp (newest first)
    const allAlerts = [...baseAlerts, ...additionalAlerts];
    allAlerts.sort((a, b) => {
        const timeA = a.timestamp || "00:00:00";
        const timeB = b.timestamp || "00:00:00";
        return timeB.localeCompare(timeA);
    });
    
    return allAlerts;
};

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

    useEffect(() => {
        fetchAlertDetails();
    }, [alertId]);

    /**
     * Fetches alert details from the API or mock data.
     * 
     * @returns {Promise<void>}
     */
    const fetchAlertDetails = async (): Promise<void> => {
        setLoading(true);
        
        setTimeout(() => {
            const mockAlerts = getMockAlerts();
            const foundAlert = mockAlerts.find((a) => a.id === alertId);
            setAlert(foundAlert || null);
            setLoading(false);
        }, 300);
    };

    /**
     * Renders page header with back button and alert status.
     * 
     * @returns {JSX.Element} The header section
     */
    const renderHeader = (): JSX.Element => {
        if (!alert) return <></>;
        
        const isAttack = alert.status === "Attack";
        const isSuspicious = alert.status === "Suspicious";
        
        let statusBadgeClass = "bg-transparent text-gray-500 border-gray-700";
        if (isAttack) {
            statusBadgeClass = "bg-red-900/50 text-red-300 border-red-800";
        } else if (isSuspicious) {
            statusBadgeClass = "bg-orange-900/50 text-orange-300 border-orange-800";
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
     * Renders traffic metrics section.
     * 
     * @returns {JSX.Element} Traffic metrics section
     */
    const renderTrafficMetrics = (): JSX.Element => {
        if (!alert) return <></>;

        return (
            <div className="bg-gray-900 border border-gray-800 p-3">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider mb-2 pb-2 border-b border-gray-800">
                    {t("trafficMetrics")}
                </h3>
                <div className="space-y-0">
                    {renderField(t("bytesTransferred"), 
                        alert.bytes.toLocaleString())}
                    {renderField(t("packets"), "247")}
                    {renderField(t("duration"), "12.4s")}
                    {renderField(t("avgPacketSize"), "513 bytes")}
                </div>
            </div>
        );
    };

    /**
     * Renders detection analysis section.
     * 
     * @returns {JSX.Element} Detection analysis section
     */
    const renderAnalysis = (): JSX.Element => {
        if (!alert) return <></>;

        const isAttack = alert.status === "Attack";
        const isSuspicious = alert.status === "Suspicious";
        
        let scoreColor = "text-gray-400";
        if (alert.score >= 0.8) scoreColor = "text-red-400";
        else if (alert.score >= 0.5) scoreColor = "text-orange-400";

        return (
            <div className="bg-gray-900 border border-gray-800 p-3">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider mb-2 pb-2 border-b border-gray-800">
                    Detection Analysis
                </h3>
                <div className="space-y-0">
                    {renderField(t("detectionScore"), 
                        <span className={scoreColor}>
                            {alert.score.toFixed(4)}
                        </span>
                    )}
                    {renderField(t("modelVersion"), "v2.4.1")}
                    {renderField(t("confidence"), 
                        `${(alert.score * 100).toFixed(1)}%`)}
                    {renderField(t("classification"), alert.status)}
                </div>
                
                {(isAttack || isSuspicious) && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className={`w-3 h-3 mt-0.5 
                                ${isAttack ? "text-red-400" : "text-orange-400"}`} 
                            />
                            <div>
                                <p className={`text-xs mb-1 \n                                    ${isAttack ? "text-red-400" : "text-orange-400"}`}>
                                    {isAttack 
                                        ? t("attackDetected") 
                                        : t("suspiciousActivity")}
                                </p>
                                <p className="text-gray-600 text-[10px] \n                                    leading-relaxed">
                                    {isAttack
                                        ? t("attackMessage")
                                        : t("suspiciousMessage")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Renders raw packet data section.
     * 
     * @returns {JSX.Element} Packet data section
     */
    const renderPacketData = (): JSX.Element => {
        const sampleHex = 
            "45 00 00 3c 1c 46 40 00 40 06 b1 e6 ac 10 0a 63\n" +
            "ac 10 0a 0c 00 50 e1 5c 7e 6e 4f 3e 00 00 00 00\n" +
            "a0 02 72 10 2e 7d 00 00 02 04 05 b4 04 02 08 0a\n" +
            "0d 5e 4e 2e 00 00 00 00 01 03 03 07";

        return (
            <div className="bg-gray-900 border border-gray-800 p-3">
                <h3 className="text-[11px] text-gray-500 uppercase \n                    tracking-wider mb-2 pb-2 border-b border-gray-800">
                    {t("packetDataSample")}
                </h3>
                <div className="bg-black border border-gray-800 p-2 
                    overflow-x-auto">
                    <pre className="text-gray-500 text-[10px] font-mono 
                        leading-relaxed">
                        {sampleHex}
                    </pre>
                </div>
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
                <p className="text-gray-600 text-xs">{t("alertNotFound")}</p>
            </div>
        );
    }

    return (
        <div>
            {renderHeader()}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                    {renderNetworkInfo()}
                    {renderTrafficMetrics()}
                </div>
                <div className="space-y-3">
                    {renderAnalysis()}
                    {renderPacketData()}
                </div>
            </div>
        </div>
    );
}