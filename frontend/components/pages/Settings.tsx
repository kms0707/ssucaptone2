import { useState } from "react";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { 
    Bell, 
    Database, 
    Gauge, 
    Zap, 
    Save, 
    RotateCcw,
    Languages
} from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";
import { Language } from "../../utils/translations";

/**
 * Settings page for configuring NIDS detection parameters.
 * Allows users to adjust logging, sensitivity, and automation rules.
 * 
 * @returns {JSX.Element} The settings configuration page
 */
export function Settings() {
    const { t, language, setLanguage } = useLanguage();
    const [autoLogging, setAutoLogging] = useState(true);
    const [realtimeNotifications, setRealtimeNotifications] = useState(true);
    const [anomalyThreshold, setAnomalyThreshold] = useState([0.7]);
    const [autoBlockEnabled, setAutoBlockEnabled] = useState(false);
    const [autoBlockThreshold, setAutoBlockThreshold] = useState([0.85]);
    const [alertThreshold, setAlertThreshold] = useState([0.5]);

    /**
     * Saves the current settings configuration.
     * 
     * @returns {void}
     */
    const handleSaveSettings = (): void => {
        // TODO: Implement settings persistence
    };

    /**
     * Resets all settings to their default values.
     * 
     * @returns {void}
     */
    const handleResetSettings = (): void => {
        setAutoLogging(true);
        setRealtimeNotifications(true);
        setAnomalyThreshold([0.7]);
        setAutoBlockEnabled(false);
        setAutoBlockThreshold([0.85]);
        setAlertThreshold([0.5]);
    };

    /**
     * Renders the page header section.
     * 
     * @returns {JSX.Element} The header with title and description
     */
    const renderHeader = (): JSX.Element => {
        return (
            <div className="mb-10">
                <h1 className="text-4xl text-white mb-3">
                    {t("settingsTitle")}
                </h1>
                <p className="text-gray-400 text-lg">
                    {t("settingsSubtitle")}
                </p>
            </div>
        );
    };

    /**
     * Renders a card header with icon and title.
     * 
     * @param {React.ComponentType} Icon - The icon component
     * @param {string} iconColor - Tailwind classes for icon styling
     * @param {string} title - The card title
     * @param {string} description - The card description
     * @returns {JSX.Element} Card header component
     */
    const renderCardHeader = (
        Icon: React.ComponentType<{ className?: string }>,
        iconColor: string,
        title: string,
        description: string
    ): JSX.Element => {
        return (
            <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-lg ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl text-white mb-2">{title}</h2>
                    <p className="text-gray-400">{description}</p>
                </div>
            </div>
        );
    };

    /**
     * Renders a toggle switch setting with label and description.
     * 
     * @param {string} id - The input ID
     * @param {string} label - The setting label
     * @param {string} description - The setting description
     * @param {boolean} checked - The current checked state
     * @param {Function} onChange - Change handler function
     * @returns {JSX.Element} Toggle setting component
     */
    const renderToggleSetting = (
        id: string,
        label: string,
        description: string,
        checked: boolean,
        onChange: (checked: boolean) => void
    ): JSX.Element => {
        return (
            <div className="flex items-center justify-between p-4 
                bg-gray-900/50 rounded-lg">
                <div className="flex-1">
                    <Label htmlFor={id} className="text-white text-base">
                        {label}
                    </Label>
                    <p className="text-gray-400 text-sm mt-1">
                        {description}
                    </p>
                </div>
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={onChange}
                />
            </div>
        );
    };

    /**
     * Renders the language preference card.
     * 
     * @returns {JSX.Element} Language preference settings card
     */
    const renderLanguagePreference = (): JSX.Element => {
        return (
            <Card className="bg-gray-800 border-gray-700 p-8">
                {renderCardHeader(
                    Languages,
                    "bg-blue-500/20 text-blue-400",
                    t("languagePreference"),
                    t("languagePreferenceDesc")
                )}
                <div className="flex gap-4">
                    <button
                        onClick={() => setLanguage("en")}
                        className={`flex-1 px-6 py-4 rounded-lg 
                            transition-all ${
                            language === "en"
                                ? "bg-blue-500/20 border-2 " +
                                  "border-blue-400 text-blue-400"
                                : "bg-gray-900/50 border-2 " +
                                  "border-gray-700 text-gray-400 " +
                                  "hover:border-gray-600"
                        }`}
                    >
                        <div className="text-center">
                            <p className="text-lg font-medium mb-1">
                                {t("english")}
                            </p>
                            <p className="text-sm opacity-70">English</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setLanguage("ko")}
                        className={`flex-1 px-6 py-4 rounded-lg 
                            transition-all ${
                            language === "ko"
                                ? "bg-blue-500/20 border-2 " +
                                  "border-blue-400 text-blue-400"
                                : "bg-gray-900/50 border-2 " +
                                  "border-gray-700 text-gray-400 " +
                                  "hover:border-gray-600"
                        }`}
                    >
                        <div className="text-center">
                            <p className="text-lg font-medium mb-1">
                                {t("korean")}
                            </p>
                            <p className="text-sm opacity-70">한국어</p>
                        </div>
                    </button>
                </div>
            </Card>
        );
    };

    /**
     * Renders the system logging configuration card.
     * 
     * @returns {JSX.Element} System logging settings card
     */
    const renderSystemLogging = (): JSX.Element => {
        return (
            <Card className="bg-gray-800 border-gray-700 p-8">
                {renderCardHeader(
                    Database,
                    "bg-teal-500/20 text-teal-400",
                    t("systemLogging"),
                    t("systemLoggingDesc")
                )}
                <div className="space-y-6">
                    {renderToggleSetting(
                        "auto-logging",
                        t("automaticLogging"),
                        t("automaticLoggingDesc"),
                        autoLogging,
                        setAutoLogging
                    )}
                    {renderToggleSetting(
                        "realtime-notifications",
                        t("realtimeNotifications"),
                        t("realtimeNotificationsDesc"),
                        realtimeNotifications,
                        setRealtimeNotifications
                    )}
                </div>
            </Card>
        );
    };

    /**
     * Renders a slider setting with label and current value display.
     * 
     * @param {string} label - The setting label
     * @param {string} description - The setting description
     * @param {number[]} value - The current slider value array
     * @param {Function} onChange - Change handler function
     * @param {number} min - Minimum slider value
     * @param {number} max - Maximum slider value
     * @param {number} step - Slider step increment
     * @param {string} valueColor - Tailwind class for value color
     * @returns {JSX.Element} Slider setting component
     */
    const renderSliderSetting = (
        label: string,
        description: string,
        value: number[],
        onChange: (value: number[]) => void,
        min: number,
        max: number,
        step: number,
        valueColor: string = "text-teal-400"
    ): JSX.Element => {
        return (
            <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-white text-base">
                            {label}
                        </Label>
                        <span className={`text-lg font-mono ${valueColor}`}>
                            {value[0].toFixed(2)}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                        {description}
                    </p>
                </div>
                <Slider
                    value={value}
                    onValueChange={onChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 
                    mt-2">
                    <span>
                        {min.toFixed(2)} - {t("lowSensitivity")}
                    </span>
                    <span>
                        {max.toFixed(2)} - {t("highSensitivity")}
                    </span>
                </div>
            </div>
        );
    };

    /**
     * Renders the detection sensitivity configuration card.
     * 
     * @returns {JSX.Element} Detection sensitivity settings card
     */
    const renderDetectionSensitivity = (): JSX.Element => {
        return (
            <Card className="bg-gray-800 border-gray-700 p-8">
                {renderCardHeader(
                    Gauge,
                    "bg-orange-500/20 text-orange-400",
                    t("detectionSensitivity"),
                    t("detectionSensitivityDesc")
                )}
                {renderSliderSetting(
                    t("anomalyThreshold"),
                    t("anomalyThresholdDesc"),
                    anomalyThreshold,
                    setAnomalyThreshold,
                    0,
                    1,
                    0.05
                )}
            </Card>
        );
    };

    /**
     * Renders the auto-block threshold slider when enabled.
     * 
     * @returns {JSX.Element | null} Auto-block threshold or null
     */
    const renderAutoBlockThreshold = (): JSX.Element | null => {
        if (!autoBlockEnabled) return null;

        return (
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-sm">
                        {t("autoBlockThreshold")}
                    </Label>
                    <span className="text-red-400 font-mono">
                        {autoBlockThreshold[0].toFixed(2)}
                    </span>
                </div>
                <Slider
                    value={autoBlockThreshold}
                    onValueChange={setAutoBlockThreshold}
                    min={0.7}
                    max={1}
                    step={0.05}
                    className="w-full"
                />
                <p className="text-yellow-400 text-xs mt-3 flex 
                    items-start gap-2">
                    <Bell className="w-3 h-3 mt-0.5" />
                    <span>{t("autoBlockWarning")}</span>
                </p>
            </div>
        );
    };

    /**
     * Renders the automation rules configuration card.
     * 
     * @returns {JSX.Element} Automation rules settings card
     */
    const renderAutomationRules = (): JSX.Element => {
        return (
            <Card className="bg-gray-800 border-gray-700 p-8">
                {renderCardHeader(
                    Zap,
                    "bg-red-500/20 text-red-400",
                    t("automationRules"),
                    t("automationRulesDesc")
                )}
                <div className="space-y-6">
                    {renderSliderSetting(
                        t("alertTrigger"),
                        t("alertTriggerDesc"),
                        alertThreshold,
                        setAlertThreshold,
                        0,
                        1,
                        0.05,
                        "text-orange-400"
                    )}
                    <div className="p-4 bg-gray-900/50 rounded-lg 
                        border-2 border-red-500/20">
                        <div className="flex items-center justify-between 
                            mb-4">
                            <div className="flex-1">
                                <Label 
                                    htmlFor="auto-block" 
                                    className="text-white text-base"
                                >
                                    {t("autoIPBlocking")}
                                </Label>
                                <p className="text-gray-400 text-sm mt-1">
                                    {t("autoIPBlockingDesc")}
                                </p>
                            </div>
                            <Switch
                                id="auto-block"
                                checked={autoBlockEnabled}
                                onCheckedChange={setAutoBlockEnabled}
                            />
                        </div>
                        {renderAutoBlockThreshold()}
                    </div>
                </div>
            </Card>
        );
    };

    /**
     * Renders the action buttons for save and reset operations.
     * 
     * @returns {JSX.Element} Action buttons component
     */
    const renderActionButtons = (): JSX.Element => {
        return (
            <div className="flex items-center justify-end gap-4">
                <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 
                        hover:bg-gray-700"
                    onClick={handleResetSettings}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t("resetToDefaults")}
                </Button>
                <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={handleSaveSettings}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {t("saveSettings")}
                </Button>
            </div>
        );
    };

    return (
        <div>
            {renderHeader()}
            <div className="space-y-8 max-w-4xl">
                {renderLanguagePreference()}
                {renderSystemLogging()}
                {renderDetectionSensitivity()}
                {renderAutomationRules()}
                {renderActionButtons()}
            </div>
        </div>
    );
}
