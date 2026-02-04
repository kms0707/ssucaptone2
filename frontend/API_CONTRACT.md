# NIDS Backend API Contract

This document defines the API endpoints that the frontend expects from the backend.

## Base URL

```
/api
```

## Endpoints

### 1. Get KPIs

Retrieves current key performance indicators.

**Endpoint:** `GET /api/kpis`

**Response:**
```json
{
    "totalFlows": 1248,
    "attacksDetected": 2,
    "suspiciousFlows": 1,
    "accuracy": 98.4,
    "lastUpdated": "2026-02-02T14:23:45.000Z"
}
```

**Fields:**
- `totalFlows` (number): Total number of network flows processed
- `attacksDetected` (number): Number of confirmed attacks detected
- `suspiciousFlows` (number): Number of flows under investigation
- `accuracy` (number): Model accuracy percentage (0-100)
- `lastUpdated` (string): ISO 8601 timestamp of last data update

---

### 2. Get Real-Time Alerts

Retrieves the list of recent network alerts.

**Endpoint:** `GET /api/alerts`

**Response:**
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
        }
    ],
    "totalCount": 8,
    "lastUpdated": "2026-02-02T14:23:45.000Z"
}
```

**Fields:**
- `alerts` (array): List of alert objects
  - `id` (string): Unique alert identifier
  - `sourceIP` (string): Source IP address
  - `destIP` (string): Destination IP address
  - `protocol` (string): Protocol and port (e.g., "TCP/443")
  - `bytes` (number): Total bytes transferred
  - `score` (number): Anomaly score (0-1)
  - `status` (string): One of "Normal", "Suspicious", or "Attack"
  - `timestamp` (string): Time of detection (HH:mm:ss format)
- `totalCount` (number): Total number of alerts
- `lastUpdated` (string): ISO 8601 timestamp of last update

---

### 3. Get Traffic Distribution

Retrieves traffic distribution by status category.

**Endpoint:** `GET /api/traffic/distribution`

**Response:**
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
    "lastUpdated": "2026-02-02T14:23:45.000Z"
}
```

**Fields:**
- `categories` (array): List of traffic category objects
  - `name` (string): Category name ("Normal", "Suspicious", or "Attack")
  - `value` (number): Number of flows in this category
  - `color` (string): Hex color code for UI display
- `totalFlows` (number): Total number of flows across all categories
- `lastUpdated` (string): ISO 8601 timestamp of last update

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server-side error

**Error Response Format:**
```json
{
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2026-02-02T14:23:45.000Z"
}
```

---

## Polling Behavior

The frontend polls all three endpoints every **2 seconds** to provide real-time updates.

Backend should:
- Handle frequent requests efficiently
- Implement appropriate caching if needed
- Return fresh data with `lastUpdated` timestamp

---

## Mock Fallback

If the backend is unavailable, the frontend automatically falls back to mock data to ensure the UI remains functional during development or outages.
