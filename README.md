# HRIS System - IT Employee Management System

Sistem HRIS berbasis microservices untuk mengelola karyawan IT dengan presensi GPS, penggajian otomatis, dan role-based access control.

## 🏗️ Arsitektur

```
Frontend (React + MUI)
├── API Express (Panel Admin) - Port 5000
│   ├── Manajemen Divisi IT
│   ├── Konfigurasi Gaji, Cuti, Presensi
│   └── Manajemen User & Role
│
└── API Golang (Panel HR, Keuangan, Karyawan) - Port 8080
    ├── Presensi & Validasi GPS
    ├── Izin & Cuti
    ├── Payroll Calculation
    ├── Pembayaran Gaji
    └── Slip Gaji & Laporan

→ MySQL Database - Port 3306
```

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+ (untuk development lokal)
- Go 1.21+ (untuk development lokal)

## 🚀 Quick Start

### 1. Clone dan Setup Environment

```bash
cd HRIS-SYSTEM
cp .env.example .env  # Edit sesuai kebutuhan
```

### 2. Jalankan Semua Service dengan Docker Compose

```bash
# Build dan start semua service
docker-compose up --build

# Atau jalankan di background
docker-compose up -d --build
```

### 3. Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Express API**: http://localhost:5000
- **Golang API**: http://localhost:8080
- **MySQL**: localhost:3306

### 4. Health Check

```bash
# Check Express API
curl http://localhost:5000/health

# Check Golang API
curl http://localhost:8080/health
```

## 📁 Struktur Project

```
HRIS-SYSTEM/
├── frontend/                 # React + Vite + MUI
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── api-express/             # Express.js (Panel Admin)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── api-golang/              # Golang (Panel HR, Keuangan, Karyawan)
│   ├── cmd/
│   │   └── main.go
│   ├── internal/
│   │   ├── database/
│   │   ├── handlers/
│   │   ├── models/
│   │   └── services/
│   ├── Dockerfile
│   └── go.mod
│
├── docker-compose.yml       # Orchestration
├── .env                     # Environment variables
└── README.md
```

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Express API Development

```bash
cd api-express
npm install
npm run dev
```

### Golang API Development

```bash
cd api-golang
go mod download
go run cmd/main.go
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f api-express
docker-compose logs -f api-golang

# Rebuild services
docker-compose up --build

# Remove volumes (reset database)
docker-compose down -v
```

## 🔐 Environment Variables

### Database

- `DB_HOST`: MySQL host (default: mysql)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

### Express API

- `EXPRESS_PORT`: API port (default: 5000)
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRES_IN`: Token expiration time

### Golang API

- `GOLANG_PORT`: API port (default: 8080)

### Frontend

- `VITE_API_EXPRESS_URL`: Express API URL
- `VITE_API_GOLANG_URL`: Golang API URL

## 📊 Role & Permissions

### Admin

- Manajemen Divisi IT
- Konfigurasi Gaji, Cuti, Presensi
- Manajemen User & Role

### HR (Human Resource)

- Monitoring Presensi
- Manajemen Izin & Cuti
- Review Draft Gaji

### Keuangan (Finance)

- Pembayaran Gaji
- Laporan Keuangan
- Export Data

### Karyawan

- Presensi GPS
- Pengajuan Izin & Cuti
- Lihat Slip Gaji

## 🛠️ Tech Stack

### Frontend

- React 18
- Vite
- Material UI (MUI)
- Axios
- React Router

### Backend

- Express.js (Panel Admin)
- Golang + Gin (Panel HR, Keuangan, Karyawan)
- MySQL 8.0

### DevOps

- Docker & Docker Compose
- Multi-stage builds
- Health checks
- Volume persistence

## 📝 API Endpoints

### Express API (Port 5000)

- `GET /health` - Health check
- `GET /api` - API info
- `POST /api/divisions` - Manage divisions
- `POST /api/salary-config` - Salary configuration
- `POST /api/leave-config` - Leave configuration
- `POST /api/attendance-config` - Attendance configuration
- `POST /api/users` - User management

### Golang API (Port 8080)

- `GET /health` - Health check
- `GET /api` - API info
- `POST /api/attendance` - Attendance (GPS validation)
- `GET /api/leave` - Leave requests
- `GET /api/payroll` - Payroll calculation
- `GET /api/payment` - Payment management
- `GET /api/slip/:id` - Payslip
- `GET /api/report` - Reports

## 🐛 Troubleshooting

### Port sudah digunakan

```bash
# Check port usage
sudo lsof -i :3000
sudo lsof -i :5000
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>
```

### Database connection error

```bash
# Check MySQL container
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Container tidak start

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs <service-name>

# Rebuild
docker-compose up --build --force-recreate
```

## 📄 License

MIT License

## 👥 Contributors

HRIS Development Team
