package hr

import (
	"time"

	"github.com/hris-system/api-golang/internal/database"
)

type MonitoringService struct{}

func NewMonitoringService() *MonitoringService {
	return &MonitoringService{}
}

type PresensiItem struct {
	ID          int        `json:"id"`
	PenggunaID  int        `json:"pengguna_id"`
	NamaLengkap string     `json:"nama_lengkap"`
	Divisi      *string    `json:"divisi"`
	Tanggal     string     `json:"tanggal"`
	WaktuMasuk  *time.Time `json:"waktu_masuk"`
	WaktuPulang *time.Time `json:"waktu_pulang"`
	Status      string     `json:"status"`
	Catatan     *string    `json:"catatan"`
}

// GetDailyMonitoring returns attendance list for a specific date
func (s *MonitoringService) GetDailyMonitoring(date string) ([]PresensiItem, error) {
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}

	// Query: Get all employees and their attendance for the date
	// Left Join to include employees who haven't clocked in (status will be NULL/calculated)
	query := `
		SELECT 
			p.id as pengguna_id,
			p.nama_lengkap,
			d.nama as divisi,
			COALESCE(pr.id, 0) as id,
			COALESCE(pr.tanggal, ?) as tanggal,
			pr.waktu_masuk,
			pr.waktu_pulang,
			COALESCE(pr.status, 'tidak_hadir') as status, -- Default 'tidak_hadir' if no record
			pr.catatan
		FROM pengguna p
		LEFT JOIN divisi d ON p.divisi_id = d.id
		LEFT JOIN presensi pr ON p.id = pr.pengguna_id AND pr.tanggal = ?
		WHERE p.peran_id = 4 -- Only Karyawan
		AND p.aktif = TRUE
		ORDER BY p.nama_lengkap ASC
	`

	rows, err := database.DB.Query(query, date, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []PresensiItem
	for rows.Next() {
		var item PresensiItem
		var tanggalStr string

		err := rows.Scan(
			&item.PenggunaID,
			&item.NamaLengkap,
			&item.Divisi,
			&item.ID,
			&tanggalStr,
			&item.WaktuMasuk,
			&item.WaktuPulang,
			&item.Status,
			&item.Catatan,
		)
		if err != nil {
			return nil, err
		}
		item.Tanggal = date
		results = append(results, item)
	}

	return results, nil
}
