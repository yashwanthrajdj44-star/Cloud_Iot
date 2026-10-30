# ☁️ CloudPi — IoT Cloud Platform

A full-stack cloud infrastructure platform for managing Raspberry Pi 4B IoT devices with real-time telemetry, secure API key authentication, and a professional dashboard.

## Architecture

```
┌────────────────────┐        ┌──────────────────────────────────┐
│  Raspberry Pi 4B   │        │      Cloud Platform (Server)     │
│                    │        │                                  │
│  ┌──────────────┐  │  HTTP  │  ┌────────┐    ┌─────────────┐  │
│  │ IoT Client   │──┼───────►│  │Express │───►│  SQLite DB   │  │
│  │ (Python)     │  │  POST  │  │  API   │    └─────────────┘  │
│  └──────────────┘  │        │  └───┬────┘                     │
│                    │        │      │ WebSocket                 │
└────────────────────┘        │  ┌───▼─────────────────────┐    │
                              │  │  React Dashboard        │    │
                              │  │  (Vite + Tailwind)      │    │
                              │  └─────────────────────────┘    │
                              └──────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS, Recharts |
| Backend   | Express.js, TypeScript, better-sqlite3, WebSocket |
| IoT Client| Python 3, psutil, requests |
| Auth      | API Key (SHA-256 hashed, `cpk_` prefixed) |

## Quick Start

### Option A: One-Click Launch (Windows)
Double-click `start-all.bat` or run:
```bat
start-all.bat
```
This starts both the backend server (`http://localhost:3001`) and the React dashboard (`http://localhost:5173`) in separate windows.

### Option B: Manual Startup

#### 1. Start the Backend Server

```bash
cd server
npm install
npm run dev
```

The API server starts on `http://localhost:3001`.

### 2. Start the Dashboard

```bash
cd dashboard
npm install
npm run dev
```

The dashboard opens at `http://localhost:5173`.

### 3. Register a Device

1. Open the dashboard → **Devices** → **Register Device**
2. Enter a name, type, and location
3. **Copy the API key** (shown only once!)

### 4. Run the IoT Client

On your Raspberry Pi 4B:

```bash
cd iot-client
pip3 install -r requirements.txt
python3 cloudpi_client.py --server http://<your-server-ip>:3001 --api-key cpk_<your_key>
```

Or test locally with the simulator:

```bash
python3 cloudpi_client.py --server http://localhost:3001 --api-key cpk_<your_key> --simulate
```

## Dashboard Pages

| Page | Description |
|------|-------------|
| **Overview** | KPI cards, device status, activity feed, aggregate charts |
| **Devices** | Register, monitor, and manage IoT devices |
| **Device Detail** | Real-time charts for a specific device (CPU, memory, network) |
| **Analytics** | Cross-device comparison and historical analysis |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/devices` | — | Register a new device |
| GET | `/api/devices` | — | List all devices |
| GET | `/api/devices/:id` | — | Get device details |
| PATCH | `/api/devices/:id` | — | Update a device |
| DELETE | `/api/devices/:id` | — | Delete a device |
| POST | `/api/telemetry` | API Key | Submit telemetry data |
| GET | `/api/telemetry/:deviceId` | — | Get telemetry history |
| GET | `/api/telemetry/:deviceId/latest` | — | Get latest reading |
| GET | `/api/stats` | — | System-wide statistics |
| WS | `/ws` | — | Real-time telemetry stream |

## Project Structure

```
Cloud_build/
├── server/                # Backend API + WebSocket
│   ├── src/
│   │   ├── index.ts       # Express app entry point
│   │   ├── database.ts    # SQLite database layer
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── websocket.ts   # WebSocket server
│   │   ├── middleware/
│   │   │   └── auth.ts    # API key authentication
│   │   └── routes/
│   │       ├── devices.ts
│   │       ├── telemetry.ts
│   │       └── stats.ts
│   └── package.json
├── dashboard/             # React frontend
│   ├── src/
│   │   ├── components/    # UI components + charts
│   │   ├── pages/         # Dashboard pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── api/           # API client
│   │   └── types/         # TypeScript types
│   └── package.json
├── iot-client/            # Raspberry Pi client
│   ├── cloudpi_client.py
│   ├── requirements.txt
│   └── README.md
└── README.md
```

## License

MIT

