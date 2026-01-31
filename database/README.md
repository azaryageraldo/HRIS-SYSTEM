# Dokumentasi Skema Database

## Gambaran Umum

Database: `db_hris`
Charset: `utf8mb4_unicode_ci`
Engine: `InnoDB`

## Struktur Tabel

### 1. Pengguna & Peran

#### `peran`

Menyimpan peran pengguna sistem.

| Kolom     | Tipe        | Deskripsi                     |
| --------- | ----------- | ----------------------------- |
| id        | INT         | Primary key                   |
| nama      | VARCHAR(50) | admin, hr, keuangan, karyawan |
| deskripsi | TEXT        | Deskripsi peran               |

#### `divisi`

Menyimpan divisi IT.

| Kolom     | Tipe         | Deskripsi        |
| --------- | ------------ | ---------------- |
| id        | INT          | Primary key      |
| nama      | VARCHAR(100) | Nama divisi      |
| deskripsi | TEXT         | Deskripsi divisi |
| aktif     | BOOLEAN      | Status aktif     |

#### `pengguna`

Menyimpan data karyawan.

| Kolom                 | Tipe         | Deskripsi                                   |
| --------------------- | ------------ | ------------------------------------------- |
| id                    | INT          | Primary key                                 |
| username              | VARCHAR(50)  | Username unik                               |
| email                 | VARCHAR(100) | Email unik                                  |
| password              | VARCHAR(255) | Password (bcrypt)                           |
| nama_lengkap          | VARCHAR(100) | Nama lengkap                                |
| telepon               | VARCHAR(20)  | Nomor telepon                               |
| peran_id              | INT          | FK ke peran                                 |
| divisi_id             | INT          | FK ke divisi (NULL untuk admin/hr/keuangan) |
| nama_bank             | VARCHAR(50)  | Nama bank                                   |
| nomor_rekening        | VARCHAR(50)  | Nomor rekening                              |
| nama_pemilik_rekening | VARCHAR(100) | Nama pemilik rekening                       |
| aktif                 | BOOLEAN      | Status aktif                                |

---

### 2. Konfigurasi Gaji (Panel Admin)

#### `konfigurasi_gaji`

Konfigurasi gaji pokok per divisi.

| Kolom           | Tipe          | Deskripsi       |
| --------------- | ------------- | --------------- |
| id              | INT           | Primary key     |
| divisi_id       | INT           | FK ke divisi    |
| gaji_pokok      | DECIMAL(15,2) | Gaji pokok      |
| tanggal_berlaku | DATE          | Tanggal berlaku |
| aktif           | BOOLEAN       | Status aktif    |

#### `aturan_potongan`

Aturan potongan gaji.

| Kolom          | Tipe          | Deskripsi            |
| -------------- | ------------- | -------------------- |
| id             | INT           | Primary key          |
| nama           | VARCHAR(100)  | Nama aturan potongan |
| tipe_potongan  | ENUM          | tetap / persentase   |
| nilai_potongan | DECIMAL(15,2) | Nilai potongan       |
| deskripsi      | TEXT          | Deskripsi            |
| aktif          | BOOLEAN       | Status aktif         |

---

### 3. Konfigurasi Cuti (Panel Admin)

#### `konfigurasi_cuti`

Konfigurasi cuti per divisi.

| Kolom              | Tipe    | Deskripsi            |
| ------------------ | ------- | -------------------- |
| id                 | INT     | Primary key          |
| divisi_id          | INT     | FK ke divisi         |
| jatah_cuti_tahunan | INT     | Jatah cuti per tahun |
| tahun_berlaku      | YEAR    | Tahun berlaku        |
| aktif              | BOOLEAN | Status aktif         |

---

### 4. Konfigurasi Presensi (Panel Admin)

#### `konfigurasi_presensi`

Konfigurasi presensi.

| Kolom              | Tipe          | Deskripsi                   |
| ------------------ | ------------- | --------------------------- |
| id                 | INT           | Primary key                 |
| jam_masuk_maksimal | TIME          | Jam maksimal presensi masuk |
| jam_pulang_minimal | TIME          | Jam minimal presensi pulang |
| latitude_kantor    | DECIMAL(10,8) | Latitude kantor             |
| longitude_kantor   | DECIMAL(11,8) | Longitude kantor            |
| radius_meter       | INT           | Radius presensi (meter)     |
| aktif              | BOOLEAN       | Status aktif                |

---

### 5. Presensi (Panel Karyawan & HR)

#### `presensi`

Data presensi karyawan.

| Kolom            | Tipe          | Deskripsi                                 |
| ---------------- | ------------- | ----------------------------------------- |
| id               | INT           | Primary key                               |
| pengguna_id      | INT           | FK ke pengguna                            |
| tanggal          | DATE          | Tanggal presensi                          |
| waktu_masuk      | DATETIME      | Waktu presensi masuk                      |
| latitude_masuk   | DECIMAL(10,8) | Latitude presensi masuk                   |
| longitude_masuk  | DECIMAL(11,8) | Longitude presensi masuk                  |
| waktu_pulang     | DATETIME      | Waktu presensi pulang                     |
| latitude_pulang  | DECIMAL(10,8) | Latitude presensi pulang                  |
| longitude_pulang | DECIMAL(11,8) | Longitude presensi pulang                 |
| status           | ENUM          | hadir, terlambat, tidak_hadir, izin, cuti |
| catatan          | TEXT          | Catatan                                   |

