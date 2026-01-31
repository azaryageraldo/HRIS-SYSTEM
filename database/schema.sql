-- ============================================================
-- HRIS SYSTEM - SKEMA DATABASE
-- Database: db_hris
-- ============================================================

-- Hapus database jika ada (untuk instalasi baru)
-- DROP DATABASE IF EXISTS db_hris;

-- Buat database
CREATE DATABASE IF NOT EXISTS db_hris;
USE db_hris;

-- ============================================================
-- 1. PENGGUNA & PERAN
-- ============================================================

-- Tabel: peran
CREATE TABLE peran (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(50) NOT NULL UNIQUE COMMENT 'admin, hr, keuangan, karyawan',
    deskripsi TEXT,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: divisi (Divisi IT)
CREATE TABLE divisi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: pengguna
CREATE TABLE pengguna (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed',
    nama_lengkap VARCHAR(100) NOT NULL,
    telepon VARCHAR(20),
    peran_id INT NOT NULL,
    divisi_id INT NULL COMMENT 'NULL untuk admin, hr, keuangan',
    nama_bank VARCHAR(50),
    nomor_rekening VARCHAR(50),
    nama_pemilik_rekening VARCHAR(100),
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (peran_id) REFERENCES peran(id) ON DELETE RESTRICT,
    FOREIGN KEY (divisi_id) REFERENCES divisi(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. KONFIGURASI GAJI (Panel Admin)
-- ============================================================

-- Tabel: konfigurasi_gaji (Gaji pokok per divisi)
CREATE TABLE konfigurasi_gaji (
    id INT PRIMARY KEY AUTO_INCREMENT,
    divisi_id INT NOT NULL,
    gaji_pokok DECIMAL(15,2) NOT NULL COMMENT 'Gaji pokok',
    tanggal_berlaku DATE NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (divisi_id) REFERENCES divisi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: aturan_potongan (Aturan potongan gaji)
CREATE TABLE aturan_potongan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL COMMENT 'Tidak hadir, Terlambat, Tidak presensi pulang',
    tipe_potongan ENUM('tetap', 'persentase') NOT NULL,
    nilai_potongan DECIMAL(15,2) NOT NULL,
    deskripsi TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. KONFIGURASI CUTI (Panel Admin)
-- ============================================================

-- Tabel: konfigurasi_cuti (Konfigurasi cuti per divisi)
CREATE TABLE konfigurasi_cuti (
    id INT PRIMARY KEY AUTO_INCREMENT,
    divisi_id INT NOT NULL,
    jatah_cuti_tahunan INT NOT NULL COMMENT 'Jatah cuti per tahun',
    tahun_berlaku YEAR NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (divisi_id) REFERENCES divisi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. KONFIGURASI PRESENSI (Panel Admin)
-- ============================================================

-- Tabel: konfigurasi_presensi (Konfigurasi presensi)
CREATE TABLE konfigurasi_presensi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    jam_masuk_maksimal TIME NOT NULL COMMENT 'Jam maksimal presensi masuk',
    jam_pulang_minimal TIME NOT NULL COMMENT 'Jam minimal presensi pulang',
    latitude_kantor DECIMAL(10,8) NOT NULL COMMENT 'Latitude kantor',
    longitude_kantor DECIMAL(11,8) NOT NULL COMMENT 'Longitude kantor',
    radius_meter INT NOT NULL COMMENT 'Radius presensi dalam meter',
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. PRESENSI (Panel Karyawan & HR)
-- ============================================================

-- Tabel: presensi (Presensi karyawan)
CREATE TABLE presensi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pengguna_id INT NOT NULL,
    tanggal DATE NOT NULL,
    waktu_masuk DATETIME,
    latitude_masuk DECIMAL(10,8),
    longitude_masuk DECIMAL(11,8),
    waktu_pulang DATETIME,
    latitude_pulang DECIMAL(10,8),
    longitude_pulang DECIMAL(11,8),
    status ENUM('hadir', 'terlambat', 'tidak_hadir', 'izin', 'cuti') NOT NULL,
    catatan TEXT,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
    UNIQUE KEY unik_pengguna_tanggal (pengguna_id, tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. PENGAJUAN IZIN & CUTI (Panel Karyawan & HR)
-- ============================================================

-- Tabel: pengajuan_cuti (Pengajuan izin & cuti)
CREATE TABLE pengajuan_cuti (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pengguna_id INT NOT NULL,
    tipe_cuti ENUM('cuti', 'izin', 'sakit') NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    total_hari INT NOT NULL,
    alasan TEXT NOT NULL,
    status ENUM('menunggu', 'disetujui', 'ditolak') DEFAULT 'menunggu',
    disetujui_oleh INT NULL COMMENT 'ID Pengguna HR yang menyetujui',
    tanggal_persetujuan DATETIME NULL,
    catatan_persetujuan TEXT,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
    FOREIGN KEY (disetujui_oleh) REFERENCES pengguna(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: saldo_cuti (Saldo cuti karyawan)
CREATE TABLE saldo_cuti (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pengguna_id INT NOT NULL,
    tahun YEAR NOT NULL,
    total_hari INT NOT NULL COMMENT 'Jatah cuti per tahun',
    hari_terpakai INT DEFAULT 0 COMMENT 'Cuti yang sudah digunakan',
    sisa_hari INT GENERATED ALWAYS AS (total_hari - hari_terpakai) STORED,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
    UNIQUE KEY unik_pengguna_tahun (pengguna_id, tahun)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. PENGGAJIAN (Panel HR & Keuangan)
-- ============================================================

-- Tabel: penggajian (Perhitungan gaji bulanan)
CREATE TABLE penggajian (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pengguna_id INT NOT NULL,
    bulan INT NOT NULL COMMENT '1-12',
    tahun YEAR NOT NULL,
    gaji_pokok DECIMAL(15,2) NOT NULL,
    total_potongan DECIMAL(15,2) DEFAULT 0,
    gaji_bersih DECIMAL(15,2) NOT NULL COMMENT 'Gaji bersih',
    status ENUM('draft', 'dikirim_ke_keuangan', 'dibayar') DEFAULT 'draft',
    dihitung_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
    dikirim_ke_keuangan_pada DATETIME NULL,
    dibayar_pada DATETIME NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
    UNIQUE KEY unik_pengguna_bulan_tahun (pengguna_id, bulan, tahun)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: detail_potongan_gaji (Detail potongan gaji)
CREATE TABLE detail_potongan_gaji (
    id INT PRIMARY KEY AUTO_INCREMENT,
    penggajian_id INT NOT NULL,
    aturan_potongan_id INT NOT NULL,
    deskripsi VARCHAR(255),
    jumlah DECIMAL(15,2) NOT NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (penggajian_id) REFERENCES penggajian(id) ON DELETE CASCADE,
    FOREIGN KEY (aturan_potongan_id) REFERENCES aturan_potongan(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: pembayaran (Pembayaran gaji)
CREATE TABLE pembayaran (
    id INT PRIMARY KEY AUTO_INCREMENT,
    penggajian_id INT NOT NULL,
    tanggal_pembayaran DATE NOT NULL,
    metode_pembayaran VARCHAR(50) COMMENT 'Transfer Bank, Tunai, dll',
    referensi_pembayaran VARCHAR(100) COMMENT 'Nomor referensi transfer',
    dibayar_oleh INT NOT NULL COMMENT 'ID Pengguna Keuangan yang melakukan pembayaran',
    catatan TEXT,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (penggajian_id) REFERENCES penggajian(id) ON DELETE CASCADE,
    FOREIGN KEY (dibayar_oleh) REFERENCES pengguna(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. INDEKS UNTUK PERFORMA
-- ============================================================

CREATE INDEX idx_pengguna_peran ON pengguna(peran_id);
CREATE INDEX idx_pengguna_divisi ON pengguna(divisi_id);
CREATE INDEX idx_pengguna_aktif ON pengguna(aktif);

CREATE INDEX idx_presensi_pengguna ON presensi(pengguna_id);
CREATE INDEX idx_presensi_tanggal ON presensi(tanggal);
CREATE INDEX idx_presensi_status ON presensi(status);

CREATE INDEX idx_pengajuan_cuti_pengguna ON pengajuan_cuti(pengguna_id);
CREATE INDEX idx_pengajuan_cuti_status ON pengajuan_cuti(status);
CREATE INDEX idx_pengajuan_cuti_tanggal ON pengajuan_cuti(tanggal_mulai, tanggal_selesai);

CREATE INDEX idx_penggajian_pengguna ON penggajian(pengguna_id);
CREATE INDEX idx_penggajian_bulan_tahun ON penggajian(bulan, tahun);
CREATE INDEX idx_penggajian_status ON penggajian(status);

-- ============================================================
-- 9. DATA AWAL (SEED)
-- ============================================================

-- Insert peran default
INSERT INTO peran (nama, deskripsi) VALUES
('admin', 'Administrator - Akses penuh sistem'),
('hr', 'Human Resource - Kelola presensi, cuti, penggajian'),
('keuangan', 'Keuangan - Kelola pembayaran'),
('karyawan', 'Karyawan - Layanan mandiri');

-- Insert divisi default
INSERT INTO divisi (nama, deskripsi) VALUES
('Backend Express', 'Pengembangan backend menggunakan Express.js'),
('Backend Golang', 'Pengembangan backend menggunakan Golang'),
('Frontend React', 'Pengembangan frontend menggunakan React'),
('Fullstack Laravel', 'Pengembangan fullstack menggunakan Laravel'),
('DevOps', 'DevOps dan Infrastruktur');

-- Insert konfigurasi presensi default
INSERT INTO konfigurasi_presensi (jam_masuk_maksimal, jam_pulang_minimal, latitude_kantor, longitude_kantor, radius_meter) VALUES
('09:00:00', '17:00:00', -6.200000, 106.816666, 100);

-- Insert aturan potongan default
INSERT INTO aturan_potongan (nama, tipe_potongan, nilai_potongan, deskripsi) VALUES
('Tidak Hadir Tanpa Keterangan', 'persentase', 5.00, 'Potongan 5% dari gaji pokok per hari'),
('Terlambat Presensi', 'tetap', 50000.00, 'Potongan Rp 50,000 per kejadian'),
('Tidak Presensi Pulang', 'tetap', 25000.00, 'Potongan Rp 25,000 per kejadian');

-- Insert pengguna admin default (email: admin@gmail.com, password: dsadsadsa)
INSERT INTO pengguna (username, email, password, nama_lengkap, peran_id, aktif) VALUES
('admin', 'admin@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Administrator Sistem', 1, TRUE);

-- ============================================================
-- AKHIR SKEMA
-- ============================================================
