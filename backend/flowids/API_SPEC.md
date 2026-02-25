# Flowids API 명세서

베이스 URL: `http://localhost:8080`

모든 응답은 공통 래퍼를 사용합니다.

```json
{
  "status": 200,
  "message": "success",
  "data": {}
}
```

## 인증

- 인증 필요 API는 `Authorization: Bearer <accessToken>` 헤더 필요
- 공개 API: `POST /api/v1/auth/**`, `POST /api/v1/logs`

## 에러 응답

### Validation 실패

```json
{
  "status": 400,
  "message": "validation failed",
  "data": {
    "fieldName": "에러 메시지"
  }
}
```

### 일반 에러 (예: 잘못된 요청/리소스 없음/인증 실패)

```json
{
  "status": 400,
  "message": "에러 메시지",
  "data": null
}
```

상태 코드는 상황에 따라 `400`, `401`, `404`를 사용합니다.

---

## Auth

### 로그인

`POST /api/v1/auth/login`

요청

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

응답 `200`

```json
{
  "status": 200,
  "message": "success",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer"
  }
}
```

---

## 회원 (Member)

### 회원가입

`POST /api/v1/auth/signup`

요청

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

요청 제약

- `email`: 이메일 형식, 필수
- `password`: 최소 8자, 필수
- `name`: 최대 100자, 필수

응답 `201`

```json
{
  "status": 201,
  "message": "created",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2026-02-25T12:34:56",
    "updatedAt": "2026-02-25T12:34:56"
  }
}
```

### 회원 단건 조회 (인증 필요)

`GET /api/v1/members/{id}`

응답 `200`

```json
{
  "status": 200,
  "message": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2026-02-25T12:34:56",
    "updatedAt": "2026-02-25T12:34:56"
  }
}
```

### 회원 정보 수정 (인증 필요)

`PUT /api/v1/members/{id}`

요청 (둘 중 하나 또는 둘 다)

```json
{
  "name": "새 이름",
  "password": "newpassword123"
}
```

요청 제약

- `name`: 최대 100자
- `password`: 최소 8자

응답 `200`

```json
{
  "status": 200,
  "message": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "새 이름",
    "createdAt": "2026-02-25T12:34:56",
    "updatedAt": "2026-02-25T13:00:00"
  }
}
```

### 회원 탈퇴 (인증 필요)

`DELETE /api/v1/members/{id}`

응답 `204`

```json
{
  "status": 204,
  "message": "no content",
  "data": null
}
```

---

## 프로젝트 (Project)

### 프로젝트 생성 (인증 필요)

`POST /api/v1/projects`

요청

```json
{
  "name": "프로젝트 이름",
  "description": "설명"
}
```

요청 제약

- `name`: 필수, 최대 100자
- `description`: 선택, 최대 500자

응답 `201`

```json
{
  "status": 201,
  "message": "created",
  "data": {
    "id": 1,
    "name": "프로젝트 이름",
    "description": "설명",
    "apiKey": "<hex 64 chars>",
    "apiKeyStatus": "ACTIVE",
    "apiKeyCreatedAt": "2026-02-25T12:34:56",
    "createdAt": "2026-02-25T12:34:56"
  }
}
```

### 내 프로젝트 목록 (인증 필요)

`GET /api/v1/projects`

응답 `200`

```json
{
  "status": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "프로젝트 이름",
      "description": "설명",
      "apiKey": "<hex 64 chars>",
      "apiKeyStatus": "ACTIVE",
      "apiKeyCreatedAt": "2026-02-25T12:34:56",
      "createdAt": "2026-02-25T12:34:56"
    }
  ]
}
```

### API Key 재발급 (인증 필요)

`POST /api/v1/projects/{id}/api-key/reissue?reason=수동 재발급`

- `reason` 쿼리 파라미터는 선택이며 기본값은 `수동 재발급`

응답 `200`

