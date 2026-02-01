-- ============================================================
-- HRIS SYSTEM - FULL SEEDER
-- Database: db_hris
-- ============================================================

USE db_hris;

-- 1. BERSIHKAN DATA LAMA
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE penggajian;
TRUNCATE TABLE pengajuan_cuti;
TRUNCATE TABLE presensi;
TRUNCATE TABLE konfigurasi_presensi;
TRUNCATE TABLE konfigurasi_cuti;
TRUNCATE TABLE aturan_potongan;
TRUNCATE TABLE konfigurasi_gaji;
TRUNCATE TABLE pengguna;
TRUNCATE TABLE divisi;
TRUNCATE TABLE peran;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. SEED PERAN (ROLES)
INSERT INTO peran (id, nama, deskripsi) VALUES
(1, 'admin', 'Administrator Sistem'),
(2, 'hr', 'Human Resource'),
(3, 'keuangan', 'Staff Keuangan'),
(4, 'karyawan', 'Karyawan Biasa');

-- 3. SEED DIVISI
INSERT INTO divisi (id, nama, deskripsi) VALUES
(1, 'IT Development', 'Pengembangan Sistem dan Teknologi'),
(2, 'Marketing', 'Pemasaran dan Penjualan'),
(3, 'Finance & Accounting', 'Keuangan dan Akuntansi'),
(4, 'Human Resource', 'Manajemen Sumber Daya Manusia'),
(5, 'Operational', 'Operasional Harian');

-- 4. SEED PENGGUNA UTAMA (Request User)
-- Password Default: 'dsadsadsa' -> $2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC

INSERT INTO pengguna (username, email, password, nama_lengkap, peran_id, divisi_id, nama_bank, nomor_rekening, nama_pemilik_rekening) VALUES
('admin', 'admin@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Administrator Utama', 1, NULL, 'BCA', '1234567801', 'Admin'),
('hr', 'hr@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Staff HR Manager', 2, 4, 'BCA', '1234567802', 'HR Manager'),
('keuangan', 'keuangan@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Staff Finance', 3, 3, 'BCA', '1234567803', 'Staff Finance'),
('karyawan', 'karyawan@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Budi Santoso', 4, 1, 'MANDIRI', '1234567804', 'Budi Santoso');

-- 5. SEED KARYAWAN TAMBAHAN (> 5 Data)
INSERT INTO pengguna (username, email, password, nama_lengkap, peran_id, divisi_id, nama_bank, nomor_rekening, nama_pemilik_rekening) VALUES
('andi', 'andi@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Andi Wijaya', 4, 1, 'BNI', '8888000001', 'Andi Wijaya'),
('siti', 'siti@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Siti Aminah', 4, 2, 'BRI', '9999000002', 'Siti Aminah'),
('reza', 'reza@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Reza Rahardian', 4, 5, 'BCA', '7777000003', 'Reza Rahardian'),
('maya', 'maya@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Maya Estianty', 4, 2, 'MANDIRI', '6666000004', 'Maya Estianty'),
('joko', 'joko@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Joko Anwar', 4, 1, 'BSI', '5555000005', 'Joko Anwar'),
('dina', 'dina@gmail.com', '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC', 'Dina Lorenza', 4, 5, 'CIMB', '4444000006', 'Dina Lorenza');

-- 6. SEED KONFIGURASI GAJI
INSERT INTO konfigurasi_gaji (divisi_id, gaji_pokok, tanggal_berlaku) VALUES
(1, 8000000, '2024-01-01'), -- IT
(2, 6000000, '2024-01-01'), -- Marketing
(3, 7000000, '2024-01-01'), -- Finance
(4, 7500000, '2024-01-01'), -- HR
(5, 5000000, '2024-01-01'); -- Operational

-- 7. SEED ATURAN POTONGAN
INSERT INTO aturan_potongan (nama, tipe_potongan, nilai_potongan, deskripsi) VALUES
('Terlambat < 1 Jam', 'tetap', 50000, 'Potongan keterlambatan ringan'),
('Terlambat > 1 Jam', 'tetap', 100000, 'Potongan keterlambatan berat'),
('Tidak Hadir (Tanpa Keterangan)', 'tetap', 250000, 'Potongan mangkir kerja'),
('BPJS Kesehatan', 'persentase', 1.0, 'Potongan BPJS 1%'),
('PPH 21', 'persentase', 5.0, 'Pajak Penghasilan 5%');

