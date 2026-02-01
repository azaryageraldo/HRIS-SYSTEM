package models

type DashboardStats struct {
	Kehadiran struct {
		Hadir         int `json:"hadir"`
		Terlambat     int `json:"terlambat"`
		TidakHadir    int `json:"tidak_hadir"`
		TotalKaryawan int `json:"total_karyawan"`
	} `json:"kehadiran"`
	Pengajuan struct {
		Menunggu int `json:"menunggu"`
	} `json:"pengajuan"`
	Gaji struct {
		Bulan                   string  `json:"bulan"`
		Tahun                   int     `json:"tahun"`
		TotalEstimasi           float64 `json:"total_estimasi"`
		JumlahKaryawanTerhitung int     `json:"jumlah_karyawan_terhitung"`
	} `json:"gaji"`
}
