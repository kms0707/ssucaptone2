import { useState, useRef } from "react";
import {
    Folder,
    Trash2,
    Download,
    Upload,
    FolderOpen,
    Tag,
} from "lucide-react";
import { useLanguage } from "../utils/LanguageContext";
import {
    getAllSessions,
    deleteSession,
    exportSessions,
    importSessions,
    SessionData,
} from "../utils/sessionManager";

interface SessionManagementSectionProps {
    onLoadSession?: (session: SessionData) => void;
}

/**
 * Session Management section for Settings page.
 * Lists saved sessions with load, delete, and export capabilities.
 * 
 * @param {SessionManagementSectionProps} props - Component properties
 * @returns {JSX.Element} The session management section
 */
export function SessionManagementSection({
    onLoadSession,
}: SessionManagementSectionProps): JSX.Element {
    const { t, language } = useLanguage();
    const [sessions, setSessions] = useState<SessionData[]>(
        getAllSessions()
    );
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Refreshes the session list from localStorage.
     * 
     * @returns {void}
     */
    const refreshSessions = (): void => {
        setSessions(getAllSessions());
    };

    /**
     * Handles deleting a session.
     * 
     * @param {string} id - The session ID
     * @returns {void}
     */
    const handleDelete = (id: string): void => {
        if (confirm(t("deleteConfirm"))) {
            deleteSession(id);
            refreshSessions();
            alert(t("sessionDeleted"));
        }
    };

    /**
     * Handles exporting selected sessions.
     * 
     * @returns {void}
     */
    const handleExport = (): void => {
        if (selectedSessions.length === 0) {
            alert("Please select sessions to export");
            return;
        }
        exportSessions(selectedSessions);
        alert(t("sessionExported"));
    };

    /**
     * Handles exporting all sessions.
     * 
     * @returns {void}
     */
    const handleExportAll = (): void => {
        const allIds = sessions.map((s) => s.id);
        exportSessions(allIds);
        alert(t("sessionExported"));
    };

    /**
     * Handles importing sessions from a file.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input event
     * @returns {Promise<void>}
     */
    const handleImport = async (
        e: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;

        const success = await importSessions(file);
        if (success) {
            refreshSessions();
            alert(t("sessionImported"));
        } else {
            alert("Failed to import sessions");
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /**
     * Toggles session selection.
     * 
     * @param {string} id - The session ID
     * @returns {void}
     */
    const toggleSelection = (id: string): void => {
        setSelectedSessions((prev) =>
            prev.includes(id)
                ? prev.filter((sid) => sid !== id)
                : [...prev, id]
        );
    };

    /**
     * Formats a date string.
     * 
     * @param {string} dateStr - ISO date string
     * @returns {string} Formatted date
     */
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleString(
            language === "ko" ? "ko-KR" : "en-US",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    return (
        <div className="bg-gray-900 border border-gray-800 p-3">
            <div className="flex items-center justify-between mb-3 
                pb-2 border-b border-gray-800">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider">
                    {t("sessionManagement")}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        disabled={selectedSessions.length === 0}
                        className="bg-gray-800 border border-gray-700 
                            px-2 py-1 text-gray-400 hover:text-gray-300 
                            hover:bg-gray-700 transition-colors text-xs 
                            flex items-center gap-1.5 
                            disabled:opacity-40 disabled:cursor-not-allowed"
                        title={t("exportSession")}
                    >
                        <Download className="w-3 h-3" />
                        {t("exportSession")}
                    </button>
                    <button
                        onClick={handleExportAll}
                        disabled={sessions.length === 0}
                        className="bg-gray-800 border border-gray-700 
                            px-2 py-1 text-gray-400 hover:text-gray-300 
                            hover:bg-gray-700 transition-colors text-xs 
                            flex items-center gap-1.5 
                            disabled:opacity-40 disabled:cursor-not-allowed"
                        title={t("exportAll")}
                    >
                        <Download className="w-3 h-3" />
                        {t("exportAll")}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-800 border border-gray-700 
                            px-2 py-1 text-gray-400 hover:text-gray-300 
                            hover:bg-gray-700 transition-colors text-xs 
                            flex items-center gap-1.5"
                        title={t("importSession")}
                    >
                        <Upload className="w-3 h-3" />
                        {t("importSession")}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-6">
                    <FolderOpen className="w-8 h-8 text-gray-700 
                        mx-auto mb-2" />
                    <p className="text-gray-600 text-xs">
                        {t("noSavedSessions")}
                    </p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-black border border-gray-800 
                                p-2.5"
                        >
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedSessions.includes(
                                        session.id
                                    )}
                                    onChange={() => toggleSelection(session.id)}
                                    className="mt-0.5 accent-teal-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start 
                                        justify-between gap-2 mb-1">
                                        <h4 className="text-xs text-white 
                                            font-medium truncate">
                                            <Folder className="w-3 h-3 
                                                inline mr-1.5 
                                                text-teal-500" />
                                            {session.name}
                                        </h4>
                                        <span className="text-[10px] 
                                            text-gray-600 font-mono 
                                            whitespace-nowrap">
                                            {formatDate(session.createdAt)}
                                        </span>
                                    </div>

                                    {session.description && (
                                        <p className="text-[10px] 
                                            text-gray-500 mb-1.5">
                                            {session.description}
                                        </p>
                                    )}

                                    {session.tags.length > 0 && (
                                        <div className="flex flex-wrap 
                                            gap-1 mb-1.5">
                                            {session.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-gray-800 
                                                        border border-gray-700 
                                                        px-1.5 py-0.5 
                                                        text-[9px] 
                                                        text-gray-500 
                                                        flex items-center 
                                                        gap-0.5"
                                                >
                                                    <Tag className="w-2 h-2" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 
                                        text-[10px] text-gray-600 mb-2">
                                        <span>
                                            {t("alertsCount")}:{" "}
                                            <span className="text-gray-400">
                                                {session.totalAlerts}
                                            </span>
                                        </span>
                                        <span className="text-gray-800">|</span>
                                        <span>
                                            {t("attack")}:{" "}
                                            <span className={
                                                session.attackCount > 0
                                                    ? "text-red-400"
                                                    : "text-gray-400"
                                            }>
                                                {session.attackCount}
                                            </span>
                                        </span>
                                        <span className="text-gray-800">|</span>
                                        <span>
                                            {t("suspicious")}:{" "}
                                            <span className={
                                                session.suspiciousCount > 0
                                                    ? "text-orange-400"
                                                    : "text-gray-400"
                                            }>
                                                {session.suspiciousCount}
                                            </span>
                                        </span>
                                        <span className="text-gray-800">|</span>
                                        <span>
                                            {t("normal")}:{" "}
                                            <span className="text-gray-400">
                                                {session.normalCount}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => {
                                                if (onLoadSession) {
                                                    onLoadSession(session);
                                                }
                                            }}
                                            className="flex-1 bg-gray-800 
                                                border border-gray-700 
                                                px-2 py-1 text-gray-400 
                                                hover:text-gray-300 
                                                hover:bg-gray-700 
                                                transition-colors text-xs"
                                        >
                                            {t("loadSession")}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(session.id)}
                                            className="bg-gray-800 border 
                                                border-gray-700 px-2 py-1 
                                                text-red-400 hover:text-red-300 
                                                hover:bg-red-900/20 
                                                transition-colors"
                                            title={t("deleteSession")}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}