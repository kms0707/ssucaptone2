import { useEffect, useState } from "react";
import { Copy, Check, Eye, EyeOff, RotateCw } from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";
import { fetchProjects, reissueProjectApiKey } from "../../utils/apiClient";
import { Project } from "../../types/api";

interface SettingsProps {}

/**
 * Simplified settings page with API key and language preference only.
 *
 * @param {SettingsProps} props - Component properties
 * @returns {JSX.Element} The settings page layout
 */
export function Settings({}: SettingsProps) {
    const { t, language, setLanguage } = useLanguage();
    const [project, setProject] = useState<Project | null>(null);
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [loadingKey, setLoadingKey] = useState(true);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const activeProjectId = localStorage.getItem("active_project_id");

    const loadActiveProject = async (): Promise<void> => {
        if (!activeProjectId) {
            setProject(null);
            setLoadingKey(false);
            return;
        }

        try {
            setLoadingKey(true);
            setApiKeyError(null);
            const projects = await fetchProjects();
            localStorage.setItem("projects", JSON.stringify(projects));

            const activeProject = projects.find(
                (item) => item.id === parseInt(activeProjectId, 10)
            );

            setProject(activeProject || null);
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : "Failed to load API key";
            setApiKeyError(message);
            setProject(null);
        } finally {
            setLoadingKey(false);
        }
    };

    useEffect(() => {
        loadActiveProject();
    }, [activeProjectId]);

    const handleCopyKey = async (): Promise<void> => {
        if (project?.apiKey) {
            await navigator.clipboard.writeText(project.apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLanguageToggle = (): void => {
        setLanguage(language === "en" ? "ko" : "en");
    };

    const handleRegenerateKey = async (): Promise<void> => {
        if (!project) return;

        try {
            setIsRegenerating(true);
            setApiKeyError(null);
            const updatedProject = await reissueProjectApiKey(project.id);
            setProject(updatedProject);

            const storedProjects = localStorage.getItem("projects");
            if (storedProjects) {
                try {
                    const parsedProjects: Project[] = JSON.parse(storedProjects);
                    const nextProjects = parsedProjects.map((item) =>
                        item.id === updatedProject.id ? updatedProject : item
                    );
                    localStorage.setItem("projects", JSON.stringify(nextProjects));
                } catch {
                    localStorage.setItem(
                        "projects",
                        JSON.stringify([updatedProject])
                    );
                }
            }
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : "Failed to regenerate API key";
            setApiKeyError(message);
        } finally {
            setIsRegenerating(false);
        }
    };

    const renderApiKeySection = (): JSX.Element => {
        const apiKey = project?.apiKey || null;
        const maskedKey = apiKey
            ? `${apiKey.substring(0, 8)}${"*".repeat(Math.max(apiKey.length - 12, 0))}${apiKey.slice(-4)}`
            : "";

        return (
            <div className="bg-gray-900 border border-gray-800 p-3">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider mb-3 pb-2 border-b border-gray-800">
                    {t("apiKeyManagement")}
                </h3>

                {loadingKey ? (
                    <div className="text-center py-6">
                        <p className="text-gray-600 text-xs">
                            Loading API key...
                        </p>
                    </div>
                ) : apiKeyError ? (
                    <div className="space-y-3">
                        <p className="text-red-400 text-xs">{apiKeyError}</p>
                        <button
                            onClick={loadActiveProject}
                            className="w-full bg-gray-800 border border-gray-700 px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors text-xs"
                        >
                            Retry
                        </button>
                    </div>
                ) : apiKey ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-gray-600 uppercase block mb-1.5">
                                {t("currentApiKey")}
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-black border border-gray-800 px-2 py-1.5 font-mono text-xs text-gray-400 break-all">
                                    {showKey ? apiKey : maskedKey}
                                </div>
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="bg-gray-800 border border-gray-700 p-1.5 text-gray-500 hover:text-gray-400 hover:bg-gray-700 transition-colors"
                                    title={showKey ? "Hide" : "Reveal"}
                                >
                                    {showKey ? (
                                        <EyeOff className="w-3 h-3" />
                                    ) : (
                                        <Eye className="w-3 h-3" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyKey}
                                className="flex-1 bg-gray-800 border border-gray-700 px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors text-xs flex items-center justify-center gap-1.5"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        {t("copied")}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        {t("copyKey")}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleRegenerateKey}
                                disabled={isRegenerating}
                                className="flex-1 bg-gray-800 border border-gray-700 px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <RotateCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
                                {isRegenerating ? "Regenerating..." : "Regenerate"}
                            </button>
                        </div>

                        <div className="pt-2 border-t border-gray-800">
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[10px] text-gray-600 uppercase">
                                    Status
                                </span>
                                <span className={`text-xs ${
                                    project.apiKeyStatus === "ACTIVE"
                                        ? "text-green-500"
                                        : "text-gray-500"
                                }`}>
                                    {project.apiKeyStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-600 text-xs">
                            No API key available. Please select a project
                            from the project list.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderPreferencesSection = (): JSX.Element => {
        return (
            <div className="bg-gray-900 border border-gray-800 p-3">
                <h3 className="text-[11px] text-gray-500 uppercase 
                    tracking-wider mb-3 pb-2 border-b border-gray-800">
                    {t("preferences")}
                </h3>

                <div className="flex items-center justify-between py-1.5">
                    <div className="flex-1">
                        <p className="text-[10px] text-gray-600 uppercase">
                            {t("language")}
                        </p>
                        <p className="text-[10px] text-gray-700 mt-0.5">
                            {t("interfaceLanguage")}
                        </p>
                    </div>
                    <button
                        onClick={handleLanguageToggle}
                        className="bg-gray-800 border border-gray-700 px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors text-xs"
                    >
                        {language === "en" ? "English" : "Korean"}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-4 pb-3 border-b border-gray-800">
                <h1 className="text-lg text-white">
                    {t("settings")}
                </h1>
                <p className="text-gray-600 text-[10px] mt-0.5">
                    Manage API keys and interface preferences
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    {renderApiKeySection()}
                </div>
                <div>
                    {renderPreferencesSection()}
                </div>
            </div>
        </div>
    );
}
