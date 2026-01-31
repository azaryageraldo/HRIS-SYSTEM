// Type definitions for database models

export interface Divisi {
  id: number;
  nama: string;
  deskripsi?: string;
  aktif: boolean;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

export interface Peran {
  id: number;
  nama: string;
  deskripsi?: string;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

export interface Pengguna {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional for responses
  nama_lengkap: string;
  telepon?: string;
  peran_id: number;
  divisi_id?: number;
  nama_bank?: string;
  nomor_rekening?: string;
  nama_pemilik_rekening?: string;
  aktif: boolean;
  dibuat_pada: Date;
  diperbarui_pada: Date;
  // Joined fields
  peran?: string;
  divisi?: string;
}

export interface KonfigurasiGaji {
  id: number;
  divisi_id: number;
  gaji_pokok: number;
  tanggal_berlaku: Date;
  aktif: boolean;
  dibuat_pada: Date;
  diperbarui_pada: Date;
  // Joined fields
  nama_divisi?: string;
}

export interface KonfigurasiCuti {
  id: number;
  divisi_id: number;
  jatah_cuti_tahunan: number;
  tahun_berlaku: number;
  aktif: boolean;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

export interface KonfigurasiPresensi {
  id: number;
  jam_masuk_maksimal: string; // TIME format
  jam_pulang_minimal: string; // TIME format
  latitude_kantor: number;
  longitude_kantor: number;
  radius_meter: number;
  aktif: boolean;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

export interface AturanPotongan {
  id: number;
  nama: string;
  tipe_potongan: 'tetap' | 'persentase';
  nilai_potongan: number;
  deskripsi?: string;
  aktif: boolean;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

// Request/Response types
export interface CreateDivisiRequest {
  nama: string;
  deskripsi?: string;
}

export interface UpdateDivisiRequest {
  nama?: string;
  deskripsi?: string;
}

export interface CreatePenggunaRequest {
  username: string;
  email: string;
  password: string;
  nama_lengkap: string;
  telepon?: string;
  peran_id: number;
  divisi_id?: number;
}

export interface UpdatePenggunaRequest {
  nama_lengkap?: string;
  telepon?: string;
  divisi_id?: number;
  nama_bank?: string;
  nomor_rekening?: string;
  nama_pemilik_rekening?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Authentication types
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

export interface JWTPayload {
  userId: number;
  username: string;
  peran_id: number;
  iat?: number;
  exp?: number;
}
