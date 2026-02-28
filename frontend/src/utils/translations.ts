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
        selectProject: "Select Project",
        
        // Login
        login: "Login",
        loginTitle: "Network Security System",
        loginSubtitle: "Sign in to access the intrusion detection dashboard",
        username: "Username",
        password: "Password",
        signIn: "Sign In",
        loggingIn: "Logging in...",
        loginFailed: "Login failed. Please check your credentials.",
        logout: "Logout",
        
        // Sign Up
        signUp: "Sign Up",
        signUpTitle: "Create Account",
        signUpSubtitle: "Register to access the intrusion detection system",
        fullName: "Full Name",
        email: "Email",
        confirmPassword: "Confirm Password",
        phoneNumber: "Phone Number",
        verificationCode: "Verification Code",
        requestCode: "Request Code",
        requestingCode: "Requesting...",
        codeRequested: "Verification code sent",
        signingUp: "Creating account...",
        signUpFailed: "Sign up failed. Please try again.",
        signUpSuccess: "Account created successfully!",
        passwordMismatch: "Passwords do not match",
        required: "Required",
        optional: "Optional",
        
        // Terms and Agreements
        agreeAll: "I agree to all terms and conditions",
        termsOfService: "Terms of Service",
        privacyPolicy: "Privacy Policy",
        marketingConsent: "Marketing Information Consent",
        viewDetails: "View Details",
        mustAgreeRequired: "You must agree to required terms",
        
        // Account
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        backToLogin: "Back to Login",
        
        // API Key Management
        apiKeyManagement: "API Key Management",
        apiKeyManagementDesc: 
            "Manage API keys for programmatic access to the NIDS system",
        generateApiKey: "Generate API Key",
        regenerateApiKey: "Regenerate API Key",
        revokeApiKey: "Revoke API Key",
        copyApiKey: "Copy API Key",
        apiKeyCopied: "API Key copied to clipboard",
        apiKeyActive: "Active",
        apiKeyRevoked: "Revoked",
        apiKeyCreatedAt: "Created at",
        apiKeyLastUsed: "Last used",
        apiKeyNever: "Never",
        apiKeyUsageInfo: 
            "Use this API key to authenticate API requests. " +
            "Keep it secure and never share it publicly.",
        apiKeyWarning: 
            "Warning: Regenerating or revoking this key will " +
            "invalidate the current key immediately.",
        noApiKey: "No API key generated yet",
        noApiKeyDesc: 
            "Generate an API key to enable programmatic access to the system.",
        confirmRegenerate: "Are you sure you want to regenerate this API key?",
        confirmRevoke: "Are you sure you want to revoke this API key?",
        
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
        searchAlerts: "Search IP, Protocol...",
        all: "All",
        
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
        reset: "Reset",
        apply: "Apply",
        version: "v1.0.0 | AI-Powered Detection",
        
        // Session Management
        saveSession: "Save Session",
        sessionName: "Session Name",
        sessionNamePlaceholder: "e.g., DDoS Attack Analysis - Feb 25",
        description: "Description",
        descriptionPlaceholder: "Add notes about this session...",
        tags: "Tags",
        addTag: "Add tag...",
        save: "Save",
        cancel: "Cancel",
        sessionManagement: "Session Management",
        savedSessions: "Saved Sessions",
        noSavedSessions: "No saved sessions yet",
        loadSession: "Load Session",
        deleteSession: "Delete Session",
        exportSession: "Export Session",
        importSession: "Import Session",
        exportAll: "Export All",
        deleteConfirm: "Are you sure you want to delete this session?",
        sessionSaved: "Session saved successfully",
        sessionLoaded: "Session loaded successfully",
        sessionDeleted: "Session deleted successfully",
        sessionExported: "Session exported successfully",
        sessionImported: "Session imported successfully",
        selectFile: "Select JSON file",
        createdAt: "Created",
        alertsCount: "Alerts",
        attack: "Attack",
        suspicious: "Suspicious",
        normal: "Normal",
        
        // Detection Detail Page
        backToDashboard: "Back to Dashboard",
        alertDetails: "Alert Details",
        networkInformation: "Network Information",
        trafficMetrics: "Traffic Metrics",
        detectionAnalysis: "Detection Analysis",
        packetDataSample: "Packet Data (Sample)",
        detectionScore: "Detection Score",
        modelVersion: "Model Version",
        confidence: "Confidence",
        classification: "Classification",
        attackDetected: "Attack Detected",
        suspiciousActivity: "Suspicious Activity",
        attackMessage: "This flow has been classified as malicious. Immediate action recommended.",
        suspiciousMessage: "This flow exhibits unusual patterns. Further investigation required.",
        loadingAlertDetails: "Loading alert details...",
        alertNotFound: "Alert not found",
        avgPacketSize: "Avg Packet Size",
        duration: "Duration",
        port: "Port",
        
        // Settings Page - Additional
        currentApiKey: "Current API Key",
        copyKey: "Copy Key",
        copied: "Copied",
        regenerateKey: "Regenerate Key",
        deactivate: "Deactivate",
        activate: "Activate",
        noApiKeyGenerated: "No API key generated yet",
        preferences: "Preferences",
        language: "Language",
        interfaceLanguage: "Interface display language",
        autoRefresh: "Auto-refresh",
        dashboardUpdateInterval: "Dashboard update interval",
        alertThreshold: "Alert Threshold",
        minimumScoreForAlerts: "Minimum score for alerts",
        dataRetention: "Data Retention",
        alertHistoryDuration: "Alert history duration",
    },
    ko: {
        // App Navigation
        dashboard: "대시보드",
        detectionDetail: "탐지 상세",
        settings: "설정",
        networkSecurity: "네트워크 보안",
        selectProject: "프로젝트 선택",
        
        // Login
        login: "로그인",
        loginTitle: "네트워크 보안 시스템",
        loginSubtitle: "침입 탐지 대시보드에 접근하려면 로그인하세요",
        username: "사용자 이름",
        password: "비밀번호",
        signIn: "로그인",
        loggingIn: "로그인 중...",
        loginFailed: "로그인 실패. 자격 증명을 확인하세요.",
        logout: "로그아웃",
        
        // Sign Up
        signUp: "회원가입",
        signUpTitle: "계정 생성",
        signUpSubtitle: "침입 탐지 시스템에 접근하려면 등록하세요",
        fullName: "이름",
        email: "이메일",
        confirmPassword: "비밀번호 확인",
        phoneNumber: "전화번호",
        verificationCode: "인증 코드",
        requestCode: "코드 요청",
        requestingCode: "요청 중...",
        codeRequested: "증 코드가 전송되었습니다",
        signingUp: "계정 생성 중...",
        signUpFailed: "회원가입 실패. 다시 시도하세요.",
        signUpSuccess: "계정이 성공적으로 생성되었습니다!",
        passwordMismatch: "비밀번호가 일치하지 않습니다",
        required: "필수",
        optional: "선택 사항",
        
        // Terms and Agreements
        agreeAll: "모든 약관에 동의합니다",
        termsOfService: "서비스 이용 약관",
        privacyPolicy: "개인 정보 보호 정책",
        marketingConsent: "마케팅 정보 수신 동의",
        viewDetails: "자세히 보기",
        mustAgreeRequired: "필수 약관에 동의해야 합니다",
        
        // Account
        alreadyHaveAccount: "이미 계정이 있으신가요?",
        dontHaveAccount: "정이 없으신가요?",
        backToLogin: "로그인으로 돌아가기",
        
        // API Key Management
        apiKeyManagement: "API 키 관리",
        apiKeyManagementDesc: "NIDS 시스템에 프로그래밍 방식으로 액세스하기 위한 API 키 관리",
        generateApiKey: "API 키 생성",
        regenerateApiKey: "API 키 재생성",
        revokeApiKey: "API 키 폐기",
        copyApiKey: "API 키 복사",
        apiKeyCopied: "클립보드에 API 키 복사",
        apiKeyActive: "활성화됨",
        apiKeyRevoked: "폐기됨",
        apiKeyCreatedAt: "생성됨",
        apiKeyLastUsed: "마지막 사용됨",
        apiKeyNever: "사용되지 않음",
        apiKeyUsageInfo: "API 요청을 인증하기 위해 이 API 키를 사용하세요. 안전하게 유지하고 공개적으로 공유하지 마세요.",
        apiKeyWarning: "주의: 이 키를 재생성하거나 폐기하면 현재 키가 즉시 무효화됩니다.",
        noApiKey: "아직 생성된 API 키가 없습니다",
        noApiKeyDesc: "시스템에 프로그래밍 방식으로 액세스할 수 있도록 API 키를 생성하세요.",
        confirmRegenerate: "이 API 키를 재생성하시겠습니까?",
        confirmRevoke: "이 API 키를 폐기하시겠습니까?",
        
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
        searchAlerts: "IP, 프로토콜 검색...",
        all: "모두",
        
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
        unauthorizedSSH: "무단 SSH 접",
        
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
        detectionSensitivityDesc: "AI 모델의 이상 탐지 계값 조정",
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
        reset: "초기화",
        apply: "적용",
        version: "v1.0.0 | AI 기반 탐지",
        
        // Session Management
        saveSession: "세션 저장",
        sessionName: "세션 이름",
        sessionNamePlaceholder: "예: DDoS 공격 분석 - 2월 25일",
        description: "설명",
        descriptionPlaceholder: "이 세션에 대한 노트를 추가하세요...",
        tags: "태그",
        addTag: "태그 추가...",
        save: "저장",
        cancel: "취소",
        sessionManagement: "세션 관리",
        savedSessions: "저장된 세션",
        noSavedSessions: "아직 저장된 세션이 없습니다",
        loadSession: "세션 로드",
        deleteSession: "세션 삭제",
        exportSession: "세션 내보내",
        importSession: "세션 가져오기",
        exportAll: "모두 내보내기",
        deleteConfirm: "이 세션을 삭제하시겠습니까?",
        sessionSaved: "세션이 성공적으로 저장되었습니다",
        sessionLoaded: "세션이 성공적으로 로드되었습니다",
        sessionDeleted: "세션이 성공적으로 삭제되었습니다",
        sessionExported: "세션이 성공적으로 내보내졌습니다",
        sessionImported: "세션이 성공적으로 가져왔습니다",
        selectFile: "JSON 파일 선택",
        createdAt: "생성됨",
        alertsCount: "알림 수",
        attack: "공격",
        suspicious: "의심",
        normal: "정상",
        
        // Detection Detail Page
        backToDashboard: "대시보드로 돌아가기",
        alertDetails: "알림 세부 정보",
        networkInformation: "네트워크 정보",
        trafficMetrics: "트래픽 지표",
        detectionAnalysis: "탐지 분석",
        packetDataSample: "패킷 데이터 (샘플)",
        detectionScore: "탐지 점수",
        modelVersion: "모델 버전",
        confidence: "신뢰도",
        classification: "분류",
        attackDetected: "공격 탐지됨",
        suspiciousActivity: "의심스러운 활동",
        attackMessage: "이 플로우는 악의적인 것으로 분류되었습니다. 즉각적인 조치가 권장됩니다.",
        suspiciousMessage: "이 플로우는 비정상적인 패턴을 보입니다. 추가 조사가 필요합니다.",
        loadingAlertDetails: "알림 세부 정보 로딩 중...",
        alertNotFound: "알림을 찾을 수 없습니다",
        avgPacketSize: "평균 패킷 크기",
        duration: "지속 시간",
        port: "포트",
        
        // Settings Page - Additional
        currentApiKey: "현재 API 키",
        copyKey: "키 복사",
        copied: "복사됨",
        regenerateKey: "키 재생성",
        deactivate: "비활성화",
        activate: "활성화",
        noApiKeyGenerated: "아직 생성된 API 키가 없습니다",
        preferences: "환경 설정",
        language: "언어",
        interfaceLanguage: "인터페이스 표시 언어",
        autoRefresh: "자동 새로고침",
        dashboardUpdateInterval: "대시보드 업데이트 간격",
        alertThreshold: "알림 임계값",
        minimumScoreForAlerts: "알림을 위한 최소 점수",
        dataRetention: "데이터 보존",
        alertHistoryDuration: "알림 기록 보존 기간",
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