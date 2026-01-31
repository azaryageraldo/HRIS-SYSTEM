# HRIS System - IT Employee Management System

![HRIS System](https://img.shields.io/badge/HRIS-Enterprise%20System-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-Microservices-orange?style=for-the-badge)

**Sistem Manajemen Sumber Daya Manusia Terpadu Berbasis Microservices**

> Dirancang khusus untuk perusahaan teknologi modern, sistem ini menghadirkan efisiensi pengelolaan karyawan melalui arsitektur microservices yang handal, pemisahan proses bisnis yang jelas, dan pengalaman pengguna yang intuitif.

---

## 🌟 Keunggulan Sistem

### 🏢 1. Panel Admin Terpusat (Express.js)

Pusat komando yang didesain dengan antarmuka **Material UI** yang elegan dan profesional.

- **Dashboard Eksekutif**: Ringkasan data karyawan dan statistik vital perusahaan dalam satu pandangan.
- **Konfigurasi Fleksibel**:
  - Atur **Gaji Pokok** dan **Aturan Potongan** dinamis per divisi.
  - Kelola **Kuota Cuti** tahunan secara otomatis.
  - Tetapkan **Radius & Lokasi Presensi** (Geofencing) untuk keamanan absensi.
- **Manajemen User Granular**: Kontrol penuh atas akun pengguna dengan enkripsi keamanan tingkat tinggi.

### 👥 2. Core Service Handal (Golang)

Ditenagai oleh **Golang**, mesin utama sistem ini menangani proses bisnis krusial dengan kecepatan tinggi.

- **Presensi GPS Presisi**: Validasi lokasi karyawan secara real-time untuk memastikan kehadiran fisik di kantor.
- **Payroll Otomatis**: Kalkulasi gaji rumit (pokok - potongan + tunjangan) diselesaikan dalam hitungan detik.
- **Sistem Perizinan**: Alur pengajuan dan persetujuan cuti yang transparan dan tercatat rapi.

### 📊 3. Laporan Keuangan & Slip Gaji

Transparansi finansial bagi perusahaan dan karyawan.

- **Slip Gaji Digital**: Karyawan dapat mengakses detail pendapatan mereka kapan saja.
- **Laporan Manajerial**: Data pengeluaran gaji yang terstruktur untuk analisa keuangan perusahaan.

---

## 🏗️ Arsitektur Sistem

Sistem ini menerapkan pola **Microservices** untuk memastikan skalabilitas dan kemudahan pemeliharaan.

```mermaid
graph LR
    subgraph "Frontend Layer"
        FE[React Admin Panel]
        Mobile[Employee Mobile Web]
    end

    subgraph "API Gateway / Services"
        Admin Service[Admin Service (Express.js)]
        Core Service[Core Service (Golang)]
    end

    subgraph "Data Persistence"
        DB[(MySQL Database)]
    end

    FE -->|Management & Config| Admin Service
    Mobile -->|Attendance & Request| Core Service
    Admin Service --> DB
    Core Service --> DB
```

---

## 🛠️ Stack Teknologi

Kami menggunakan teknologi terbaik di kelasnya untuk memberikan performa maksimal.

| Komponen           | Teknologi                                                                                                                                                                                                                    | Deskripsi                                        |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| **Frontend**       | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=flat-square&logo=mui&logoColor=white)                          | Antarmuka responsif dan modern dengan Vite       |
| **Admin Service**  | ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) | Backend manajemen yang fleksibel dan type-safe   |
| **Core Service**   | ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)                                                                                                                                      | Backend performa tinggi untuk proses bisnis inti |
| **Database**       | ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat-square&logo=mysql&logoColor=white)                                                                                                                             | Penyimpanan data relasional yang stabil          |
| **Infrastructure** | ![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat-square&logo=docker&logoColor=white)                                                                                                                          | Kontainerisasi untuk deployment yang konsisten   |

---

<center>

### 🚀 **HRIS System** - Modernizing Workforce Management

_Developed by HRIS Development Team_

</center>
