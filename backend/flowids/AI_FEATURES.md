# AI Feature 명세서

에이전트가 수집하여 AI 분석 서버로 전달하는 49개 네트워크 플로우 피처 목록입니다.

## 데이터 흐름

```
에이전트 (camelCase JSON)
  └→ POST /api/v1/logs
       └→ Kafka: raw-flow-logs  → Elasticsearch 저장
       └→ Kafka: ai-flow-features (대문자 키) → AI 분석 서버
```

- **에이전트 전송**: camelCase (예: `srcIp`, `inBytes`)
- **Kafka / AI 서버 수신**: 대문자 (예: `IPV4_SRC_ADDR`, `IN_BYTES`)
- **Elasticsearch 저장**: camelCase

---

## 필수 필드

에이전트에서 반드시 포함해야 하는 필드입니다.

| 에이전트 필드 (camelCase) | AI 서버 키 (대문자) | 타입 | 설명 |
|--------------------------|-------------------|------|------|
| `srcIp` | `IPV4_SRC_ADDR` | String | 출발지 IP |
| `dstIp` | `IPV4_DST_ADDR` | String | 도착지 IP |
| `srcPort` | `L4_SRC_PORT` | Integer | 출발지 포트 |
| `dstPort` | `L4_DST_PORT` | Integer | 도착지 포트 |
| `protocol` | `PROTOCOL` | Integer | 프로토콜 번호 (6=TCP, 17=UDP, 1=ICMP) |
| `inBytes` | `IN_BYTES` | Long | 수신 바이트 수 |
| `inPkts` | `IN_PKTS` | Long | 수신 패킷 수 |

---

## 전체 피처 목록

### 1. 바이트 / 패킷 수

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `inBytes` | `IN_BYTES` | Long | 수신 총 바이트 수 |
| `inPkts` | `IN_PKTS` | Long | 수신 총 패킷 수 |
| `outBytes` | `OUT_BYTES` | Long | 송신 총 바이트 수 |
| `outPkts` | `OUT_PKTS` | Long | 송신 총 패킷 수 |

---

### 2. TCP 플래그

비트마스크 값 (예: SYN=0x02, ACK=0x10, SYN+ACK=0x12)

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `tcpFlags` | `TCP_FLAGS` | Integer | 플로우 전체 TCP 플래그 합산 |
| `clientTcpFlags` | `CLIENT_TCP_FLAGS` | Integer | 클라이언트 → 서버 방향 플래그 |
| `serverTcpFlags` | `SERVER_TCP_FLAGS` | Integer | 서버 → 클라이언트 방향 플래그 |

---

### 3. 플로우 지속 시간

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `flowDuration` | `FLOW_DURATION_MILLISECONDS` | Long | 전체 플로우 지속 시간 (ms) |
| `durationIn` | `DURATION_IN` | Long | 수신 방향 지속 시간 (ms) |
| `durationOut` | `DURATION_OUT` | Long | 송신 방향 지속 시간 (ms) |

---

### 4. TTL (Time To Live)

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `minTtl` | `MIN_TTL` | Integer | 플로우 내 최소 TTL 값 |
| `maxTtl` | `MAX_TTL` | Integer | 플로우 내 최대 TTL 값 |

---

### 5. 패킷 크기

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `longestFlowPkt` | `LONGEST_FLOW_PKT` | Integer | 플로우 내 가장 큰 패킷 크기 (bytes) |
| `shortestFlowPkt` | `SHORTEST_FLOW_PKT` | Integer | 플로우 내 가장 작은 패킷 크기 (bytes) |
| `minIpPktLen` | `MIN_IP_PKT_LEN` | Integer | 최소 IP 패킷 길이 (bytes) |
| `maxIpPktLen` | `MAX_IP_PKT_LEN` | Integer | 최대 IP 패킷 길이 (bytes) |

---

### 6. 처리량 (Throughput)

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `srcToDstSecondBytes` | `SRC_TO_DST_SECOND_BYTES` | Double | 출발지→도착지 초당 바이트 수 |
| `dstToSrcSecondBytes` | `DST_TO_SRC_SECOND_BYTES` | Double | 도착지→출발지 초당 바이트 수 |
| `srcToDstAvgThroughput` | `SRC_TO_DST_AVG_THROUGHPUT` | Double | 출발지→도착지 평균 처리량 (bps) |
| `dstToSrcAvgThroughput` | `DST_TO_SRC_AVG_THROUGHPUT` | Double | 도착지→출발지 평균 처리량 (bps) |

---

### 7. 재전송

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `retransmittedInBytes` | `RETRANSMITTED_IN_BYTES` | Long | 수신 재전송 바이트 수 |
| `retransmittedInPkts` | `RETRANSMITTED_IN_PKTS` | Long | 수신 재전송 패킷 수 |
| `retransmittedOutBytes` | `RETRANSMITTED_OUT_BYTES` | Long | 송신 재전송 바이트 수 |
| `retransmittedOutPkts` | `RETRANSMITTED_OUT_PKTS` | Long | 송신 재전송 패킷 수 |

---

