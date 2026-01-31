-- Update Admin Account
-- Email: admin@gmail.com
-- Password: dsadsadsa

USE db_hris;

UPDATE pengguna 
SET 
    email = 'admin@gmail.com',
    password = '$2b$10$rkTrWNs2.55fdbs4vo5PK.HysLSOizsDeHsuT56jaw6PkidjXdCmC'
WHERE username = 'admin';

-- Verify update
SELECT 
    id,
    username, 
    email, 
    nama_lengkap,
    peran_id,
    aktif,
    dibuat_pada
FROM pengguna 
WHERE username = 'admin';
