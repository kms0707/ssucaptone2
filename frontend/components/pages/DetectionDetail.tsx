import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import {
    AlertTriangle,
    Clock,
    Network,
    Shield,
    Activity,
    Ban,
    Eye,
    FileText,
} from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";

interface DetectionDetailProps {
    alertId: string | null;
}

interface DetectionData {
    detectionTime: string;
    sourceIP: string;
    destIP: string;
    attackType: string;
    riskLevel: string;
    anomalyScore: number;
    protocol: string;
    bytes: number;
}

interface TimelineDataPoint {
    time: string;
    bytes: number;
    packets: number;
    anomalyScore: number;
}

interface FlowLog {
    id: string;
    timestamp: string;
    sourcePort: string;
    destPort: string;
    flags: string;
    bytes: number;
    packets: number;
    action: string;
}

// Mock detection database
const DETECTION_DATABASE: Record<string, DetectionData> = {
    "1": {
        detectionTime: "Feb 2, 2026 14:23:45",
        sourceIP: "192.168.1.45",
        destIP: "10.0.0.12",
        attackType: "sqlInjection",
        riskLevel: "critical",
        anomalyScore: 0.95,
        protocol: "TCP/443",
        bytes: 2048,
    },
    "5": {
        detectionTime: "Feb 2, 2026 14:23:30",
        sourceIP: "192.168.2.34",
        destIP: "10.0.0.12",
        attackType: "bruteForce",
        riskLevel: "high",
        anomalyScore: 0.89,
        protocol: "TCP/3389",
        bytes: 8192,
    },
    "3": {
        detectionTime: "Feb 2, 2026 14:23:38",
        sourceIP: "192.168.1.89",
        destIP: "10.0.0.25",
        attackType: "unauthorizedSSH",
        riskLevel: "medium",
        anomalyScore: 0.68,
        protocol: "TCP/22",
        bytes: 1536,
    },
};

// Timeline data showing traffic patterns
const TIMELINE_DATA: TimelineDataPoint[] = [
    { time: "14:20", bytes: 245, packets: 12, anomalyScore: 0.05 },
    { time: "14:21", bytes: 312, packets: 15, anomalyScore: 0.08 },
    { time: "14:22", bytes: 289, packets: 14, anomalyScore: 0.06 },
    { time: "14:23", bytes: 1850, packets: 98, anomalyScore: 0.52 },
    { time: "14:24", bytes: 2048, packets: 125, anomalyScore: 0.95 },
    { time: "14:25", bytes: 1920, packets: 110, anomalyScore: 0.88 },
    { time: "14:26", bytes: 450, packets: 22, anomalyScore: 0.15 },
    { time: "14:27", bytes: 280, packets: 13, anomalyScore: 0.07 },
];

// Detailed flow logs for the detected threat
const FLOW_LOGS: FlowLog[] = [
    {
        id: "1",
        timestamp: "14:23:45.123",
        sourcePort: "49152",
        destPort: "443",
        flags: "SYN, ACK",
        bytes: 512,
        packets: 8,
        action: "Logged",
    },
    {
        id: "2",
        timestamp: "14:23:45.234",
        sourcePort: "49152",
        destPort: "443",
        flags: "PSH, ACK",
        bytes: 1024,
        packets: 16,
        action: "Logged",
    },
    {
        id: "3",
        timestamp: "14:23:45.345",
        sourcePort: "49152",
        destPort: "443",
        flags: "PSH, ACK",
        bytes: 512,
        packets: 8,
        action: "Blocked",
    },
    {
        id: "4",
        timestamp: "14:23:45.456",
        sourcePort: "49153",
        destPort: "443",
        flags: "SYN",
        bytes: 64,
        packets: 1,
        action: "Blocked",
    },
    {
        id: "5",
        timestamp: "14:23:45.567",
        sourcePort: "49153",
        destPort: "443",
        flags: "SYN",
        bytes: 64,
        packets: 1,
        action: "Blocked",
    },
];

/**
 * Retrieves detection data for a specific alert ID.
 * 
 * @param {string | null} alertId - The alert identifier to look up
 * @returns {DetectionData} The detection information
 */
const getDetectionData = (alertId: string | null): DetectionData => {
    const defaultId = "1";
    const id = alertId || defaultId;
    return DETECTION_DATABASE[id] || DETECTION_DATABASE[defaultId];
};

/**
 * Returns a styled badge based on the risk level.
 * 
 * @param {string} risk - The risk level string
 * @param {Function} t - Translation function
 * @returns {JSX.Element} A colored badge component
 */
