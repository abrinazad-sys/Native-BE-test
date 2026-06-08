# Pitch Space Auth Service

A simple Node.js 22 + Express application that exposes an endpoint to call the Pitch Space login API.

## Project name

`pitch-space-auth-service`

## Features

- `POST /api/login` accepts only `email` in the request body
- Automatically adds `apiKey`, `deviceId`, and `platform`
- Forwards the request to `https://dev.api.pitch.space/api/auth/login`

## Run

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

3. Call the endpoint:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"makhsodur.rahman4@bedatasolutions.com"}'
```

## Notes

- `deviceId` is derived automatically from the local machine.
- `platform` is detected from Node.js runtime information.
