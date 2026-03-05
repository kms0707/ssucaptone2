import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/pages/Dashboard";
import { DetectionDetail } from "./components/pages/DetectionDetail";
import { Settings } from "./components/pages/Settings";
import { LoginPage } from "./components/pages/LoginPage";
import { SignUpPage } from "./components/pages/SignUpPage";
import { IntroPage } from "./components/pages/IntroPage";
import { ProjectListPage } from "./components/pages/ProjectListPage";
import { LanguageProvider } from "./utils/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Main authenticated application component
 * Displays the dashboard with sidebar navigation
 * 
 * @returns Main application layout
 */
function AuthenticatedApp(): JSX.Element {
    const [currentPage, setCurrentPage] = useState("project-list");
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(
        null
    );
    const [selectedProject, setSelectedProject] = useState<{
        id: number;
        name: string;
    } | null>(null);

    /**
     * Handles project selection from project list.
     * 
     * @param {number} projectId - The selected project ID
     * @param {string} projectName - The selected project name
     * @returns {void}
     */
    const handleProjectSelect = (
        projectId: number,
        projectName: string
    ): void => {
        setSelectedProject({ id: projectId, name: projectName });
        localStorage.setItem("active_project_id", projectId.toString());
        localStorage.setItem("active_project_name", projectName);
        setCurrentPage("dashboard");
    };

    /**
     * Navigates back to project list.
     * 
     * @returns {void}
     */
    const handleBackToProjects = (): void => {
        setSelectedProject(null);
        localStorage.removeItem("active_project_id");
        localStorage.removeItem("active_project_name");
        setCurrentPage("project-list");
    };

    /**
     * Navigates to the detection detail page for a specific alert.
     * 
     * @param alertId - The unique identifier of the alert to view
     */
    const handleNavigateToDetection = (alertId: string): void => {
        setSelectedAlertId(alertId);
        setCurrentPage("detection");
    };

    /**
     * Renders the appropriate page component based on current navigation.
     * 
     * @returns The active page component
     */
    const renderPage = (): JSX.Element => {
        switch (currentPage) {
            case "intro":
                return (
                    <IntroPage
                        onGetStarted={() => setCurrentPage("project-list")}
                        primaryLabel="Open Workspace"
                        secondaryLabel="Back to Projects"
                        onSecondaryAction={() => setCurrentPage("project-list")}
                    />
                );
            case "project-list":
                return (
                    <ProjectListPage 
                        onProjectSelect={handleProjectSelect}
                        onNavigateToIntro={() => setCurrentPage("intro")}
                    />
                );
            case "dashboard":
                if (!selectedProject) {
                    return (
                        <ProjectListPage 
                            onProjectSelect={handleProjectSelect}
                            onNavigateToIntro={() => setCurrentPage("intro")}
                        />
                    );
                }
                return (
                    <Dashboard 
                        onNavigateToDetection={handleNavigateToDetection}
                        projectId={selectedProject.id}
                        projectName={selectedProject.name}
                        onBackToProjects={handleBackToProjects}
                    />
                );
            case "detection":
                return (
                    <DetectionDetail 
                        alertId={selectedAlertId || "1"} 
                        onBack={() => setCurrentPage("dashboard")}
                    />
                );
            case "settings":
                return <Settings />;
            default:
                return (
                    <ProjectListPage 
                        onProjectSelect={handleProjectSelect}
                        onNavigateToIntro={() => setCurrentPage("intro")}
                    />
                );
        }
    };

    const showSidebar = currentPage !== "project-list" && currentPage !== "intro";

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {showSidebar && (
                <Sidebar 
                    currentPage={currentPage} 
                    onPageChange={setCurrentPage} 
                />
            )}
            <div className={showSidebar ? "flex-1 ml-64" : "flex-1"}>
                <div className={showSidebar ? "p-3" : ""}>
                    {renderPage()}
                </div>
            </div>
        </div>
    );
}

/**
 * App router component
 * Handles authentication state and routing
 * 
 * @returns App router JSX element
 */
function AppRouter(): JSX.Element {
    const { isAuthenticated, isLoading } = useAuth();
    const [publicPage, setPublicPage] = useState<
        "intro" | "login" | "signup"
    >("intro");

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex 
                items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        switch (publicPage) {
            case "intro":
                return (
                    <IntroPage onGetStarted={() => setPublicPage("login")} />
                );
            case "signup":
                return (
                    <SignUpPage
                        onSignUp={() => setPublicPage("login")}
                        onNavigateToLogin={() => setPublicPage("login")}
                    />
                );
            case "login":
            default:
                return (
                    <LoginPage
                        onNavigateToSignUp={() => setPublicPage("signup")}
                        onNavigateToIntro={() => setPublicPage("intro")}
                    />
                );
        }
    }

    return <AuthenticatedApp />;
}

/**
 * Root App component with providers
 * Wraps the entire application with necessary context providers
 * 
 * @returns Root application component
 */
export default function App(): JSX.Element {
    return (
        <LanguageProvider>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </LanguageProvider>
    );
}