const getRiskBadge = (risk: string, t: Function): JSX.Element => {
    const baseClass = "text-base px-3 py-1";
    const criticalClass = 
        `${baseClass} bg-red-500/20 text-red-400 border-red-500/30`;
    const highClass = 
        `${baseClass} bg-orange-500/20 text-orange-400 border-orange-500/30`;
    const mediumClass = 
        `${baseClass} bg-yellow-500/20 text-yellow-400 border-yellow-500/30`;
    const defaultClass = 
        `${baseClass} bg-teal-500/20 text-teal-400 border-teal-500/30`;

    switch (risk) {
        case "Critical":
            return <Badge className={criticalClass}>{t(risk)}</Badge>;
        case "High":
            return <Badge className={highClass}>{t(risk)}</Badge>;
        case "Medium":
            return <Badge className={mediumClass}>{t(risk)}</Badge>;
        default:
            return <Badge className={defaultClass}>{t(risk)}</Badge>;
    }
};

/**
 * Detailed threat analysis page for individual security detections.
 * Shows comprehensive information, timeline charts, and flow logs.
 * 
 * @param {DetectionDetailProps} props - Component properties
 * @param {string | null} props.alertId - The alert ID to display
 * @returns {JSX.Element} The detection detail page
 */
export function DetectionDetail({ alertId }: DetectionDetailProps) {
    const detection = getDetectionData(alertId);
    const { t } = useLanguage();

    /**
     * Renders the page header section.
     * 
     * @returns {JSX.Element} The header with title and description
     */
    const renderHeader = (): JSX.Element => {
        return (
            <div className="mb-10">
                <h1 className="text-4xl text-white mb-3">
                    {t("detectionDetailTitle")}
                </h1>
                <p className="text-gray-400 text-lg">
                    {t("detectionDetailSubtitle")}
                </p>
            </div>
        );
    };

    /**
     * Renders action buttons for threat response.
     * 
     * @returns {JSX.Element} Action button group
     */
    const renderActionButtons = (): JSX.Element => {
        return (
            <div className="flex gap-3">
                <Button className="bg-red-600 hover:bg-red-700 
                    text-white">
                    <Ban className="w-4 h-4 mr-2" />
                    {t("blockIP")}
                </Button>
                <Button variant="outline" className="border-gray-600 
                    text-gray-300 hover:bg-gray-700">
                    <Eye className="w-4 h-4 mr-2" />
                    {t("monitor")}
                </Button>
                <Button variant="outline" className="border-gray-600 
                    text-gray-300 hover:bg-gray-700">
                    <FileText className="w-4 h-4 mr-2" />
                    {t("addToInvestigation")}
                </Button>
            </div>
        );
    };

    /**
     * Renders the summary card header with attack info and actions.
     * 
     * @returns {JSX.Element} Summary card header section
     */
    const renderSummaryHeader = (): JSX.Element => {
        return (
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-2xl text-white mb-2">
                        {t(detection.attackType)}
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 
                            text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{detection.detectionTime}</span>
                        </div>
                        {getRiskBadge(detection.riskLevel, t)}
                    </div>
                </div>
                {renderActionButtons()}
            </div>
        );
    };

    /**
     * Renders a single detail field in the summary grid.
     * 
     * @param {React.ComponentType} Icon - The icon component
     * @param {string} label - The field label
     * @param {string} value - The field value
     * @param {string} className - Optional value styling
     * @returns {JSX.Element} A detail field component
     */
    const renderDetailField = (
        Icon: React.ComponentType<{ className?: string }>,
        label: string,
        value: string,
        className: string = "text-white text-lg"
    ): JSX.Element => {
        return (
            <div className="col-span-1">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-400 text-sm">{label}</p>
                </div>
                <p className={className}>{value}</p>
            </div>
        );
    };

    /**
     * Renders the anomaly score field with progress bar.
     * 
     * @returns {JSX.Element} Anomaly score visualization
     */
    const renderAnomalyScore = (): JSX.Element => {
        const scorePercentage = detection.anomalyScore * 100;
        
        return (
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-400 text-sm">
                        {t("anomalyScore")}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-white text-lg">
                        {detection.anomalyScore.toFixed(2)}
                    </p>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-red-500 h-2 rounded-full 
                                transition-all"
                            style={{ width: `${scorePercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the summary card with detection details.
     * 
     * @returns {JSX.Element} The summary card component
     */
    const renderSummaryCard = (): JSX.Element => {
        return (
            <Card className="bg-gray-800 border-gray-700 p-8 mb-8">
                {renderSummaryHeader()}
                <div className="grid grid-cols-6 gap-6">
                    {renderDetailField(
                        Network,
                        t("sourceIP"),
                        detection.sourceIP,
                        "text-white text-lg font-mono"
                    )}
                    {renderDetailField(
                        Network,
                        t("destinationIP"),
                        detection.destIP,
                        "text-white text-lg font-mono"
                    )}
                    {renderDetailField(
                        Shield,
                        t("protocol"),
                        detection.protocol
                    )}
                    {renderDetailField(
                        Activity,
                        t("totalBytes"),
                        detection.bytes.toLocaleString()
                    )}
                    {renderAnomalyScore()}
                </div>
            </Card>
        );
    };

    /**
     * Renders the traffic timeline chart with dual axes.
     * 
     * @returns {JSX.Element} Timeline chart component
     */
    const renderTimelineChart = (): JSX.Element => {
        return (
            <Card className="bg-gray-800 border-gray-700 p-8 mb-8">
                <h3 className="text-xl text-white mb-6">
                    {t("trafficTimeline")}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={TIMELINE_DATA}>
                        <defs>
                            <linearGradient 
                                id="colorBytes" 
                                x1="0" 
                                y1="0" 
                                x2="0" 
                                y2="1"
                            >
                                <stop 
                                    offset="5%" 
                                    stopColor="#14b8a6" 
                                    stopOpacity={0.3} 
                                />
                                <stop 
                                    offset="95%" 
                                    stopColor="#14b8a6" 
                                    stopOpacity={0} 
                                />
                            </linearGradient>
                            <linearGradient 
                                id="colorScore" 
                                x1="0" 
                                y1="0" 
                                x2="0" 
                                y2="1"
                            >
                                <stop 
                                    offset="5%" 
                                    stopColor="#ef4444" 
                                    stopOpacity={0.3} 
                                />
                                <stop 
                                    offset="95%" 
                                    stopColor="#ef4444" 
                                    stopOpacity={0} 
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#374151" 
                        />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis yAxisId="left" stroke="#14b8a6" />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            stroke="#ef4444" 
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                        />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="bytes"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorBytes)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="anomalyScore"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: "#ef4444", r: 4 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-8 
                    mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-teal-500 rounded" />
                        <span className="text-gray-400">
                            {t("bytesTransferred")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <span className="text-gray-400">
                            {t("anomalyScore")}
                        </span>
                    </div>
                </div>
            </Card>
        );
    };

    /**
     * Renders a single flow log table row.
     * 
     * @param {FlowLog} log - The flow log entry
     * @returns {JSX.Element} A table row component
     */
    const renderFlowLogRow = (log: FlowLog): JSX.Element => {
        const actionBadge = log.action === "Blocked"
            ? <Badge className="bg-red-500/20 text-red-400 
                border-red-500/30">{t("blocked")}</Badge>
            : <Badge className="bg-teal-500/20 text-teal-400 
                border-teal-500/30">{t("logged")}</Badge>;

        return (
            <TableRow 
                key={log.id} 
                className="border-gray-700 hover:bg-gray-750"
            >
                <TableCell className="text-gray-300 font-mono">
                    {log.timestamp}
                </TableCell>
                <TableCell className="text-gray-300 font-mono">
                    {log.sourcePort}
                </TableCell>
                <TableCell className="text-gray-300 font-mono">
                    {log.destPort}
                </TableCell>
                <TableCell className="text-gray-300">
                    {log.flags}
                </TableCell>
                <TableCell className="text-gray-300">
                    {log.bytes}
                </TableCell>
                <TableCell className="text-gray-300">
                    {log.packets}
                </TableCell>
                <TableCell>{actionBadge}</TableCell>
            </TableRow>
        );
    };

    /**
     * Renders the detailed flow log table.
     * 
     * @returns {JSX.Element} Flow log table component
     */
    const renderFlowLogTable = (): JSX.Element => {
        return (
            <Card className="bg-gray-800 border-gray-700 p-8">
                <h3 className="text-xl text-white mb-6">
                    {t("detailedFlowLog")}
                </h3>
                <div className="rounded-lg overflow-hidden border 
                    border-gray-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-900 
                                border-gray-700 hover:bg-gray-900">
                                <TableHead className="text-gray-400">
                                    {t("timestamp")}
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    {t("sourcePort")}
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    {t("destPort")}
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    {t("flags")}
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    {t("bytes")}
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    {t("packets")}
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    {t("action")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {FLOW_LOGS.map((log) => renderFlowLogRow(log))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        );
    };

    return (
        <div>
            {renderHeader()}
            {renderSummaryCard()}
            {renderTimelineChart()}
            {renderFlowLogTable()}
        </div>
    );
}