---

### 6. Pengajuan Izin & Cuti (Panel Karyawan & HR)

#### `pengajuan_cuti`

Pengajuan izin & cuti.

| Kolom               | Tipe     | Deskripsi                    |
| ------------------- | -------- | ---------------------------- |
| id                  | INT      | Primary key                  |
| pengguna_id         | INT      | FK ke pengguna               |
| tipe_cuti           | ENUM     | cuti, izin, sakit            |
| tanggal_mulai       | DATE     | Tanggal mulai                |
| tanggal_selesai     | DATE     | Tanggal selesai              |
| total_hari          | INT      | Total hari                   |
| alasan              | TEXT     | Alasan                       |
| status              | ENUM     | menunggu, disetujui, ditolak |
| disetujui_oleh      | INT      | FK ke pengguna (HR)          |
| tanggal_persetujuan | DATETIME | Tanggal persetujuan          |
| catatan_persetujuan | TEXT     | Catatan persetujuan          |

#### `saldo_cuti`

Saldo cuti karyawan.

| Kolom         | Tipe | Deskripsi                 |
| ------------- | ---- | ------------------------- |
| id            | INT  | Primary key               |
| pengguna_id   | INT  | FK ke pengguna            |
| tahun         | YEAR | Tahun                     |
| total_hari    | INT  | Jatah cuti per tahun      |
| hari_terpakai | INT  | Cuti yang sudah digunakan |
| sisa_hari     | INT  | Sisa cuti (computed)      |

---

### 7. Penggajian (Panel HR & Keuangan)

#### `penggajian`

Perhitungan gaji bulanan.

| Kolom                    | Tipe          | Deskripsi                           |
| ------------------------ | ------------- | ----------------------------------- |
| id                       | INT           | Primary key                         |
| pengguna_id              | INT           | FK ke pengguna                      |
| bulan                    | INT           | Bulan (1-12)                        |
| tahun                    | YEAR          | Tahun                               |
| gaji_pokok               | DECIMAL(15,2) | Gaji pokok                          |
| total_potongan           | DECIMAL(15,2) | Total potongan                      |
| gaji_bersih              | DECIMAL(15,2) | Gaji bersih                         |
| status                   | ENUM          | draft, dikirim_ke_keuangan, dibayar |
| dihitung_pada            | DATETIME      | Waktu perhitungan                   |
| dikirim_ke_keuangan_pada | DATETIME      | Waktu kirim ke keuangan             |
| dibayar_pada             | DATETIME      | Waktu pembayaran                    |

#### `detail_potongan_gaji`

Detail potongan gaji.

| Kolom              | Tipe          | Deskripsi             |
| ------------------ | ------------- | --------------------- |
| id                 | INT           | Primary key           |
| penggajian_id      | INT           | FK ke penggajian      |
| aturan_potongan_id | INT           | FK ke aturan_potongan |
| deskripsi          | VARCHAR(255)  | Deskripsi potongan    |
| jumlah             | DECIMAL(15,2) | Jumlah potongan       |

#### `pembayaran`

Pembayaran gaji.

| Kolom                | Tipe         | Deskripsi                 |
| -------------------- | ------------ | ------------------------- |
| id                   | INT          | Primary key               |
| penggajian_id        | INT          | FK ke penggajian          |
| tanggal_pembayaran   | DATE         | Tanggal pembayaran        |
| metode_pembayaran    | VARCHAR(50)  | Metode pembayaran         |
| referensi_pembayaran | VARCHAR(100) | Nomor referensi           |
| dibayar_oleh         | INT          | FK ke pengguna (Keuangan) |
| catatan              | TEXT         | Catatan                   |

---

## Relasi Tabel

```
peran (1) ----< (N) pengguna
divisi (1) ----< (N) pengguna
divisi (1) ----< (N) konfigurasi_gaji
divisi (1) ----< (N) konfigurasi_cuti

pengguna (1) ----< (N) presensi
pengguna (1) ----< (N) pengajuan_cuti
pengguna (1) ----< (N) saldo_cuti
pengguna (1) ----< (N) penggajian

penggajian (1) ----< (N) detail_potongan_gaji
penggajian (1) ----< (1) pembayaran

aturan_potongan (1) ----< (N) detail_potongan_gaji
```

---

## Data Awal (Seed)

### Peran

- admin
- hr
- keuangan
- karyawan

### Divisi

- Backend Express
- Backend Golang
- Frontend React
- Fullstack Laravel
- DevOps

### Akun Admin Default

- Username: `admin`
- Email: `admin@hris.com`
- Password: `admin123` (harus diganti)

### Konfigurasi Presensi

- Jam masuk maksimal: 09:00
- Jam pulang minimal: 17:00
- Radius: 100 meter

### Aturan Potongan

- Tidak Hadir: 5% per hari
- Terlambat: Rp 50,000
- Tidak Presensi Pulang: Rp 25,000
