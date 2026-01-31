# HRIS System - IT Employee Management System

Sistem HRIS (Human Resource Information System) berbasis microservices yang dirancang khusus untuk perusahaan IT. Sistem ini memudahkan pengelolaan karyawan, presensi berbasis lokasi (GPS), manajemen cuti, dan penggajian otomatis dengan kontrol akses berbasis peran (RBAC).

## 🚀 Fitur Utama

### 1. Panel Admin (Express.js + React)

Pusat kontrol untuk administrator sistem.

- **Dashboard Interaktif**: Ringkasan statistik karyawan dan status sistem.
- **Manajemen Divisi**: Pengelolaan struktur organisasi perusahaan (IT, HR, Finance, dll).
- **Manajemen User & Role**:
  - CRUD Pengguna dengan enkripsi password.
  - Assign Role (Admin, HR, Keuangan, Karyawan).
  - Aktivasi/Deaktivasi akun.
- **Konfigurasi Sistem**:
  - **Gaji**: Set gaji pokok per divisi dan aturan potongan (terlambat, absen).
  - **Cuti**: Set kuota cuti tahunan per divisi.
  - **Presensi**: Set lokasi kantor (Latitude/Longitude), radius presensi (meter), dan jam kerja operasional.

### 2. Panel HR (Golang)

- Monitoring Real-time Presensi Karyawan.
- Persetujuan/Penolakan Izin & Cuti.
- Perhitungan Payroll Otomatis (Gaji Pokok - Potongan + Tunjangan).

### 3. Panel Keuangan (Golang)

- Eksekusi Pembayaran Gaji.
- Laporan Keuangan & Pengeluaran Gaji.

### 4. Panel Karyawan (Mobile/Web)

- **Presensi GPS**: Clock-in/Clock-out hanya bisa dilakukan dalam radius kantor yang ditentukan.
- **Self Service**: Pengajuan cuti, lihat slip gaji, dan riwayat kehadiran.

## 🏗️ Arsitektur Sistem

Sistem dibangun dengan arsitektur **Microservices** dan **Monorepo**:

```mermaid
graph TD
    Client[Frontend (React + MUI)] -->|Port 5000| API_Admin[API Express (Admin)]
    Client -->|Port 8080| API_Core[API Golang (HR, Finance, Employee)]

    subgraph Data Layer
        API_Admin --> DB[(MySQL Database)]
        API_Core --> DB
    end
```

## 🛠️ Teknologi yang Digunakan

### Frontend

- **React 18** (Vite): Framework UI yang cepat dan reaktif.
- **Material UI (MUI)**: Desain antarmuka modern, bersih, dan profesional.
- **Recharts**: Visualisasi data statistik.
- **React Router**: Manajemen navigasi aplikasi.

### Backend Admin (Service 1)

- **Node.js & Express**: RESTful API yang ringan dan cepat.
- **TypeScript**: Type-safety untuk pengembangan yang lebih handal.
- **MySQL2**: Driver database yang efisien.
- **Bcrypt.js**: Keamanan password standar industri.

### Backend Core (Service 2)

- **Golang**: Bahasa performa tinggi untuk proses bisnis inti.
- **Gin Gonic**: Web framework Golang.

### Database & DevOps

- **MySQL 8.0**: Relational database.
- **Docker & Docker Compose**: Kontainerisasi aplikasi untuk kemudahan deployment.

## 📋 Prasyarat

- **Node.js 20+**
- **Go 1.21+**
- **Docker Desktop** (Opsional, jika ingin menjalankan via container)

## 🏃‍♂️ Cara Menjalankan (Local Development)

### 1. Setup Database

Pastikan MySQL service berjalan dan restore `database/schema.sql`.

### 2. Jalankan Backend Admin (Express)

```bash
cd api-express
npm install
npm run dev
# Server berjalan di http://localhost:5000
```

### 3. Jalankan Backend Core (Golang) (Opsional)

```bash
cd api-golang
go run cmd/main.go
# Server berjalan di http://localhost:8080
```

### 4. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
# Akses aplikasi di http://localhost:3000
```

## 🔐 Akun Default

| Role         | Email              | Password  |
| ------------ | ------------------ | --------- |
| **Admin**    | admin@gmail.com    | dsadsadsa |
| **HR**       | hr@gmail.com       | 123456    |
| **Finance**  | finance@gmail.com  | 123456    |
| **Employee** | employee@gmail.com | 123456    |

---

_Developed by HRIS Development Team_
