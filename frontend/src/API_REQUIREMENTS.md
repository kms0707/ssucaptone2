# 🔌 Backend API Requirements for NIDS Dashboard

## 📌 Overview
프론트엔드는 **자동 Mock 폴백 시스템**을 사용하므로, 백엔드 API가 없어도 정상 동작합니다.  
백엔드 개발자는 아래 명세에 맞춰 API를 구현하면 됩니다.

---

## 🌐 Base URL
```
/api
```

---

## 📡 Required API Endpoints

### 1️⃣ GET `/api/alerts`
**실시간 알림 데이터 조회**

#### Response (200 OK)
```json
{
    "alerts": [
        {
            "id": "string",
            "sourceIP": "string",
            "destIP": "string", 
            "protocol": "string",
            "bytes": number,
            "score": number,
            "status": "Normal" | "Suspicious" | "Attack",
            "timestamp": "string"
        }
    ],
    "totalCount": number,
    "lastUpdated": "ISO 8601 timestamp"
}
```

#### 예시
```json
{
    "alerts": [
        {
            "id": "1",
            "sourceIP": "192.168.1.45",
            "destIP": "10.0.0.12",
            "protocol": "TCP/443",
            "bytes": 2048,
            "score": 0.95,
            "status": "Attack",
            "timestamp": "14:23:45"
        },
        {
            "id": "2",
            "sourceIP": "172.16.0.55",
            "destIP": "10.0.0.18",
            "protocol": "UDP/53",
            "bytes": 512,
            "score": 0.23,
            "status": "Normal",
            "timestamp": "14:23:42"
        }
    ],
    "totalCount": 2,
    "lastUpdated": "2024-02-25T14:23:45.000Z"
}
```

#### 중요 사항
- `timestamp` 형식: `"HH:MM:SS"` (예: `"14:23:45"`)
- `score` 범위: `0.0 ~ 1.0`
- `status`: 정확히 `"Normal"`, `"Suspicious"`, `"Attack"` 중 하나
- 프론트엔드는 **2초마다 폴링**하여 새로운 알림을 가져옵니다

---

### 2️⃣ GET `/api/kpis`
**대시보드 핵심 지표 조회**

#### Response (200 OK)
```json
{
    "totalFlows": number,
    "attacksDetected": number,
    "suspiciousFlows": number,
    "accuracy": number,
    "lastUpdated": "ISO 8601 timestamp"
}
```

#### 예시
```json
{
    "totalFlows": 1248,
    "attacksDetected": 2,
    "suspiciousFlows": 1,
    "accuracy": 98.4,
    "lastUpdated": "2024-02-25T14:23:45.000Z"
}
```

#### 중요 사항
- `accuracy`: 퍼센트 값 (0 ~ 100)
- 프론트엔드는 실제로 **alerts 데이터에서 자동 계산**하므로, 이 엔드포인트는 선택적입니다

---

### 3️⃣ GET `/api/traffic/distribution`
**트래픽 분포 통계 조회**

#### Response (200 OK)
```json
{
    "categories": [
        {
            "name": "string",
            "value": number,
            "color": "string"
        }
    ],
    "totalFlows": number,
    "lastUpdated": "ISO 8601 timestamp"
}
```

#### 예시
```json
{
    "categories": [
        {
            "name": "Normal",
            "value": 1245,
            "color": "#14b8a6"
        },
        {
            "name": "Suspicious",
            "value": 1,
            "color": "#fb923c"
        },
        {
            "name": "Attack",
            "value": 2,
            "color": "#ef4444"
        }
    ],
    "totalFlows": 1248,
    "lastUpdated": "2024-02-25T14:23:45.000Z"
}
```

#### 중요 사항
- 프론트엔드는 실제로 **alerts 데이터에서 자동 계산**하므로, 이 엔드포인트는 선택적입니다

---

## 🔄 Polling Behavior

프론트엔드는 **모니터링이 활성화된 경우** 다음과 같이 자동 폴링합니다:

- 폴링 간격: **2초** (`POLLING_INTERVAL = 2000ms`)
- 폴링 대상:
  - `/api/alerts` - 매 2초마다 호출
  - `/api/kpis` - 매 2초마다 호출 (선택적)
- 새 알림은 **자동으로 누적**되며, **중복 제거** 처리됨
- 타임아웃: **5초** (`REQUEST_TIMEOUT = 5000ms`)

---

## 🛡️ Error Handling

### API 실패 시 자동 Mock 폴백
모든 API 호출 실패 시 프론트엔드는 **자동으로 Mock 데이터를 사용**합니다:

```typescript
// Example: fetchAlerts 실패 시
catch (err) {
    const mockAlerts = getMockAlerts();
    return {
        alerts: mockAlerts,
        totalCount: mockAlerts.length,
        lastUpdated: new Date().toISOString(),
    };
}
```

### 권장 HTTP 상태 코드
- `200 OK` - 성공
- `400 Bad Request` - 잘못된 요청
- `401 Unauthorized` - 인증 실패
- `500 Internal Server Error` - 서버 오류

---

## 🔐 Authentication (현재 미구현)

현재 프론트엔드는 **로컬 인증 시스템**을 사용하며, 백엔드 인증과 연동되지 않습니다.

향후 백엔드 연동 시 권장 사항:
- JWT 토큰 방식 사용
- `Authorization: Bearer <token>` 헤더 추가
- 로그인 API: `POST /api/auth/login`
- 토큰 갱신 API: `POST /api/auth/refresh`

---

## 💾 Session Management (로컬 전용)

**세션 저장/불러오기 기능은 현재 브라우저 localStorage에만 저장됩니다.**

백엔드 연동이 필요하지 **않습니다**. 향후 요구사항 발생 시 추가 API 설계 필요.

---

## 📝 TypeScript Types (Reference)

```typescript
// Alert 타입
export interface Alert {
    id: string;
    sourceIP: string;
    destIP: string;
    protocol: string;
    bytes: number;
    score: number;
    status: "Normal" | "Suspicious" | "Attack";
    timestamp: string;
}

// KPI 타입
export interface KPIData {
    totalFlows: number;
    attacksDetected: number;
    suspiciousFlows: number;
    accuracy: number;
    lastUpdated: string;
}

// Traffic Category 타입
export interface TrafficCategory {
    name: string;
    value: number;
    color: string;
}
```

---

## ✅ 구현 우선순위

### 필수 (P0)
1. `GET /api/alerts` - 실시간 알림 데이터 **반드시 필요**

### 선택 (P1)
2. `GET /api/kpis` - 프론트엔드가 자동 계산하므로 선택적
3. `GET /api/traffic/distribution` - 프론트엔드가 자동 계산하므로 선택적

### 미래 (P2)
- 백엔드 인증 연동
- 세션 데이터 서버 저장

---

## 🚨 변경 사항 (Session Management 추가)

**이전 대비 변경 없음**

Session Management 기능이 추가되었지만, **모두 로컬 스토리지로 처리**되므로 백엔드에 추가 API 요청이 없습니다.

---

## 📞 Contact

API 구현 중 질문 사항이 있으면 프론트엔드 팀에 문의하세요.
