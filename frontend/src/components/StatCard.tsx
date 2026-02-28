import { LucideIcon, Loader2, AlertCircle } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor: string;
    trend?: string;
    loading?: boolean;
    error?: string | null;
}

/**
 * Displays a single statistic card with an icon, value, and optional trend.
 * Supports loading and error states.
 * 
 * @param {StatCardProps} props - Component properties
 * @param {string} props.title - The statistic title or label
 * @param {string | number} props.value - The main statistic value
 * @param {LucideIcon} props.icon - The icon component to display
 * @param {string} props.iconColor - Tailwind classes for icon styling
 * @param {string} [props.trend] - Optional trend or additional info text
 * @param {boolean} [props.loading] - Loading state indicator
 * @param {string | null} [props.error] - Error message if any
 * @returns {JSX.Element} A styled statistic card
 */
export function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    iconColor, 
    trend,
    loading = false,
    error = null
}: StatCardProps) {
    /**
     * Renders the main content of the stat card.
     * 
     * @returns {JSX.Element} Card content based on state
     */
    const renderContent = (): JSX.Element => {
        if (loading) {
            return (
                <div className="flex-1 flex items-center">
                    <Loader2 className="w-4 h-4 text-gray-500 
                        animate-spin" 
                    />
                    <span className="ml-2 text-gray-500 text-xs">
                        Loading...
                    </span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-1">
                    <p className="text-gray-500 text-xs mb-1">
                        {title}
                    </p>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-xs">Error</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-4 flex-1">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <div className="flex-1">
                    <p className="text-gray-500 text-xs mb-0.5">
                        {title}
                    </p>
                    <p className="text-white text-xl">
                        {value}
                    </p>
                </div>
                {trend && (
                    <p className="text-xs text-gray-600">
                        {trend}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 p-3 
            flex items-center">
            {renderContent()}
        </div>
    );
}