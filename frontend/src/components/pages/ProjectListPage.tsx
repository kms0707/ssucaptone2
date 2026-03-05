import { useState, useEffect } from "react";
import {
    Folder,
    Plus,
    Key,
    Loader2,
    User,
    LogOut,
    CircleUserRound,
    Info,
} from "lucide-react";
import { fetchProjects, createProject } from "../../utils/apiClient";
import { Project } from "../../types/api";
import { useLanguage } from "../../utils/LanguageContext";
import { info, error as logError } from "../../utils/logger";
import { useAuth } from "../../contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface ProjectListPageProps {
    onProjectSelect: (projectId: number, projectName: string) => void;
    onNavigateToIntro: () => void;
}

/**
 * Project list page component.
 * Displays all projects and allows creating new ones.
 * 
 * @param {ProjectListPageProps} props - Component props
 * @returns {JSX.Element} Project list page
 */
export function ProjectListPage({ 
    onProjectSelect,
    onNavigateToIntro,
}: ProjectListPageProps): JSX.Element {
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [creating, setCreating] = useState(false);

    /**
     * Loads projects from the backend.
     * 
     * @returns {Promise<void>}
     */
    const loadProjects = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProjects();
            setProjects(data);
            localStorage.setItem("projects", JSON.stringify(data));
            info("Projects loaded successfully from API");
        } catch (err) {
            const message = err instanceof Error 
                ? err.message 
                : "Failed to load projects";
            setError(message);
            logError("Failed to load projects", err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Creates a new project.
     * 
     * @returns {Promise<void>}
     */
    const handleCreateProject = async (): Promise<void> => {
        if (!newProjectName.trim()) {
            setError("Project name is required");
            return;
        }

        try {
            setCreating(true);
            setError(null);
            const newProject = await createProject(
                newProjectName,
                newProjectDesc
            );
            const nextProjects = [...projects, newProject];
            setProjects(nextProjects);
            localStorage.setItem("projects", JSON.stringify(nextProjects));
            setShowCreateForm(false);
            setNewProjectName("");
            setNewProjectDesc("");
            info("Project created successfully");
        } catch (err) {
            const message = err instanceof Error 
                ? err.message 
                : "Failed to create project";
            setError(message);
            logError("Failed to create project", err);
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    /**
     * Renders loading state.
     * 
     * @returns {JSX.Element} Loading component
     */
    const renderLoading = (): JSX.Element => {
        return (
            <div className="flex items-center justify-center 
                min-h-screen bg-slate-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-teal-400 
                        animate-spin mx-auto mb-4" 
                    />
                    <p className="text-gray-400">
                        Loading projects...
                    </p>
                </div>
            </div>
        );
    };

    /**
     * Renders error state.
     * 
     * @returns {JSX.Element} Error component
     */
    const renderError = (): JSX.Element => {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center 
                justify-center p-6">
                <div className="bg-gray-900 border border-red-800 p-6 
                    max-w-md">
                    <h2 className="text-red-400 mb-2">Error</h2>
                    <p className="text-gray-400 text-xs mb-4">{error}</p>
                    <button
                        onClick={loadProjects}
                        className="bg-gray-800 border border-gray-700 px-4 
                            py-2 text-gray-400 hover:text-gray-300 
                            hover:bg-gray-700 transition-colors text-xs"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return renderLoading();
    }

    if (error && projects.length === 0) {
        return renderError();
    }

    const userDisplayName = user?.username || user?.email || "User";
    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg text-white mb-1">
                            {t("selectProject")}
                        </h1>
                        <p className="text-gray-600 text-[10px]">
                            Choose a project to monitor
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="flex items-center gap-3 border border-gray-800 bg-gray-900 px-3 py-2 text-left hover:bg-gray-800 transition-colors"
                            >
                                <Avatar className="size-10 border border-gray-700">
                                    <AvatarFallback className="bg-gray-800 text-gray-500 flex items-center justify-center">
                                        <CircleUserRound className="w-7 h-7" strokeWidth={1.75} />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs text-white truncate">
                                        {userDisplayName}
                                    </p>
                                    <p className="text-[10px] text-gray-600 truncate">
                                        {user?.email || "Signed in"}
                                    </p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 bg-gray-900 border-gray-800 text-gray-300 rounded-none"
                        >
                            <DropdownMenuLabel className="text-xs text-gray-500">
                                Account
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuItem
                                onClick={onNavigateToIntro}
                                className="text-xs focus:bg-gray-800 focus:text-white rounded-none"
                            >
                                <Info className="w-3.5 h-3.5 text-gray-500" />
                                About
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs focus:bg-gray-800 focus:text-white rounded-none">
                                <User className="w-3.5 h-3.5 text-gray-500" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-xs focus:bg-red-900/20 focus:text-red-300 rounded-none"
                            >
                                <LogOut className="w-3.5 h-3.5 text-red-400" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-800 
                        p-3 mb-4">
                        <p className="text-red-400 text-xs">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                    gap-4 mb-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => onProjectSelect(project.id, project.name)}
                            className="bg-gray-900 border border-gray-800 
                                p-4 hover:border-teal-700 
                                hover:bg-gray-800/50 transition-all 
                                cursor-pointer group"
                        >
                            <div className="flex items-start justify-between 
                                mb-3">
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-gray-500 
                                        group-hover:text-teal-400 
                                        transition-colors" 
                                    />
                                    <h3 className="text-sm text-white">
                                        {project.name}
                                    </h3>
                                </div>
                                <div className={`w-2 h-2 ${
                                    project.apiKeyStatus === "ACTIVE" 
                                        ? "bg-green-500" 
                                        : "bg-red-500"
                                }`} />
                            </div>
                            <p className="text-gray-500 text-[10px] mb-3 
                                line-clamp-2">
                                {project.description || "No description"}
                            </p>
                            <div className="flex items-center gap-2 
                                text-[9px] text-gray-600">
                                <Key className="w-3 h-3" />
                                <span className="font-mono">
                                    {project.apiKey.substring(0, 16)}...
                                </span>
                            </div>
                        </div>
                    ))}

                    <div
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gray-900/50 border border-gray-800 
                            border-dashed p-4 hover:border-teal-700 
                            hover:bg-gray-800/30 transition-all 
                            cursor-pointer group flex items-center 
                            justify-center min-h-[180px]"
                    >
                        <div className="text-center">
                            <Plus className="w-8 h-8 text-gray-600 
                                group-hover:text-teal-400 
                                transition-colors mx-auto mb-2" 
                            />
                            <p className="text-gray-500 text-xs">
                                Create New Project
                            </p>
                        </div>
                    </div>
                </div>

                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/80 flex 
                        items-center justify-center z-50">
                        <div className="bg-gray-900 border border-gray-800 
                            p-6 max-w-md w-full mx-4">
                            <h2 className="text-white mb-4">
                                Create New Project
                            </h2>
                            
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="text-[10px] 
                                        text-gray-600 uppercase block mb-1.5">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => 
                                            setNewProjectName(e.target.value)}
                                        className="w-full bg-black border 
                                            border-gray-800 px-3 py-2 text-xs 
                                            text-gray-300 focus:outline-none 
                                            focus:border-gray-700"
                                        placeholder="Enter project name"
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] 
                                        text-gray-600 uppercase block mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={newProjectDesc}
                                        onChange={(e) => 
                                            setNewProjectDesc(e.target.value)}
                                        className="w-full bg-black border 
                                            border-gray-800 px-3 py-2 text-xs 
                                            text-gray-300 focus:outline-none 
                                            focus:border-gray-700 resize-none"
                                        placeholder="Enter description"
                                        rows={3}
                                        maxLength={500}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateProject}
                                    disabled={creating}
                                    className="flex-1 bg-teal-600 border 
                                        border-teal-600 px-4 py-2 
                                        text-white hover:bg-teal-700 
                                        transition-colors text-xs 
                                        disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewProjectName("");
                                        setNewProjectDesc("");
                                        setError(null);
                                    }}
                                    disabled={creating}
                                    className="flex-1 bg-gray-800 border 
                                        border-gray-700 px-4 py-2 
                                        text-gray-400 hover:text-gray-300 
                                        hover:bg-gray-700 transition-colors 
                                        text-xs disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
