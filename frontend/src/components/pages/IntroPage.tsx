import {
    ArrowRight,
    Globe,
} from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";

interface IntroPageProps {
    onGetStarted: () => void;
    primaryLabel?: string;
    secondaryLabel?: string;
    onSecondaryAction?: () => void;
}

/**
 * Intro landing page shown before authentication.
 *
 * @param {IntroPageProps} props - Component properties
 * @returns {JSX.Element} Intro page layout
 */
export function IntroPage({
    onGetStarted,
    primaryLabel = "Login",
    secondaryLabel = "Learn more",
    onSecondaryAction,
}: IntroPageProps): JSX.Element {
    const { language, setLanguage } = useLanguage();

    const copy = language === "ko" ? {
        titleTop: "Flow Log AI",
        titleBottom: "침입 탐지",
        subtitle:
            "네트워크 플로우 로그를 분석하고, AI 모델로 의심 행위를 점수화하며, 프로젝트 단위 보안 워크스페이스에서 공격 흔적을 추적합니다.",
        features: [
            {
                title: "플로우 로그 수집 및 업로드",
                description:
                    "프로젝트별 트래픽 데이터를 모으고 모니터링 대상을 한 곳에서 관리합니다.",
            },
            {
                title: "AI 모델 기반 공격 탐지",
                description:
                    "이상 점수를 바탕으로 정상 흐름과 공격 가능성이 높은 흐름을 빠르게 구분합니다.",
            },
            {
                title: "Flow Log 이력 및 상세 조회",
                description:
                    "타임라인, IP 쌍, 상세 화면을 통해 이벤트를 단계적으로 확인할 수 있습니다.",
            },
            {
                title: "프로젝트별 API Key 관리",
                description:
                    "같은 앱 안에서 API 키를 발급, 조회, 복사, 재발급할 수 있습니다.",
            },
        ],
        overviewLabel: "모니터링 개요",
        overviewTitle: "AI 기반 Flow Log 네트워크 침입 탐지 시스템",
        active: "활성",
        statFlowLogs: "플로우 로그",
        statAttackRisk: "공격 위험도",
        statProjects: "프로젝트",
        panelOneTitle: "구조화된 흐름 가시성",
        panelOneDescription:
            "출발지와 목적지 IP, 프로토콜 정보, 전송 트래픽 볼륨을 한 화면에서 간결하게 확인할 수 있습니다.",
        panelTwoTitle: "공격 중심 조사 흐름",
        panelTwoDescription:
            "프로젝트 선택부터 상세 조사까지 같은 흐름 안에서 바로 이동할 수 있습니다.",
        primaryLabel,
        secondaryLabel,
    } : {
        titleTop: "Flow Log AI",
        titleBottom: "Intrusion Detection",
        subtitle:
            "Analyze network flow logs, score suspicious behavior with an AI model, and investigate attack traces from a single project-based security workspace.",
        features: [
            {
                title: "Upload or collect flow logs",
                description:
                    "Bring in project traffic data and keep monitoring feeds organized in one place.",
            },
            {
                title: "Detect attacks with AI model",
                description:
                    "Use anomaly scores to separate normal flows from likely attack traffic.",
            },
            {
                title: "View history and flow details",
                description:
                    "Inspect timeline entries, IP pairs, and detail views for deeper triage.",
            },
            {
                title: "Manage API keys per project",
                description:
                    "Issue, reveal, copy, and regenerate project API keys from the same app.",
            },
        ],
        overviewLabel: "Monitoring Overview",
        overviewTitle: "AI-based Flow Log Network Intrusion Detection System",
        active: "Active",
        statFlowLogs: "Flow Logs",
        statAttackRisk: "Attack Risk",
        statProjects: "Projects",
        panelOneTitle: "Structured flow visibility",
        panelOneDescription:
            "Review source and destination pairs, protocol information, and transferred traffic volume in a compact viewer.",
        panelTwoTitle: "Attack-focused triage",
        panelTwoDescription:
            "Move from project selection to detail investigation without leaving the same workflow.",
        primaryLabel,
        secondaryLabel,
    };

    const handleLearnMore = (): void => {
        const featureSection = document.getElementById("intro-features");
        featureSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSecondaryAction = (): void => {
        if (onSecondaryAction) {
            onSecondaryAction();
            return;
        }

        handleLearnMore();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_34%),radial-gradient(circle_at_82%_18%,_rgba(239,68,68,0.10),_transparent_22%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]" />
            <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.12),transparent)] opacity-30" />

            <div className="relative min-h-screen px-6 py-10">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start pt-2">
                    <div className="space-y-8 -mt-12 md:-mt-16">
                        <div className="flex items-start justify-end gap-4 flex-wrap">
                            <div className="flex flex-col items-center gap-3">
                                <div className="inline-flex w-fit items-center gap-2 border border-gray-800 bg-gray-900/70 px-2 py-[5px]">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <button
                                        onClick={() => setLanguage("en")}
                                        className={`min-w-[54px] px-3 py-2 text-[13px] leading-none tracking-[0.14em] transition-colors ${
                                            language === "en"
                                                ? "bg-gray-200 text-slate-950"
                                                : "text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        EN
                                    </button>
                                    <button
                                        onClick={() => setLanguage("ko")}
                                        className={`min-w-[54px] px-3 py-2 text-[13px] leading-none tracking-[0.08em] transition-colors ${
                                            language === "ko"
                                                ? "bg-gray-200 text-slate-950"
                                                : "text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        KOR
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3 justify-end pt-1">
                                    <button
                                        onClick={onGetStarted}
                                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 border border-teal-500 px-5 py-3 text-sm text-white transition-colors"
                                    >
                                        {copy.primaryLabel}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleSecondaryAction}
                                        className="inline-flex items-center gap-2 border border-gray-700 bg-gray-900/60 hover:bg-gray-800 px-5 py-3 text-sm text-gray-300 transition-colors"
                                    >
                                        {copy.secondaryLabel}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="-translate-y-8 flex max-w-3xl flex-col gap-8">
                            <div className="text-4xl md:text-6xl font-semibold tracking-tight leading-none">
                                {copy.titleTop}
                            </div>
                            <div className="text-4xl md:text-6xl font-semibold tracking-tight leading-none">
                                {copy.titleBottom}
                            </div>
                            <div className="max-w-2xl text-sm md:text-base text-slate-300 leading-10">
                                {copy.subtitle}
                            </div>
                        </div>

                        <div
                            id="intro-features"
                            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl"
                        >
                            <div className="border border-gray-800 bg-gray-900/60 p-4">
                                <p className="text-sm text-white mb-2">
                                    {copy.features[0].title}
                                </p>
                                <p className="text-xs leading-6 text-gray-400">
                                    {copy.features[0].description}
                                </p>
                            </div>
                            <div className="border border-gray-800 bg-gray-900/60 p-4">
                                <p className="text-sm text-white mb-2">
                                    {copy.features[1].title}
                                </p>
                                <p className="text-xs leading-6 text-gray-400">
                                    {copy.features[1].description}
                                </p>
                            </div>
                            <div className="border border-gray-800 bg-gray-900/60 p-4">
                                <p className="text-sm text-white mb-2">
                                    {copy.features[2].title}
                                </p>
                                <p className="text-xs leading-6 text-gray-400">
                                    {copy.features[2].description}
                                </p>
                            </div>
                            <div className="border border-gray-800 bg-gray-900/60 p-4">
                                <p className="text-sm text-white mb-2">
                                    {copy.features[3].title}
                                </p>
                                <p className="text-xs leading-6 text-gray-400">
                                    {copy.features[3].description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 w-full max-w-2xl space-y-4 lg:mt-0 lg:max-w-none">
                        <div className="w-full border border-gray-800 bg-gray-900/60 p-4">
                            <p className="text-sm text-white mb-1">
                                {copy.panelOneTitle}
                            </p>
                            <p className="text-xs leading-6 text-gray-400">
                                {copy.panelOneDescription}
                            </p>
                        </div>
                        <div className="w-full border border-gray-800 bg-gray-900/60 p-4">
                            <p className="text-sm text-white mb-1">
                                {copy.panelTwoTitle}
                            </p>
                            <p className="text-xs leading-6 text-gray-400">
                                {copy.panelTwoDescription}
                            </p>
                        </div>

                        <div className="flex w-full flex-col border border-gray-800 bg-gray-900/60 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">
                                        {copy.overviewLabel}
                                    </p>
                                    <p className="text-sm text-white">
                                        {copy.overviewTitle}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                                    <span className="text-[10px] text-green-300">
                                        {copy.active}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="border border-gray-800 bg-slate-950/80 p-3">
                                    <p className="text-[10px] text-gray-500 mb-1">
                                        {copy.statFlowLogs}
                                    </p>
                                    <p className="text-xl text-teal-300 font-mono">
                                        12.4K
                                    </p>
                                </div>
                                <div className="border border-gray-800 bg-slate-950/80 p-3">
                                    <p className="text-[10px] text-gray-500 mb-1">
                                        {copy.statAttackRisk}
                                    </p>
                                    <p className="text-xl text-red-300 font-mono">
                                        0.9842
                                    </p>
                                </div>
                                <div className="border border-gray-800 bg-slate-950/80 p-3">
                                    <p className="text-[10px] text-gray-500 mb-1">
                                        {copy.statProjects}
                                    </p>
                                    <p className="text-xl text-amber-300 font-mono">
                                        04
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