### 8. 패킷 크기 분포

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `numPktsUpTo128Bytes` | `NUM_PKTS_UP_TO_128_BYTES` | Integer | 128 bytes 이하 패킷 수 |
| `numPkts128To256Bytes` | `NUM_PKTS_128_TO_256_BYTES` | Integer | 128~256 bytes 패킷 수 |
| `numPkts256To512Bytes` | `NUM_PKTS_256_TO_512_BYTES` | Integer | 256~512 bytes 패킷 수 |
| `numPkts512To1024Bytes` | `NUM_PKTS_512_TO_1024_BYTES` | Integer | 512~1024 bytes 패킷 수 |
| `numPkts1024To1514Bytes` | `NUM_PKTS_1024_TO_1514_BYTES` | Integer | 1024~1514 bytes 패킷 수 |

---

### 9. TCP 윈도우

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `tcpWinMaxIn` | `TCP_WIN_MAX_IN` | Integer | 수신 방향 최대 TCP 윈도우 크기 |
| `tcpWinMaxOut` | `TCP_WIN_MAX_OUT` | Integer | 송신 방향 최대 TCP 윈도우 크기 |

---

### 10. ICMP

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `icmpType` | `ICMP_TYPE` | Integer | ICMP 메시지 타입 (비ICMP 플로우는 0) |
| `icmpIpv4Type` | `ICMP_IPV4_TYPE` | Integer | IPv4 ICMP 타입 |

---

### 11. DNS

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `dnsQueryId` | `DNS_QUERY_ID` | Integer | DNS 쿼리 트랜잭션 ID |
| `dnsQueryType` | `DNS_QUERY_TYPE` | Integer | DNS 쿼리 타입 (1=A, 28=AAAA 등) |
| `dnsTtlAnswer` | `DNS_TTL_ANSWER` | Long | DNS 응답 TTL |

---

### 12. FTP

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `ftpCommandRetCode` | `FTP_COMMAND_RET_CODE` | Integer | FTP 명령 응답 코드 (비FTP 플로우는 0) |

---

### 13. IAT (Inter-Arrival Time, 패킷 도착 간격)

출발지→도착지 방향

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `srcToDstIatMin` | `SRC_TO_DST_IAT_MIN` | Long | 최소 패킷 도착 간격 (μs) |
| `srcToDstIatMax` | `SRC_TO_DST_IAT_MAX` | Long | 최대 패킷 도착 간격 (μs) |
| `srcToDstIatAvg` | `SRC_TO_DST_IAT_AVG` | Double | 평균 패킷 도착 간격 (μs) |
| `srcToDstIatStddev` | `SRC_TO_DST_IAT_STDDEV` | Double | 패킷 도착 간격 표준편차 (μs) |

도착지→출발지 방향

| 에이전트 필드 | AI 서버 키 | 타입 | 설명 |
|-------------|-----------|------|------|
| `dstToSrcIatMin` | `DST_TO_SRC_IAT_MIN` | Long | 최소 패킷 도착 간격 (μs) |
| `dstToSrcIatMax` | `DST_TO_SRC_IAT_MAX` | Long | 최대 패킷 도착 간격 (μs) |
| `dstToSrcIatAvg` | `DST_TO_SRC_IAT_AVG` | Double | 평균 패킷 도착 간격 (μs) |
| `dstToSrcIatStddev` | `DST_TO_SRC_IAT_STDDEV` | Double | 패킷 도착 간격 표준편차 (μs) |

---

## AI 서버 연동 명세

### ai-flow-features 토픽 메시지 (Spring Boot → AI 서버)

AI 서버가 Kafka `ai-flow-features` 토픽에서 수신하는 메시지입니다.

```json
{
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "projectId": 1,
  "ingestedAt": "2026-02-25T13:00:00Z",
  "IPV4_SRC_ADDR": "192.168.1.10",
  "IPV4_DST_ADDR": "8.8.8.8",
  "L4_SRC_PORT": 54321,
  "L4_DST_PORT": 443,
  "PROTOCOL": 6,
  "IN_BYTES": 1500,
  "IN_PKTS": 10
}
```

> `documentId`는 Elasticsearch 문서 ID입니다. 추론 결과 전송 시 반드시 포함해야 합니다.

---

### ai-results 토픽 메시지 (AI 서버 → Spring Boot)

AI 서버가 추론 완료 후 Kafka `ai-results` 토픽으로 전송해야 하는 메시지입니다.

```json
{
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "projectId": 1,
  "isAnomaly": true,
  "anomalyScore": 0.87,
  "modelVersion": "v1.0"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `documentId` | String | Y | 수신한 메시지의 documentId 그대로 |
| `projectId` | Long | Y | 프로젝트 ID |
| `isAnomaly` | Boolean | Y | 이상 탐지 여부 |
| `anomalyScore` | Double | Y | 이상치 점수 (0.0 ~ 1.0) |
| `modelVersion` | String | Y | 추론에 사용된 모델 버전 |

> Spring Boot가 이 메시지를 받아 Elasticsearch 문서를 자동으로 업데이트합니다.