-- 8. SEED KONFIGURASI CUTI
INSERT INTO konfigurasi_cuti (divisi_id, jatah_cuti_tahunan, tahun_berlaku) VALUES
(1, 12, 2024),
(2, 12, 2024),
(3, 12, 2024),
(4, 12, 2024),
(5, 12, 2024);

-- 9. SEED KONFIGURASI PRESENSI
INSERT INTO konfigurasi_presensi (jam_masuk_maksimal, jam_pulang_minimal, latitude_kantor, longitude_kantor, radius_meter) VALUES
('08:00:00', '17:00:00', -6.2088, 106.8456, 100);

-- 10. SEED PRESENSI (Data Dummy Minggu Ini)
-- Karyawan id: 4 (Budi), 5 (Andi), 6 (Siti)
INSERT INTO presensi (pengguna_id, tanggal, waktu_masuk, waktu_pulang, latitude_masuk, longitude_masuk, status) VALUES
(4, CURDATE(), CONCAT(CURDATE(), ' 07:55:00'), CONCAT(CURDATE(), ' 17:05:00'), -6.2088, 106.8456, 'hadir'),
(5, CURDATE(), CONCAT(CURDATE(), ' 08:15:00'), CONCAT(CURDATE(), ' 17:10:00'), -6.2088, 106.8456, 'terlambat'),
(6, CURDATE(), CONCAT(CURDATE(), ' 07:50:00'), CONCAT(CURDATE(), ' 17:00:00'), -6.2088, 106.8456, 'hadir'),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 07:58:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:01:00'), -6.2088, 106.8456, 'hadir'),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:30:00'), -6.2088, 106.8456, 'hadir'),
(6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 07:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:05:00'), -6.2088, 106.8456, 'hadir'),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 08:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00'), -6.2088, 106.8456, 'terlambat'),
(7, CURDATE(), NULL, NULL, NULL, NULL, 'tidak_hadir'), -- Reza bolos
(8, CURDATE(), CONCAT(CURDATE(), ' 07:59:00'), CONCAT(CURDATE(), ' 17:00:00'), -6.2088, 106.8456, 'hadir'); -- Maya hadir

-- 11. SEED PENGAJUAN CUTI
INSERT INTO pengajuan_cuti (pengguna_id, tipe_cuti, tanggal_mulai, tanggal_selesai, total_hari, alasan, status, disetujui_oleh, tanggal_persetujuan, catatan_persetujuan) VALUES
(4, 'cuti', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 3, 'Liburan Keluarga', 'menunggu', NULL, NULL, NULL),
(5, 'sakit', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 2, 'Demam Tinggi', 'disetujui', 2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Semoga lekas sembuh'),
(6, 'izin', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 1, 'Mengurus SIM', 'ditolak', 2, CURDATE(), 'Sedang banyak deadline'),
(7, 'cuti', DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 6, 'Pulang Kampung', 'menunggu', NULL, NULL, NULL),
(8, 'sakit', CURDATE(), CURDATE(), 1, 'Sakit Perut', 'menunggu', NULL, NULL, NULL);

-- 12. SEED PENGGAJIAN (Bulan Ini)
-- Gaji Pokok IT: 8jt, Marketing: 6jt, Ops: 5jt
INSERT INTO penggajian (pengguna_id, bulan, tahun, gaji_pokok, total_potongan, gaji_bersih, status, dibuat_pada) VALUES
(4, MONTH(CURDATE()), YEAR(CURDATE()), 8000000, 400000, 7600000, 'dibayar', NOW()), -- Budi (IT)
(5, MONTH(CURDATE()), YEAR(CURDATE()), 8000000, 500000, 7500000, 'dikirim_ke_keuangan', NOW()), -- Andi (IT)
(6, MONTH(CURDATE()), YEAR(CURDATE()), 6000000, 300000, 5700000, 'draft', NOW()), -- Siti (Mkt)
(7, MONTH(CURDATE()), YEAR(CURDATE()), 5000000, 250000, 4750000, 'dibayar', NOW()), -- Reza (Ops)
(8, MONTH(CURDATE()), YEAR(CURDATE()), 6000000, 300000, 5700000, 'dikirim_ke_keuangan', NOW()); -- Maya (Mkt)
