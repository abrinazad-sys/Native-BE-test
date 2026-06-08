# Pitch Space Auth Service - API Documentation

## Overview

The **Pitch Space Auth Service** is a Node.js 22 + Express application that provides a proxy endpoint for authenticating users with the Pitch Space authentication system. It automatically handles device identification and platform detection for seamless integration.

- **Service Name**: `pitch-space-auth-service`
- **Version**: 0.1.0
- **Runtime**: Node.js >= 22
- **Framework**: Express.js

---

## Base URL

```
http://localhost:3000
```

The default port is `3000`. You can override it using the `PORT` environment variable.

---

## Authentication Endpoints

### POST /api/login

Authenticates a user by forwarding their email to the Pitch Space authentication API with automatically generated device and platform information.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "string (required)"
}
```

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `email`   | string | Yes      | The user's email address       |

#### Response - Success

**Status Code:** `200 OK`

**Response Body:**
The response is forwarded directly from the Pitch Space authentication API and will vary depending on successful authentication.

```json
{
  // Response from Pitch Space API (varies by implementation)
}
```

#### Response - Error

**Status Code:** `400 Bad Request` (Missing email)

```json
{
  "error": "email is required"
}
```

**Status Code:** `4xx / 5xx` (Upstream API error)

```json
{
  "error": "Login request failed",
  "details": {}
}
```

**Status Code:** `500 Internal Server Error` (Server exception)

```json
{
  "error": "Internal server error",
  "message": "Error details here"
}
```

#### Request Example

**cURL:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const data = await response.json();
console.log(data);
```

**JavaScript (Axios):**
```javascript
const axios = require('axios');

axios.post('http://localhost:3000/api/login', {
  email: 'user@example.com'
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error.response.data));
```

---

## Automatic Request Enhancement

The service automatically enhances login requests with the following data:

### Device ID

A unique identifier derived from the local machine's characteristics:
- **Generation Method**: SHA-256 hash of combined values
- **Data Used**:
  - `os.hostname()` - Machine hostname
  - `os.type()` - Operating system type (e.g., "Windows_NT", "Linux", "Darwin")
  - `os.arch()` - CPU architecture (e.g., "x64", "arm64")
  - `os.platform()` - Platform identifier (e.g., "win32", "linux", "darwin")

**Format:** 64-character hexadecimal string

**Example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Platform

The runtime environment's platform and architecture:
- **Format**: `{platform}-{architecture}`
- **Examples**:
  - `win32-x64` (Windows 64-bit)
  - `linux-x64` (Linux 64-bit)
  - `darwin-arm64` (macOS Apple Silicon)

---

## Complete Request Payload Sent to Upstream API

The service constructs and sends the following payload to `https://dev.api.pitch.space/api/auth/login`:

```json
{
  "email": "user@example.com",
  "apiKey": "cf523484-4327-4092-ab63-34f5b8d74013",
  "deviceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "platform": "win32-x64"
}
```

| Field      | Source                                          | Auto-Generated |
|------------|-------------------------------------------------|----------------|
| `email`    | Client request body                             | No             |
| `apiKey`   | Environment variable `PITCH_API_KEY`            | Yes            |
| `deviceId` | Machine characteristics (SHA-256 hash)          | Yes            |
| `platform` | OS and CPU architecture detection                | Yes            |

---

## Environment Variables

Configure the service using the following environment variables:

| Variable       | Description                                              | Default Value                        |
|----------------|----------------------------------------------------------|--------------------------------------|
| `PORT`         | HTTP server listening port                               | `3000`                               |
| `PITCH_API_KEY`| API key for Pitch Space authentication                   | `cf523484-4327-4092-ab63-34f5b8d74013` |
| `NODE_ENV`     | Environment mode (`production` or `development`)        | Not set                              |

**Example:**
```bash
PORT=8080 PITCH_API_KEY=your-api-key NODE_ENV=production npm start
```

---

## Upstream API Integration

The service acts as a proxy to the Pitch Space authentication API:

- **Upstream URL**: `https://dev.api.pitch.space/api/auth/login`
- **Upstream Method**: `POST`
- **Upstream Headers**: `Content-Type: application/json`
- **Response Handling**: Status codes and response bodies are passed through unchanged

---

## Error Handling

### Validation Errors

**Missing Email Parameter**
- **Status**: 400 Bad Request
- **Message**: `{ "error": "email is required" }`
- **When**: The email field is missing or empty in the request body

### Upstream Errors

**Failed Login Request**
- **Status**: Propagated from upstream (4xx or 5xx)
- **Message**: `{ "error": "Login request failed", "details": {...} }`
- **When**: The upstream Pitch Space API returns an error response

### Server Errors

**Internal Server Error**
- **Status**: 500 Internal Server Error
- **Message**: `{ "error": "Internal server error", "message": "..." }`
- **When**: An unexpected exception occurs during request processing

---

## Running the Service

### Installation

```bash
npm install
```

### Start (Production)

```bash
npm start
```

### Start (Development)

```bash
npm run dev
```

The development mode sets `NODE_ENV=development` automatically.

---

## Technology Stack

- **Runtime**: Node.js 22+
- **Framework**: Express.js 4.18.4
- **Built-in Modules Used**:
  - `os` - Operating system and hardware information
  - `crypto` - SHA-256 hashing for device ID generation

---

## Notes

- Device ID is consistent per machine - the same hash is generated every time the service runs on the same hardware
- Platform information is determined at runtime from the Node.js environment
- The service does not persist any user data or session state
- All requests are forwarded to the Pitch Space API for actual authentication
- The service is stateless and can be scaled horizontally

---

## Version History

| Version | Date       | Changes              |
|---------|------------|----------------------|
| 0.1.0   | 2024-06-08 | Initial release      |

