// Type definitions for HRIS Frontend

export interface Divisi {
  id: number;
  nama: string;
  deskripsi?: string;
  aktif: boolean;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface Peran {
  id: number;
  nama: string;
  deskripsi?: string;
}

export interface Pengguna {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  telepon?: string;
  peran_id: number;
  divisi_id?: number;
  nama_bank?: string;
  nomor_rekening?: string;
  nama_pemilik_rekening?: string;
  aktif: boolean;
  dibuat_pada: string;
  // Joined fields
  peran?: string;
  divisi?: string;
}

export interface Presensi {
  id: number;
  pengguna_id: number;
  tanggal: string;
  waktu_masuk?: string;
  latitude_masuk?: number;
  longitude_masuk?: number;
  waktu_pulang?: string;
  latitude_pulang?: number;
  longitude_pulang?: number;
  status: 'hadir' | 'terlambat' | 'tidak_hadir' | 'izin' | 'cuti';
  catatan?: string;
  dibuat_pada: string;
}

export interface PengajuanCuti {
  id: number;
  pengguna_id: number;
  tipe_cuti: 'cuti' | 'izin' | 'sakit';
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_hari: number;
  alasan: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  disetujui_oleh?: number;
  tanggal_persetujuan?: string;
  catatan_persetujuan?: string;
  dibuat_pada: string;
  // Joined fields
  nama_lengkap?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nama_lengkap: string;
  telepon?: string;
  divisi_id?: number;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  peran: string;
  peran_id: number;
  divisi?: string;
  divisi_id?: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
