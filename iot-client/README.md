# CloudPi IoT Client — Raspberry Pi 4B

## Quick Start

### 1. Install on your Raspberry Pi 4B

```bash
# SSH into your Pi
ssh pi@<your-pi-ip>

# Copy this folder to the Pi (or clone your repo)
# Then install dependencies:
cd iot-client
pip3 install -r requirements.txt
```

### 2. Register Your Device

1. Open the CloudPi Dashboard at `http://<cloud-server-ip>:5173`
2. Go to **Devices** → Click **Register Device**
3. Fill in:
   - **Name**: e.g., `Living Room Pi`
   - **Type**: `Raspberry Pi 4B`
   - **Location**: e.g., `Living Room`
4. **Copy the API key** (it starts with `cpk_` — you'll only see it once!)

### 3. Run the Client

```bash
# Real hardware mode
python3 cloudpi_client.py \
  --server http://<cloud-server-ip>:3001 \
  --api-key cpk_<your_key_here>

# Custom interval (every 10 seconds)
python3 cloudpi_client.py \
  --server http://<cloud-server-ip>:3001 \
  --api-key cpk_<your_key_here> \
  --interval 10

# Simulator mode (for testing without a Pi)
python3 cloudpi_client.py \
  --server http://localhost:3001 \
  --api-key cpk_<your_key_here> \
  --simulate
```

### 4. Using Environment Variables

```bash
export CLOUDPI_SERVER=http://<cloud-server-ip>:3001
export CLOUDPI_API_KEY=cpk_<your_key_here>
export CLOUDPI_INTERVAL=5

python3 cloudpi_client.py
```

### 5. Run as a Service (Auto-start on Boot)

Create `/etc/systemd/system/cloudpi.service`:

```ini
[Unit]
Description=CloudPi IoT Client
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/iot-client
Environment=CLOUDPI_SERVER=http://<cloud-server-ip>:3001
Environment=CLOUDPI_API_KEY=cpk_<your_key_here>
ExecStart=/usr/bin/python3 cloudpi_client.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudpi
sudo systemctl start cloudpi
sudo systemctl status cloudpi
```

## Optional Sensors

### DHT22 (Temperature + Humidity)
```bash
pip3 install adafruit-circuitpython-dht
```
Connect to GPIO4 (default). The client will auto-detect it.

### BMP280/BME280 (Barometric Pressure)
```bash
pip3 install adafruit-circuitpython-bmp280
```
Connect via I2C. The client will auto-detect it.

## Data Sent

Each telemetry reading includes:

| Field | Description |
|-------|-------------|
| cpuTemp | CPU temperature in °C |
| cpuUsage | CPU utilization % |
| memUsage | Memory utilization % |
| diskUsage | Disk utilization % |
| netRx | Network bytes received (delta) |
| netTx | Network bytes transmitted (delta) |
| humidity | Humidity % (if DHT sensor connected) |
| pressure | Pressure hPa (if BMP sensor connected) |
| customData | Platform info, hostname, CPU count, etc. |

