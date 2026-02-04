/**
 * Translation data for the NIDS application.
 * Supports English and Korean languages.
 */

export type Language = "en" | "ko";

interface Translations {
    en: Record<string, string>;
    ko: Record<string, string>;
}

/**
 * All application text strings in English and Korean.
 */
export const translations: Translations = {
    en: {
        // App Navigation
        dashboard: "Dashboard",
        detectionDetail: "Detection Detail",
        settings: "Settings",
        networkSecurity: "Network Security",
        
        // Dashboard
        nidsTitle: "Network Intrusion Detection System",
        nidsSubtitle: "AI-powered real-time threat monitoring and analysis",
        totalFlows: "Total Flows",
        attacksDetected: "Attacks Detected",
        suspiciousFlows: "Suspicious Flows",
        accuracy: "Accuracy",
        fromLastHour: "+12% from last hour",
        criticalAttention: "Critical attention required",
        underInvestigation: "Under investigation",
        modelConfidence: "Model confidence",
        trafficDistribution: "Traffic Distribution",
        realTimeAlerts: "Real-Time Alerts",
        live: "Live",
        
        // Table Headers
        time: "Time",
        sourceIP: "Source IP",
        destinationIP: "Destination IP",
        protocolPort: "Protocol/Port",
        bytes: "Bytes",
        score: "Score",
        status: "Status",
        
        // Status
        normal: "Normal",
        suspicious: "Suspicious",
        attack: "Attack",
        
        // Loading and Error States
        loadingAlerts: "Loading alerts...",
        loadingTrafficData: "Loading traffic data...",
        errorLoadingAlerts: "Failed to load alerts",
        errorLoadingTraffic: "Failed to load traffic data",
        noAlertsFound: "No alerts found",
        
        // Detection Detail
        detectionDetailTitle: "Detection Detail",
        detectionDetailSubtitle: 
            "Comprehensive analysis of detected security threat",
        blockIP: "Block IP",
        monitor: "Monitor",
        addToInvestigation: "Add to Investigation",
        protocol: "Protocol",
        totalBytes: "Total Bytes",
        anomalyScore: "Anomaly Score",
        trafficTimeline: "Traffic Timeline",
        bytesTransferred: "Bytes Transferred",
        detailedFlowLog: "Detailed Flow Log",
        timestamp: "Timestamp",
        sourcePort: "Source Port",
        destPort: "Dest Port",
        flags: "Flags",
        packets: "Packets",
        action: "Action",
        logged: "Logged",
        blocked: "Blocked",
        
        // Risk Levels
        critical: "Critical",
        high: "High",
        medium: "Medium",
        low: "Low",
        
        // Attack Types
        sqlInjection: "SQL Injection Attempt",
        bruteForce: "Brute Force Attack",
        unauthorizedSSH: "Unauthorized SSH Access",
        
        // Settings
        settingsTitle: "Settings",
        settingsSubtitle: 
            "Configure detection parameters and system behavior",
        systemLogging: "System Logging",
        systemLoggingDesc: 
            "Control how the system captures and stores network flow data",
        automaticLogging: "Automatic Logging",
        automaticLoggingDesc: 
            "Automatically log all network flows for analysis and auditing",
        realtimeNotifications: "Real-time Admin Notifications",
        realtimeNotificationsDesc: 
            "Send instant notifications to administrators when threats " +
            "are detected",
        detectionSensitivity: "Detection Sensitivity",
        detectionSensitivityDesc: 
            "Adjust the anomaly detection threshold for the AI model",
        anomalyThreshold: "Anomaly Detection Threshold",
        anomalyThresholdDesc: 
            "Flows with scores above this threshold will be flagged as " +
            "suspicious",
        lowSensitivity: "Low Sensitivity",
        highSensitivity: "High Sensitivity",
        automationRules: "Automation Rules",
        automationRulesDesc: 
            "Configure automated responses to detected threats",
        alertTrigger: "Alert Trigger Threshold",
        alertTriggerDesc: 
            "Automatically trigger alerts when anomaly score exceeds " +
            "this value",
        autoIPBlocking: "Automatic IP Blocking",
        autoIPBlockingDesc: 
            "Automatically block source IPs when critical threat " +
            "threshold is exceeded",
        autoBlockThreshold: "Auto-block Threshold",
        autoBlockWarning: 
            "Caution: Automatic blocking may affect legitimate traffic. " +
            "Use with care.",
        languagePreference: "Language Preference",
        languagePreferenceDesc: 
            "Select your preferred language for the interface",
        english: "English",
        korean: "한국어",
        resetToDefaults: "Reset to Defaults",
        saveSettings: "Save Settings",
        version: "v1.0.0 | AI-Powered Detection",
    },
    ko: {
        // App Navigation
        dashboard: "대시보드",
        detectionDetail: "탐지 상세",
        settings: "설정",
        networkSecurity: "네트워크 보안",
        
        // Dashboard
        nidsTitle: "네트워크 침입 탐지 시스템",
        nidsSubtitle: "AI 기반 실시간 위협 모니터링 및 분석",
        totalFlows: "총 플로우",
        attacksDetected: "탐지된 공격",
        suspiciousFlows: "의심스러운 플로우",
        accuracy: "정확도",
        fromLastHour: "지난 시간 대비 +12%",
        criticalAttention: "긴급 조치 필요",
        underInvestigation: "조사 중",
        modelConfidence: "모델 신뢰도",
        trafficDistribution: "트래픽 분포",
        realTimeAlerts: "실시간 알림",
        live: "실시간",
        
        // Table Headers
        time: "시간",
        sourceIP: "출발지 IP",
        destinationIP: "목적지 IP",
        protocolPort: "프로토콜/포트",
        bytes: "바이트",
        score: "점수",
        status: "상태",
        
        // Status
        normal: "정상",
        suspicious: "의심",
        attack: "공격",
        
        // Loading and Error States
        loadingAlerts: "알림 로딩 중...",
        loadingTrafficData: "트래픽 데이터 로딩 중...",
        errorLoadingAlerts: "알림 로딩 실패",
        errorLoadingTraffic: "트래픽 데이터 로딩 실패",
        noAlertsFound: "알림이 없습니다",
        
        // Detection Detail
        detectionDetailTitle: "탐지 상세 정보",
        detectionDetailSubtitle: "탐지된 보안 위협에 대한 종합 분석",
        blockIP: "IP 차단",
        monitor: "모니터링",
        addToInvestigation: "조사 항목에 추가",
        protocol: "프로토콜",
        totalBytes: "총 바이트",
        anomalyScore: "이상 점수",
        trafficTimeline: "트래픽 타임라인",
        bytesTransferred: "전송된 바이트",
        detailedFlowLog: "상세 플로우 로그",
        timestamp: "타임스탬프",
        sourcePort: "출발지 포트",
        destPort: "목적지 포트",
        flags: "플래그",
        packets: "패킷",
        action: "조치",
        logged: "기록됨",
        blocked: "차단됨",
        
        // Risk Levels
        critical: "긴급",
        high: "높음",
        medium: "보통",
        low: "낮음",
        
        // Attack Types
        sqlInjection: "SQL 인젝션 시도",
        bruteForce: "무차별 대입 공격",
        unauthorizedSSH: "무단 SSH 접근",
        
        // Settings
        settingsTitle: "설정",
        settingsSubtitle: "탐지 매개변수 및 시스템 동작 구성",
        systemLogging: "시스템 로깅",
        systemLoggingDesc: "시스템이 네트워크 플로우 데이터를 캡처하고 저장하는 방법 제어",
        automaticLogging: "자동 로깅",
        automaticLoggingDesc: "분석 및 감사를 위해 모든 네트워크 플로우를 자동으로 기록",
        realtimeNotifications: "실시간 관리자 알림",
        realtimeNotificationsDesc: "위협이 탐지되면 관리자에게 즉시 알림 전송",
        detectionSensitivity: "탐지 민감도",
        detectionSensitivityDesc: "AI 모델의 이상 탐지 임계값 조정",
        anomalyThreshold: "이상 탐지 임계값",
        anomalyThresholdDesc: "이 임계값을 초과하는 점수를 가진 플로우는 의심스러운 것으로 표시됩니다",
        lowSensitivity: "낮은 민감도",
        highSensitivity: "높은 민감도",
        automationRules: "자동화 규칙",
        automationRulesDesc: "탐지된 위협에 대한 자동 응답 구성",
        alertTrigger: "경고 트리거 임계값",
        alertTriggerDesc: "이상 점수가 이 값을 초과하면 자동으로 경고 발생",
        autoIPBlocking: "자동 IP 차단",
        autoIPBlockingDesc: "긴급 위협 임계값을 초과하면 출발지 IP를 자동으로 차단",
        autoBlockThreshold: "자동 차단 임계값",
        autoBlockWarning: "주의: 자동 차단은 정상 트래픽에 영향을 줄 수 있습니다. 주의해서 사용하세요.",
        languagePreference: "언어 설정",
        languagePreferenceDesc: "인터페이스에 사용할 언어를 선택하세요",
        english: "English",
        korean: "한국어",
        resetToDefaults: "기본값으로 재설정",
        saveSettings: "설정 저장",
        version: "v1.0.0 | AI 기반 탐지",
    },
};

/**
 * Gets the translated text for a given key and language.
 * 
 * @param {string} key - The translation key
 * @param {Language} language - The target language
 * @returns {string} The translated text
 */
export function translate(key: string, language: Language): string {
    return translations[language][key] || translations.en[key] || key;
}