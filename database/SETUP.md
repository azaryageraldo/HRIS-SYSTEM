# Database Setup Guide

## ✅ Database Successfully Created!

Database `db_hris` telah berhasil dibuat dengan 13 tabel.

## 📊 Database Information

- **Database Name**: `db_hris`
- **Username**: `azaryageraldo`
- **Password**: `anes0709`
- **Host**: `localhost`
- **Port**: `3306`

## 📋 Tables Created

| #   | Table Name           | Description                                     |
| --- | -------------------- | ----------------------------------------------- |
| 1   | `roles`              | Role pengguna (admin, hr, keuangan, karyawan)   |
| 2   | `divisions`          | Divisi IT (Backend Express, Golang, React, dll) |
| 3   | `users`              | Data karyawan dan akun                          |
| 4   | `salary_configs`     | Konfigurasi gaji per divisi                     |
| 5   | `deduction_rules`    | Aturan potongan gaji                            |
| 6   | `leave_configs`      | Konfigurasi cuti per divisi                     |
| 7   | `attendance_configs` | Konfigurasi presensi (GPS, waktu)               |
| 8   | `attendances`        | Data presensi karyawan                          |
| 9   | `leave_requests`     | Pengajuan izin & cuti                           |
| 10  | `leave_balances`     | Saldo cuti karyawan                             |
| 11  | `payrolls`           | Perhitungan gaji bulanan                        |
| 12  | `payroll_deductions` | Detail potongan gaji                            |
| 13  | `payments`           | Pembayaran gaji                                 |

## 🔐 Default Data

### Roles

- ✅ admin
- ✅ hr
- ✅ keuangan
- ✅ karyawan

### Divisions

- ✅ Backend Express
- ✅ Backend Golang
- ✅ Frontend React
- ✅ Fullstack Laravel
- ✅ DevOps

### Default Admin Account

- **Username**: `admin`
- **Email**: `admin@hris.com`
- **Password**: `admin123` (⚠️ HARUS DIGANTI!)
- **Role**: Administrator

### Attendance Configuration

- **Max Check-in Time**: 09:00
- **Min Check-out Time**: 17:00
- **Office Location**: -6.200000, 106.816666 (Jakarta)
- **Radius**: 100 meter

### Deduction Rules

1. **Tidak Hadir**: 5% dari gaji pokok per hari
2. **Terlambat**: Rp 50,000 per kejadian
3. **Tidak Presensi Pulang**: Rp 25,000 per kejadian

## 🔧 How to Access Database

### Via MySQL CLI

```bash
mysql -u azaryageraldo -panes0709 db_hris
```

### Via phpMyAdmin

```
URL: http://localhost/phpmyadmin
Username: azaryageraldo
Password: anes0709
Database: db_hris
```

## 📝 Useful Commands

### Show all tables

```sql
USE db_hris;
SHOW TABLES;
```

### View roles

```sql
SELECT * FROM roles;
```

### View divisions

```sql
SELECT * FROM divisions;
```

### View users

```sql
SELECT id, username, email, full_name, role_id, division_id FROM users;
```

### View attendance config

```sql
SELECT * FROM attendance_configs;
```

## 🔄 Reset Database

Jika ingin reset database (hapus semua data dan buat ulang):

```bash
cd /home/azarya-geraldo/Dokumen/myproject/HRIS-SYSTEM
mysql -u azaryageraldo -panes0709 -e "DROP DATABASE IF EXISTS db_hris;"
mysql -u azaryageraldo -panes0709 < database/schema.sql
```

## 📚 Next Steps

1. ✅ Database schema created
2. ⏳ Test Express API connection to database
3. ⏳ Test Golang API connection to database
4. ⏳ Implement API endpoints
5. ⏳ Create frontend UI

## 🔗 Related Files

- [schema.sql](file:///home/azarya-geraldo/Dokumen/myproject/HRIS-SYSTEM/database/schema.sql) - Full database schema
- [README.md](file:///home/azarya-geraldo/Dokumen/myproject/HRIS-SYSTEM/database/README.md) - Database documentation
- [.env](file:///home/azarya-geraldo/Dokumen/myproject/HRIS-SYSTEM/.env) - Environment configuration
