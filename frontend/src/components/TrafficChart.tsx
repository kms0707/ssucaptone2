import { useLanguage } from "../utils/LanguageContext";
import { TrafficCategory } from "../types/api";
import { Loader2, AlertCircle } from "lucide-react";

interface TrafficChartProps {
    data: TrafficCategory[];
    loading: boolean;
    error: string | null;
}

/**
 * Displays traffic distribution statistics in text format.
 * Shows numeric breakdown of traffic categories.
 * 
 * @param {TrafficChartProps} props - Component properties
 * @param {TrafficCategory[]} props.data - Traffic distribution data
 * @param {boolean} props.loading - Loading state indicator
 * @param {string | null} props.error - Error message if any
 * @returns {JSX.Element} The traffic distribution component
 */
export function TrafficChart({ data, loading, error }: TrafficChartProps) {
    const { t } = useLanguage();
    
    /**
     * Renders a loading state with spinner.
     * 
     * @returns {JSX.Element} Loading state component
     */
    const renderLoadingState = (): JSX.Element => {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-5 h-5 text-gray-600 
                        animate-spin mx-auto mb-2" 
                    />
                    <p className="text-gray-600 text-[9px]">
                        {t("loadingTrafficData")}
                    </p>
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
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-5 h-5 text-red-400 
                        mx-auto mb-2" 
                    />
                    <p className="text-gray-600 text-[9px]">
                        {t("errorLoadingTraffic")}
                    </p>
                </div>
            </div>
        );
    };

    /**
     * Calculates total traffic count.
     * 
     * @returns {number} Total traffic value
     */
    const calculateTotal = (): number => {
        return data.reduce((sum, item) => sum + item.value, 0);
    };

    /**
     * Renders the traffic statistics breakdown.
     * 
     * @returns {JSX.Element} Statistics breakdown
     */
    const renderStats = (): JSX.Element => {
        const total = calculateTotal();
        
        return (
            <div className="space-y-1.5">
                {data.map((item) => {
                    const percentage = total > 0 
                        ? ((item.value / total) * 100).toFixed(1)
                        : "0.0";
                    
                    const isAttack = item.name.toLowerCase().includes("attack");
                    const isSuspicious = item.name.toLowerCase()
                        .includes("suspicious");
                    
                    let valueColor = "text-gray-400";
                    if (isAttack) valueColor = "text-red-400";
                    else if (isSuspicious) valueColor = "text-orange-400";
                    
                    return (
                        <div 
                            key={item.name} 
                            className="border-b border-gray-800 pb-1.5"
                        >
                            <div className="flex items-center justify-between 
                                mb-1">
                                <span className="text-gray-600 text-[10px] 
                                    uppercase">
                                    {item.name}
                                </span>
                                <span className={`text-lg font-mono 
                                    ${valueColor}`}>
                                    {item.value}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="h-1 flex-1 bg-gray-800 mr-2">
                                    <div 
                                        className={`h-1 ${
                                            isAttack 
                                                ? "bg-red-600" 
                                                : isSuspicious 
                                                    ? "bg-orange-600" 
                                                    : "bg-gray-600"
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-mono 
                                    ${valueColor}`}>
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div className="pt-2 border-t-2 border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-[10px] 
                            uppercase">
                            Total
                        </span>
                        <span className="text-white text-lg font-mono">
                            {total}
                        </span>
                    </div>
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

        return renderStats();
    };

    return (
        <div className="bg-gray-900 border border-gray-800 p-3 h-full 
            flex flex-col">
            <h3 className="text-[11px] text-gray-500 uppercase 
                tracking-wider mb-3 pb-2 border-b border-gray-800">
                {t("trafficDistribution")}
            </h3>
            {renderContent()}
        </div>
    );
}