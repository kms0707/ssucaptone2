import type { CSSProperties, JSX } from "react";
import { useLanguage } from "../../utils/LanguageContext";

interface IntroPageProps {
    onGetStarted: () => void;
    primaryLabel?: string;
    secondaryLabel?: string;
    onSecondaryAction?: () => void;
}

interface CardCopy {
    title: string;
    description: string;
}

interface IntroCopy {
    aboutTitle: string;
    aboutSubtitle: string;
    heroLabel: string;
    heroTitle: string;
    heroDescription: string;
    monitoringLabel: string;
    monitoringTitle: string;
    keyCapabilitiesLabel: string;
    metricFlowLogs: string;
    metricAttackRisk: string;
    metricProjects: string;
    features: CardCopy[];
    capabilities: CardCopy[];
}

const theme = {
    page: "#020817",
    panel: "#071224",
    panelStrong: "#09172b",
    border: "#18324f",
    borderSoft: "#112840",
    text: "#f8fbff",
    textSoft: "#a9bfd8",
    textMuted: "#7893b0",
    accent: "#19d3f3",
    accentSoft: "#0ea5b7",
    danger: "#ff6678",
    divider: "#14263d",
} as const;

const cardStyle: CSSProperties = {
    backgroundColor: theme.panel,
    border: `1px solid ${theme.border}`,
};

const strongCardStyle: CSSProperties = {
    backgroundColor: theme.panelStrong,
    border: `1px solid ${theme.border}`,
};

const sectionStyle: CSSProperties = {
    borderTop: `1px solid ${theme.divider}`,
    paddingTop: "1.5rem",
};

const controlStyle: CSSProperties = {
    backgroundColor: theme.panel,
    border: `1px solid ${theme.borderSoft}`,
    color: theme.text,
};

const activeLanguageStyle: CSSProperties = {
    backgroundColor: theme.text,
    color: theme.page,
};

const inactiveLanguageStyle: CSSProperties = {
    backgroundColor: "transparent",
    color: theme.textSoft,
};

const primaryButtonStyle: CSSProperties = {
    backgroundColor: theme.panelStrong,
    border: `1px solid ${theme.borderSoft}`,
    color: theme.textSoft,
    width: "100px",
    minHeight: "40px",
    fontSize: "1.2rem",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
};

