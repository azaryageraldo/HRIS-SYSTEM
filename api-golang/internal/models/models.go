package models

import "time"

// Pengguna represents pengguna table
type Pengguna struct {
	ID                  int       `json:"id"`
	Username            string    `json:"username"`
	Email               string    `json:"email"`
	Password            string    `json:"-"` // Hidden from JSON
	NamaLengkap         string    `json:"nama_lengkap"`
	Telepon             *string   `json:"telepon"`
	PeranID             int       `json:"peran_id"`
	DivisiID            *int      `json:"divisi_id"`
	NamaBank            *string   `json:"nama_bank"`
	NomorRekening       *string   `json:"nomor_rekening"`
	NamaPemilikRekening *string   `json:"nama_pemilik_rekening"`
	Aktif               bool      `json:"aktif"`
	DibuatPada          time.Time `json:"dibuat_pada"`
	DiperbaruiPada      time.Time `json:"diperbarui_pada"`
}

// Presensi represents presensi table
type Presensi struct {
	ID              int        `json:"id"`
	PenggunaID      int        `json:"pengguna_id"`
	Tanggal         time.Time  `json:"tanggal"`
	WaktuMasuk      *time.Time `json:"waktu_masuk"`
	LatitudeMasuk   *float64   `json:"latitude_masuk"`
	LongitudeMasuk  *float64   `json:"longitude_masuk"`
	WaktuPulang     *time.Time `json:"waktu_pulang"`
	LatitudePulang  *float64   `json:"latitude_pulang"`
	LongitudePulang *float64   `json:"longitude_pulang"`
	Status          string     `json:"status"` // hadir, terlambat, tidak_hadir, izin, cuti
	Catatan         *string    `json:"catatan"`
	DibuatPada      time.Time  `json:"dibuat_pada"`
	DiperbaruiPada  time.Time  `json:"diperbarui_pada"`
}

// PengajuanCuti represents pengajuan_cuti table
type PengajuanCuti struct {
	ID                 int        `json:"id"`
	PenggunaID         int        `json:"pengguna_id"`
	TipeCuti           string     `json:"tipe_cuti"` // cuti, izin, sakit
	TanggalMulai       time.Time  `json:"tanggal_mulai"`
	TanggalSelesai     time.Time  `json:"tanggal_selesai"`
	TotalHari          int        `json:"total_hari"`
	Alasan             string     `json:"alasan"`
	Status             string     `json:"status"` // menunggu, disetujui, ditolak
	DisetujuiOleh      *int       `json:"disetujui_oleh"`
	TanggalPersetujuan *time.Time `json:"tanggal_persetujuan"`
	CatatanPersetujuan *string    `json:"catatan_persetujuan"`
	DibuatPada         time.Time  `json:"dibuat_pada"`
	DiperbaruiPada     time.Time  `json:"diperbarui_pada"`
}

// Penggajian represents penggajian table
type Penggajian struct {
	ID                    int        `json:"id"`
	PenggunaID            int        `json:"pengguna_id"`
	Bulan                 int        `json:"bulan"`
	Tahun                 int        `json:"tahun"`
	GajiPokok             float64    `json:"gaji_pokok"`
	TotalPotongan         float64    `json:"total_potongan"`
	GajiBersih            float64    `json:"gaji_bersih"`
	Status                string     `json:"status"` // draft, dikirim_ke_keuangan, dibayar
	DihitungPada          time.Time  `json:"dihitung_pada"`
	DikirimKeKeuanganPada *time.Time `json:"dikirim_ke_keuangan_pada"`
	DibayarPada           *time.Time `json:"dibayar_pada"`
	DibuatPada            time.Time  `json:"dibuat_pada"`
	DiperbaruiPada        time.Time  `json:"diperbarui_pada"`
}

// Pembayaran represents pembayaran table
type Pembayaran struct {
	ID                  int       `json:"id"`
	PenggajianID        int       `json:"penggajian_id"`
	TanggalPembayaran   time.Time `json:"tanggal_pembayaran"`
	MetodePembayaran    *string   `json:"metode_pembayaran"`
	ReferensiPembayaran *string   `json:"referensi_pembayaran"`
	DibayarOleh         int       `json:"dibayar_oleh"`
	Catatan             *string   `json:"catatan"`
	DibuatPada          time.Time `json:"dibuat_pada"`
	DiperbaruiPada      time.Time `json:"diperbarui_pada"`
}

// SaldoCuti represents saldo_cuti table
type SaldoCuti struct {
	ID             int       `json:"id"`
	PenggunaID     int       `json:"pengguna_id"`
	Tahun          int       `json:"tahun"`
	TotalHari      int       `json:"total_hari"`
	HariTerpakai   int       `json:"hari_terpakai"`
	SisaHari       int       `json:"sisa_hari"`
	DibuatPada     time.Time `json:"dibuat_pada"`
	DiperbaruiPada time.Time `json:"diperbarui_pada"`
}
