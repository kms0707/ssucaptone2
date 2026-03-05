import { Home, Settings, Shield, LucideIcon, LogOut } from "lucide-react";
import { useLanguage } from "../utils/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

interface SidebarProps {
    currentPage: string;
    onPageChange: (page: string) => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

/**
 * Navigation sidebar for the NIDS application.
 * Displays branding, navigation menu, and version information.
 * 
 * @param {SidebarProps} props - Component properties
 * @param {string} props.currentPage - The currently active page identifier
 * @param {Function} props.onPageChange - Callback to handle page navigation
 * @returns {JSX.Element} The sidebar navigation component
 */
export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
    const { t } = useLanguage();
    const { logout } = useAuth();
    
    const menuItems: MenuItem[] = [
        { id: "dashboard", label: t("dashboard"), icon: Home },
        { id: "settings", label: t("settings"), icon: Settings },
    ];

    /**
     * Renders the application header with logo and branding.
     * 
     * @returns {JSX.Element} The header section of the sidebar
     */
    const renderHeader = (): JSX.Element => {
        return (
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                        <h2 className="text-white text-sm">NIDS</h2>
                        <p className="text-xs text-gray-600">
                            {t("networkSecurity")}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the navigation menu with all available pages.
     * 
     * @returns {JSX.Element} The navigation menu component
     */
    const renderNavigation = (): JSX.Element => {
        return (
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = currentPage === item.id;
                        return renderMenuItem(item, isActive);
                    })}
                </ul>
            </nav>
        );
    };

    /**
     * Renders an individual menu item button.
     * 
     * @param {MenuItem} item - The menu item configuration
     * @param {boolean} isActive - Whether this item is currently active
     * @returns {JSX.Element} A menu item button
     */
    const renderMenuItem = (
        item: MenuItem, 
        isActive: boolean
    ): JSX.Element => {
        const Icon = item.icon;
        const buttonClass = isActive
            ? "bg-gray-700 text-white border-l-2 border-gray-400"
            : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-400 " +
              "border-l-2 border-transparent";

        return (
            <li key={item.id}>
                <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center gap-2 px-3 
                        py-2 text-sm transition-colors ${buttonClass}`}
                >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                </button>
            </li>
        );
    };

    /**
     * Renders the footer section with logout button and version info.
     * 
     * @returns The footer component
     */
    const renderFooter = (): JSX.Element => {
        return (
            <div className="p-4 border-t border-gray-800 space-y-3">
                <Button
                    onClick={logout}
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-gray-300 hover:bg-gray-800 justify-start"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout")}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                    {t("version")}
                </p>
            </div>
        );
    };

    return (
        <div className="w-64 bg-gray-950 border-r border-gray-800 
            h-screen fixed left-0 top-0 flex flex-col">
            {renderHeader()}
            {renderNavigation()}
            {renderFooter()}
        </div>
    );
}