```json
{
  "status": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "프로젝트 이름",
    "description": "설명",
    "apiKey": "<new hex 64 chars>",
    "apiKeyStatus": "ACTIVE",
    "apiKeyCreatedAt": "2026-02-25T12:34:56",
    "createdAt": "2026-02-25T12:00:00"
  }
}
```

---

## 로그 수집 (Flow Logs)

### 로그 수집

`POST /api/v1/logs`

헤더

- `X-API-KEY: <project apiKey>`

요청 (배열, 49개 AI Feature)

```json
[
  {
    "srcIp": "192.168.1.10",
    "dstIp": "8.8.8.8",
    "srcPort": 54321,
    "dstPort": 443,
    "protocol": 6,
    "inBytes": 1500,
    "inPkts": 10,
    "outBytes": 800,
    "outPkts": 8,
    "tcpFlags": 24,
    "clientTcpFlags": 2,
    "serverTcpFlags": 18,
    "flowDuration": 350,
    "durationIn": 120,
    "durationOut": 230,
    "minTtl": 64,
    "maxTtl": 128,
    "longestFlowPkt": 1460,
    "shortestFlowPkt": 40,
    "minIpPktLen": 40,
    "maxIpPktLen": 1500,
    "srcToDstSecondBytes": 750.5,
    "dstToSrcSecondBytes": 400.2,
    "retransmittedInBytes": 0,
    "retransmittedInPkts": 0,
    "retransmittedOutBytes": 0,
    "retransmittedOutPkts": 0,
    "srcToDstAvgThroughput": 34133.3,
    "dstToSrcAvgThroughput": 18285.7,
    "numPktsUpTo128Bytes": 6,
    "numPkts128To256Bytes": 2,
    "numPkts256To512Bytes": 1,
    "numPkts512To1024Bytes": 1,
    "numPkts1024To1514Bytes": 0,
    "tcpWinMaxIn": 65535,
    "tcpWinMaxOut": 65535,
    "icmpType": 0,
    "icmpIpv4Type": 0,
    "dnsQueryId": 0,
    "dnsQueryType": 0,
    "dnsTtlAnswer": 0,
    "ftpCommandRetCode": 0,
    "srcToDstIatMin": 1000,
    "srcToDstIatMax": 50000,
    "srcToDstIatAvg": 12500.0,
    "srcToDstIatStddev": 8200.5,
    "dstToSrcIatMin": 2000,
    "dstToSrcIatMax": 45000,
    "dstToSrcIatAvg": 9300.0,
    "dstToSrcIatStddev": 7100.3
  }
]
```

필수 필드

- `srcIp`, `dstIp`, `srcPort`, `dstPort`, `protocol`, `inBytes`, `inPkts`

응답 `202`

```json
{
  "status": 202,
  "message": "accepted",
  "data": null
}
```

---

### 로그 목록 조회 (인증 필요)

`GET /api/v1/logs?projectId=1&page=0&size=20&onlyAnomalies=false`

쿼리 파라미터

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| projectId | Long | Y | - | 조회할 프로젝트 ID |
| page | int | N | 0 | 페이지 번호 (0부터 시작) |
| size | int | N | 20 | 페이지당 항목 수 |
| onlyAnomalies | boolean | N | false | true 시 이상 탐지 로그만 조회 |

응답 `200`

```json
{
  "status": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": "abc123",
        "projectId": "1",
        "ingestedAt": "2026-02-25T13:00:00Z",
        "srcIp": "192.168.1.10",
        "dstIp": "8.8.8.8",
        "srcPort": 54321,
        "dstPort": 443,
        "protocol": 6,
        "inBytes": 1500,
        "inPkts": 10,
        "outBytes": 800,
        "outPkts": 8,
        "flowDuration": 350,
        "tcpFlags": 24,
        "isAnomaly": false,
        "anomalyScore": 0.0
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "number": 0,
    "size": 20
  }
}
```

에러 응답

- `403`: 본인 소유가 아닌 프로젝트 조회 시
