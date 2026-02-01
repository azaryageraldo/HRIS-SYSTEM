package hr

import (
	"github.com/hris-system/api-golang/internal/database"
)

type PayrollService struct{}

func NewPayrollService() *PayrollService {
	return &PayrollService{}
}

type PayrollDraft struct {
	ID            int     `json:"id"`
	PenggunaID    int     `json:"pengguna_id"`
	NamaLengkap   string  `json:"nama_lengkap"`
	Divisi        *string `json:"divisi"`
	Bulan         int     `json:"bulan"`
	Tahun         int     `json:"tahun"`
	GajiPokok     float64 `json:"gaji_pokok"`
	TotalPotongan float64 `json:"total_potongan"`
	GajiBersih    float64 `json:"gaji_bersih"`
	Status        string  `json:"status"`
}

// GetPayrollDrafts fetches all payroll records with status 'draft' for a specific month/year
func (s *PayrollService) GetPayrollDrafts(month, year int) ([]PayrollDraft, error) {
	query := `
		SELECT 
			p.id,
			p.pengguna_id,
			u.nama_lengkap,
			d.nama as divisi,
			p.bulan,
			p.tahun,
			p.gaji_pokok,
			p.total_potongan,
			p.gaji_bersih,
			p.status
		FROM penggajian p
		JOIN pengguna u ON p.pengguna_id = u.id
		LEFT JOIN divisi d ON u.divisi_id = d.id
		WHERE p.bulan = ? AND p.tahun = ? AND p.status = 'draft'
		ORDER BY u.nama_lengkap ASC
	`

	rows, err := database.DB.Query(query, month, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var drafts []PayrollDraft
	for rows.Next() {
		var draft PayrollDraft
		err := rows.Scan(
			&draft.ID,
			&draft.PenggunaID,
			&draft.NamaLengkap,
			&draft.Divisi,
			&draft.Bulan,
			&draft.Tahun,
			&draft.GajiPokok,
			&draft.TotalPotongan,
			&draft.GajiBersih,
			&draft.Status,
		)
		if err != nil {
			return nil, err
		}
		drafts = append(drafts, draft)
	}

	return drafts, nil
}

// GetPayrollDetails fetches payroll records for a specific month/year and optional status
func (s *PayrollService) GetPayrollDetails(month, year int, status string) ([]PayrollDraft, error) {
	query := `
		SELECT 
			p.id,
			p.pengguna_id,
			u.nama_lengkap,
			d.nama as divisi,
			p.bulan,
			p.tahun,
			p.gaji_pokok,
			p.total_potongan,
			p.gaji_bersih,
			p.status
		FROM penggajian p
		JOIN pengguna u ON p.pengguna_id = u.id
		LEFT JOIN divisi d ON u.divisi_id = d.id
		WHERE p.bulan = ? AND p.tahun = ?
	`

	args := []interface{}{month, year}

	if status != "" {
		query += " AND p.status = ?"
		args = append(args, status)
	}

	query += " ORDER BY u.nama_lengkap ASC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var details []PayrollDraft
	for rows.Next() {
		var d PayrollDraft
		err := rows.Scan(
			&d.ID,
			&d.PenggunaID,
			&d.NamaLengkap,
			&d.Divisi,
			&d.Bulan,
			&d.Tahun,
			&d.GajiPokok,
			&d.TotalPotongan,
			&d.GajiBersih,
			&d.Status,
		)
		if err != nil {
			return nil, err
		}
		details = append(details, d)
	}

	return details, nil
}

// SendToFinance updates status of all drafts in a month to 'dikirim_ke_keuangan'
func (s *PayrollService) SendToFinance(month, year int) error {
	query := `
		UPDATE penggajian 
		SET status = 'dikirim_ke_keuangan', dikirim_ke_keuangan_pada = NOW() 
		WHERE bulan = ? AND tahun = ? AND status = 'draft'
	`
	_, err := database.DB.Exec(query, month, year)
	return err
}

// GetPayrollHistory fetches history of sent payrolls grouped by month
func (s *PayrollService) GetPayrollHistory() ([]map[string]interface{}, error) {
	// Simple query to get distinct periods that are NOT draft
	query := `
		SELECT 
			bulan, tahun, status, COUNT(*) as total_karyawan, SUM(gaji_bersih) as total_gaji
		FROM penggajian
		WHERE status != 'draft'
		GROUP BY bulan, tahun, status
		ORDER BY tahun DESC, bulan DESC
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []map[string]interface{}
	for rows.Next() {
		var bulan, tahun, totalKaryawan int
		var totalGaji float64
		var status string

		err := rows.Scan(&bulan, &tahun, &status, &totalKaryawan, &totalGaji)
		if err != nil {
			continue
		}

		history = append(history, map[string]interface{}{
			"bulan":          bulan,
			"tahun":          tahun,
			"status":         status,
			"total_karyawan": totalKaryawan,
			"total_gaji":     totalGaji,
		})
	}
	return history, nil
}

// GenerateVirtualDraft is a helper for the seeder to calculate salary
// In a real app this would use the config rules
func (s *PayrollService) GenerateVirtualDraft(userID int, month, year int) (float64, float64, float64, error) {
	// Mock calculation
	// 1. Get Gaji Pokok (assume from some config or fixed for now)
	// For demo, we'll fetch from a dummy or just use a random base

	// Real implementation should query `konfigurasi_gaji` table
	// Here for MVP/Demo we just return standard values based on role/division if possible,
	// or let the caller (Seeder) decide.

	return 0, 0, 0, nil
}
