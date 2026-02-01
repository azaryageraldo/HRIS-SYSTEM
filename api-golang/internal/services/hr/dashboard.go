package hr

import (
	"database/sql"
	"time"

	"github.com/hris-system/api-golang/internal/database"
	"github.com/hris-system/api-golang/internal/models"
)

type DashboardService struct{}

func NewDashboardService() *DashboardService {
	return &DashboardService{}
}

func (s *DashboardService) GetStats() (*models.DashboardStats, error) {
	stats := &models.DashboardStats{}

	// 1. Kehadiran
	queryPresensi := `
		SELECT 
			COUNT(CASE WHEN status = 'hadir' THEN 1 END) as hadir,
			COUNT(CASE WHEN status = 'terlambat' THEN 1 END) as terlambat
		FROM presensi 
		WHERE tanggal = CURDATE()
	`
	err := database.DB.QueryRow(queryPresensi).Scan(&stats.Kehadiran.Hadir, &stats.Kehadiran.Terlambat)
	if err != nil {
		return nil, err
	}

	err = database.DB.QueryRow("SELECT COUNT(*) FROM pengguna WHERE peran_id = 4 AND aktif = TRUE").Scan(&stats.Kehadiran.TotalKaryawan)
	if err != nil {
		return nil, err
	}

	stats.Kehadiran.TidakHadir = stats.Kehadiran.TotalKaryawan - (stats.Kehadiran.Hadir + stats.Kehadiran.Terlambat)
	if stats.Kehadiran.TidakHadir < 0 {
		stats.Kehadiran.TidakHadir = 0
	}

	// 2. Pengajuan
	err = database.DB.QueryRow("SELECT COUNT(*) FROM pengajuan_cuti WHERE status = 'menunggu'").Scan(&stats.Pengajuan.Menunggu)
	if err != nil {
		return nil, err
	}

	// 3. Gaji
	currentMonth := time.Now().Month()
	currentYear := time.Now().Year()
	stats.Gaji.Bulan = currentMonth.String()
	stats.Gaji.Tahun = currentYear

	queryGaji := `
		SELECT 
			COALESCE(SUM(gaji_bersih), 0),
			COUNT(*)
		FROM penggajian 
		WHERE bulan = ? AND tahun = ?
	`
	err = database.DB.QueryRow(queryGaji, int(currentMonth), currentYear).Scan(&stats.Gaji.TotalEstimasi, &stats.Gaji.JumlahKaryawanTerhitung)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	return stats, nil
}