export function IntroPage({
    onGetStarted,
    primaryLabel = "Login",
    secondaryLabel,
    onSecondaryAction,
}: IntroPageProps): JSX.Element {
    const { language, setLanguage } = useLanguage();

    const copy: IntroCopy = language === "ko"
        ? {
              aboutTitle: "About NIDS",
              aboutSubtitle: "AI 기반 Flow Log 네트워크 침입 탐지 시스템",
              heroLabel: "FLOW LOG",
              heroTitle: "침입 탐지",
              heroDescription:
                  "네트워크 플로우 로그를 분석하고, AI 모델로 의심 행위를 점수화하며, 프로젝트 단위 보안 작업 공간에서 공격 흔적을 조사합니다.",
              monitoringLabel: "MONITORING OVERVIEW",
              monitoringTitle: "AI 기반 Flow Log 네트워크 침입 탐지 시스템",
              keyCapabilitiesLabel: "KEY CAPABILITIES",
              metricFlowLogs: "Flow Logs",
              metricAttackRisk: "Attack Risk",
              metricProjects: "Projects",
              features: [
                  {
                      title: "Flow log 업로드 또는 수집",
                      description:
                          "모니터링 도구에서 pcap 및 트래픽 데이터를 가져와 한 곳에 정리합니다.",
                  },
                  {
                      title: "AI 모델로 공격 탐지",
                      description:
                          "이상 점수를 이용해 정상 흐름과 공격 가능성이 높은 트래픽을 구분합니다.",
                  },
                  {
                      title: "이력과 상세 흐름 조회",
                      description:
                          "타임라인 기록, IP 쌍, 세부 보기로 더 깊은 트리아지를 진행합니다.",
                  },
              ],
              capabilities: [
                  {
                      title: "구조화된 흐름 가시성",
                      description:
                          "출발지와 목적지 쌍, 프로토콜 정보, 트래픽 볼륨을 간결한 화면에서 검토합니다.",
                  },
                  {
                      title: "공격 중심 트리아지",
                      description:
                          "프로젝트 선택부터 상세 조사까지 같은 절차를 반복하지 않고 이어서 진행합니다.",
                  },
              ],
          }
        : {
              aboutTitle: "About NIDS",
              aboutSubtitle:
                  "AI-based Flow Log Network Intrusion Detection System",
              heroLabel: "FLOW LOG",
              heroTitle: "Intrusion Detection",
              heroDescription:
                  "Analyze network flow logs, score suspicious behavior with an AI model, and investigate attack traces from a single project-based security workspace.",
              monitoringLabel: "MONITORING OVERVIEW",
              monitoringTitle:
                  "AI-based Flow Log Network Intrusion Detection System",
              keyCapabilitiesLabel: "KEY CAPABILITIES",
              metricFlowLogs: "Flow Logs",
              metricAttackRisk: "Attack Risk",
              metricProjects: "Projects",
              features: [
                  {
                      title: "Upload or collect flow logs",
                      description:
                          "Bring in pcap and traffic data once from monitoring tools organized in one place.",
                  },
                  {
                      title: "Detect attacks with AI model",
                      description:
                          "Use anomaly scores to separate normal flows from likely attack traffic.",
                  },
                  {
                      title: "View history and flow details",
                      description:
                          "Inspect timeline records, IP pairs, and detail views for deeper triage.",
                  },
              ],
              capabilities: [
                  {
                      title: "Structured flow visibility",
                      description:
                          "Review source and destination pairs, protocol information, and numbered traffic volume in a compact view.",
                  },
                  {
                      title: "Attack-focused triage",
                      description:
                          "Move from project selector to detail investigation without repeating the same workflow.",
                  },
              ],
          };

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: theme.page, color: theme.text }}
        >
            <div className="mx-auto w-full max-w-[1180px] px-6 md:px-8 py-8 lg:py-10">
                <div className="flex w-full justify-end">
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="inline-flex items-center rounded-sm p-1"
                            style={controlStyle}
                        >
                            <button
                                type="button"
                                onClick={() => setLanguage("en")}
                                className="min-w-[56px] px-3 py-1.5 text-[11px] tracking-[0.12em]"
                                style={
                                    language === "en"
                                        ? activeLanguageStyle
                                        : inactiveLanguageStyle
                                }
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage("ko")}
                                className="min-w-[56px] px-3 py-1.5 text-[11px] tracking-[0.1em]"
                                style={
                                    language === "ko"
                                        ? activeLanguageStyle
                                        : inactiveLanguageStyle
                                }
                            >
                                KOR
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            {secondaryLabel && (
                                <button
                                    type="button"
                                    onClick={onSecondaryAction}
                                    className="rounded-sm px-5 py-2.5 text-sm"
                                    style={controlStyle}
                                >
                                    {secondaryLabel}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onGetStarted}
                                className="rounded-sm px-8 py-4 font-medium tracking-[0.02em]"
                                style={primaryButtonStyle}
                            >
                                {primaryLabel}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <section>
                        <h1 className="text-[1.85rem] font-medium tracking-tight">
                            {copy.aboutTitle}
                        </h1>
                        <p
                            className="mt-4 text-sm md:text-[15px]"
                            style={{ color: theme.textSoft }}
                        >
                            {copy.aboutSubtitle}
                        </p>
                        <div
                            className="mt-6 h-px w-full"
                            style={{ backgroundColor: theme.divider }}
                        />
                    </section>

                    <section className="mt-12" style={sectionStyle}>
                        <p
                            className="text-xs tracking-[0.16em]"
                            style={{ color: theme.accent }}
                        >
                            {copy.heroLabel}
                        </p>
                        <h2 className="mt-3 text-[1.85rem] md:text-[2rem] font-medium tracking-tight">
                            {copy.heroTitle}
                        </h2>
                        <p
                            className="mt-4 max-w-[920px] text-sm md:text-[15px] leading-7"
                            style={{ color: theme.textSoft }}
                        >
                            {copy.heroDescription}
                        </p>
                    </section>

                    <section
                        className="grid grid-cols-1 lg:grid-cols-3"
                        style={{ marginTop: "2rem", gap: "1rem" }}
                    >
                        {copy.features.map((feature) => (
                            <article
                                key={feature.title}
                                className="rounded-sm"
                                style={{ ...cardStyle, padding: "1.5rem" }}
                            >
                                <h3 className="text-lg font-medium leading-6">
                                    {feature.title}
                                </h3>
                                <p
                                    className="mt-3 text-sm leading-7"
                                    style={{ color: theme.textSoft }}
                                >
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section
                        style={{ ...sectionStyle, marginTop: "3rem" }}
                    >
                        <p
                            className="text-xs tracking-[0.16em]"
                            style={{ color: theme.accent }}
                        >
                            {copy.monitoringLabel}
                        </p>
                        <h2 className="mt-3 text-[1.65rem] font-medium tracking-tight">
                            {copy.monitoringTitle}
                        </h2>

                        <div
                            className="rounded-sm"
                            style={{
                                ...strongCardStyle,
                                marginTop: "1.5rem",
                                padding: "1.5rem",
                            }}
                        >
                            <div
                                className="grid grid-cols-1 md:grid-cols-3"
                                style={{ gap: "1.25rem" }}
                            >
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{ color: theme.textMuted }}
                                    >
                                        {copy.metricFlowLogs}
                                    </p>
                                    <p className="mt-3 text-[1.75rem] font-semibold tracking-tight">
                                        12,486
                                    </p>
                                </div>

                                <div>
                                    <p
                                        className="text-sm"
                                        style={{ color: theme.textMuted }}
                                    >
                                        {copy.metricAttackRisk}
                                    </p>
                                    <p
                                        className="mt-3 text-[1.75rem] font-semibold tracking-tight"
                                        style={{ color: theme.danger }}
                                    >
                                        0.9862
                                    </p>
                                </div>

                                <div>
                                    <p
                                        className="text-sm"
                                        style={{ color: theme.textMuted }}
                                    >
                                        {copy.metricProjects}
                                    </p>
                                    <p className="mt-3 text-[1.75rem] font-semibold tracking-tight">
                                        04
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        style={{ ...sectionStyle, marginTop: "3rem" }}
                    >
                        <p
                            className="text-xs tracking-[0.16em]"
                            style={{ color: theme.accent }}
                        >
                            {copy.keyCapabilitiesLabel}
                        </p>

                        <div
                            className="grid grid-cols-1 md:grid-cols-2"
                            style={{ marginTop: "2rem", gap: "1rem" }}
                        >
                            {copy.capabilities.map((capability) => (
                                <article
                                    key={capability.title}
                                    className="rounded-sm"
                                    style={{ ...cardStyle, padding: "1.5rem" }}
                                >
                                    <h3 className="text-lg font-medium leading-6">
                                        {capability.title}
                                    </h3>
                                    <p
                                        className="mt-3 text-sm leading-7"
                                        style={{ color: theme.textSoft }}
                                    >
                                        {capability.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
