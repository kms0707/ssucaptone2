import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { useLanguage } from "../utils/LanguageContext";
import { Alert } from "../types/api";
import { Loader2, AlertCircle, Inbox, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface AlertsTableProps {
    alerts: Alert[];
    loading: boolean;
    error: string | null;
    onAlertClick?: (alertId: string) => void;
    isMonitoring?: boolean;
}

/**
 * Returns a styled badge component for the given alert status.
 * 
 * @param {Alert["status"]} status - The alert status type
 * @param {Function} t - Translation function
 * @returns {JSX.Element} A colored badge component
 */
const getStatusBadge = (
    status: Alert["status"],
    t: (key: string) => string
): JSX.Element => {
    const badgeClass = 
        "bg-red-900/60 text-red-200 border-red-800 rounded-none text-[9px] px-1.5 py-0";
    const suspiciousClass = 
        "bg-orange-900/60 text-orange-200 border-orange-800 rounded-none text-[9px] px-1.5 py-0";
    const normalClass = 
        "bg-transparent text-gray-500 border-gray-700 rounded-none text-[9px] px-1.5 py-0";

    switch (status) {
        case "Attack":
            return <Badge className={badgeClass}>{t("attack")}</Badge>;
        case "Suspicious":
            return <Badge className={suspiciousClass}>
                {t("suspicious")}
            </Badge>;
        case "Normal":
            return <Badge className={normalClass}>{t("normal")}</Badge>;
    }
};

/**
 * Real-time alerts table displaying network flow anomalies.
 * Shows source/destination IPs, protocols, bytes, scores, and status.
 * 
 * @param {AlertsTableProps} props - Component properties
 * @param {Alert[]} props.alerts - Array of alert data
 * @param {boolean} props.loading - Loading state indicator
 * @param {string | null} props.error - Error message if any
 * @param {Function} [props.onAlertClick] - Callback for alert clicks
 * @returns {JSX.Element} The alerts table component
 */
export function AlertsTable({ 
    alerts, 
    loading, 
    error, 
    onAlertClick,
    isMonitoring
}: AlertsTableProps) {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "Attack" | "Suspicious" | "Normal"
    >("all");

    const filteredAlerts = useMemo(() => {
        let filtered = alerts;
        
        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (alert) => alert.status === statusFilter
            );
        }
        
        if (searchTerm) {
            filtered = filtered.filter((alert) =>
                alert.sourceIP.includes(searchTerm) ||
                alert.destIP.includes(searchTerm) ||
                alert.protocol.includes(searchTerm)
            );
        }
        
        return filtered;
    }, [searchTerm, statusFilter, alerts]);

    /**
     * Renders the table header with title and live indicator.
     * 
     * @returns {JSX.Element} The table header section
     */
    const renderTableHeader = (): JSX.Element => {
        const indicatorColor = isMonitoring 
            ? "bg-green-500" 
            : "bg-red-500";
        const statusText = isMonitoring ? t("live") : "STOP";
        
        return (
            <div className="flex items-center justify-between mb-2 pb-2 
                border-b border-gray-800">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider">
                    {t("realTimeAlerts")}
                </h3>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 ${indicatorColor}`} />
                    <span className="text-gray-600 text-[10px]">
                        {statusText}
                    </span>
                </div>
            </div>
        );
    };

    /**
     * Handles click events on alert table rows.
     * 
     * @param {string} alertId - The ID of the clicked alert
     * @returns {void}
     */
    const handleRowClick = (alertId: string): void => {
        if (onAlertClick) {
            onAlertClick(alertId);
        }
    };

    /**
     * Renders a loading state with spinner.
     * 
     * @returns {JSX.Element} Loading state component
     */
    const renderLoadingState = (): JSX.Element => {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-teal-400 
                        animate-spin mx-auto mb-4" 
                    />
                    <p className="text-gray-400">{t("loadingAlerts")}</p>
                </div>
            </div>
        );
    };

    /**
     * Renders an error state with message.
     * 
     * @returns {JSX.Element} Error state component
     */
    const renderErrorState = (): JSX.Element => {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 
                        mx-auto mb-4" 
                    />
                    <p className="text-gray-400 mb-2">
                        {t("errorLoadingAlerts")}
                    </p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    };

    /**
     * Renders an empty state when no alerts exist.
     * 
     * @returns {JSX.Element} Empty state component
     */
    const renderEmptyState = (): JSX.Element => {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Inbox className="w-8 h-8 text-gray-500 
                        mx-auto mb-4" 
                    />
                    <p className="text-gray-400">{t("noAlertsFound")}</p>
                </div>
            </div>
        );
    };

    /**
     * Renders a single alert table row.
     * 
     * @param {Alert} alert - The alert data object
     * @returns {JSX.Element} A table row component
     */
    const renderAlertRow = (alert: Alert): JSX.Element => {
        const isClickable = !!onAlertClick;
        const rowClass = isClickable
            ? "border-gray-800 hover:bg-gray-800/30 cursor-pointer"
            : "border-gray-800";

        return (
            <TableRow
                key={alert.id}
                className={rowClass}
                onClick={() => handleRowClick(alert.id)}
            >
                <TableCell className="text-gray-500 font-mono text-[10px] 
                    py-0.5 px-2">
                    {alert.timestamp || "N/A"}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-[10px] 
                    py-0.5 px-2">
                    {alert.sourceIP}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-[10px] 
                    py-0.5 px-2">
                    {alert.destIP}
                </TableCell>
                <TableCell className="text-gray-500 text-[10px] py-0.5 
                    px-2">
                    {alert.protocol}
                </TableCell>
                <TableCell className="text-gray-500 text-[10px] py-0.5 
                    px-2">
                    {alert.bytes.toLocaleString()}
                </TableCell>
                <TableCell className="py-0.5 px-2">
                    {getStatusBadge(alert.status, t)}
                </TableCell>
            </TableRow>
        );
    };

    /**
     * Renders the complete alerts table with all rows.
     * 
     * @returns {JSX.Element} The table component
     */
    const renderTable = (): JSX.Element => {
        return (
            <div className="border border-gray-800">
                <div className="max-h-[650px] overflow-y-auto 
                    scrollbar-thin scrollbar-track-gray-900 
                    scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
                    <Table>
                        <TableHeader className="sticky top-0 z-10">
                            <TableRow className="bg-gray-900 
                                border-gray-800 hover:bg-gray-900">
                                <TableHead className="text-gray-600 
                                    text-[10px] font-normal py-2 px-3">
                                    {t("time")}
                                </TableHead>
                                <TableHead className="text-gray-600 
                                    text-[10px] font-normal py-2 px-3">
                                    {t("sourceIP")}
                                </TableHead>
                                <TableHead className="text-gray-600 
                                    text-[10px] font-normal py-2 px-3">
                                    {t("destinationIP")}
                                </TableHead>
                                <TableHead className="text-gray-600 
                                    text-[10px] font-normal py-2 px-3">
                                    {t("protocolPort")}
                                </TableHead>
                                <TableHead className="text-gray-600 
                                    text-[10px] font-normal py-2 px-3">
                                    {t("bytes")}
                                </TableHead>
                                <TableHead className="text-gray-600 
                                    text-[10px] font-normal py-2 px-3">
                                    {t("status")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAlerts.map((alert) => 
                                renderAlertRow(alert)
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    /**
     * Renders the appropriate content based on state.
     * 
     * @returns {JSX.Element} Content for current state
     */
    const renderContent = (): JSX.Element => {
        if (loading) {
            return renderLoadingState();
        }

        if (error) {
            return renderErrorState();
        }

        if (filteredAlerts.length === 0) {
            return renderEmptyState();
        }

        return renderTable();
    };

    return (
        <div className="bg-gray-900 border border-gray-800 p-3">
            {renderTableHeader()}
            <div className="space-y-2 mb-3 mt-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 
                        text-gray-500" 
                    />
                    <Input
                        type="text"
                        placeholder={t("searchAlerts")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-7 bg-gray-800 border-gray-700 
                            text-gray-300 placeholder:text-gray-600 
                            text-[10px] focus:border-teal-500 rounded-none"
                    />
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className={`h-6 px-2.5 text-[9px] rounded-none ${
                            statusFilter === "all"
                                ? "bg-gray-700 text-gray-300 border-gray-600"
                                : "bg-transparent text-gray-500 border-gray-700 hover:bg-gray-800"
                        } border`}
                    >
                        {t("all")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter("Attack")}
                        className={`h-6 px-2.5 text-[9px] rounded-none ${
                            statusFilter === "Attack"
                                ? "bg-red-900/50 text-red-300 border-red-800"
                                : "bg-transparent text-gray-500 border-gray-700 hover:bg-gray-800"
                        } border`}
                    >
                        {t("attack")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter("Suspicious")}
                        className={`h-6 px-2.5 text-[9px] rounded-none ${
                            statusFilter === "Suspicious"
                                ? "bg-orange-900/50 text-orange-300 border-orange-800"
                                : "bg-transparent text-gray-500 border-gray-700 hover:bg-gray-800"
                        } border`}
                    >
                        {t("suspicious")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter("Normal")}
                        className={`h-6 px-2.5 text-[9px] rounded-none ${
                            statusFilter === "Normal"
                                ? "bg-gray-700 text-gray-300 border-gray-600"
                                : "bg-transparent text-gray-500 border-gray-700 hover:bg-gray-800"
                        } border`}
                    >
                        {t("normal")}
                    </Button>
                </div>
            </div>
            {renderContent()}
        </div>
    );
}