# Backend API Requirements for NIDS Dashboard

## Overview

The frontend depends on backend API responses and does not use local fallback data.
If an API request fails, the UI should show an error state instead of substituting local sample data.

## Base URL

```
/api
```

## Required Endpoints

### `GET /api/alerts`

Returns recent alerts for the active project.

```json
{
  "alerts": [
    {
      "id": "string",
      "sourceIP": "string",
      "destIP": "string",
      "protocol": "string",
      "bytes": 0,
      "score": 0.95,
      "status": "Attack",
      "timestamp": "14:23:45"
    }
  ],
  "totalCount": 1,
  "lastUpdated": "2026-03-03T00:00:00.000Z"
}
```

### `GET /api/kpis`

Optional. The current frontend derives KPI values from alerts, so a dedicated KPI endpoint is not required.

### `GET /api/traffic/distribution`

Optional. The current frontend derives traffic distribution from alerts, so a dedicated traffic endpoint is not required.

### `POST /api/auth/login`

Authenticates a user.

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

### `POST /api/auth/signup`

Creates a user account.

```json
{
  "email": "user@example.com",
  "password": "string",
  "name": "string"
}
```

### `GET /api/projects`

Returns the authenticated user's projects.

### `POST /api/projects`

Creates a project.

```json
{
  "name": "string",
  "description": "string"
}
```

## Error Handling

- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication failure
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

The frontend expects error responses to include a readable message when possible.

## Polling

When monitoring is active, alerts are polled every 2 seconds.
The request timeout is 5 seconds.
