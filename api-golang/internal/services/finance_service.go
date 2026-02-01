package services

import (
	"time"

	"github.com/hris-system/api-golang/internal/database"
)

type FinanceService struct{}

func NewFinanceService() *FinanceService {
	return &FinanceService{}
}

type FinanceDashboardStats struct {
	TotalGajiHarusDibayar float64 `json:"total_gaji_harus_dibayar"`
	KaryawanSudahDibayar  int     `json:"karyawan_sudah_dibayar"`
	KaryawanBelumDibayar  int     `json:"karyawan_belum_dibayar"`
	TotalPengeluaranBulan float64 `json:"total_pengeluaran_bulan"`
	Periode               string  `json:"periode"`
}

// GetDashboardStats fetches statistics for the current month finance dashboard
func (s *FinanceService) GetDashboardStats() (*FinanceDashboardStats, error) {
	month := int(time.Now().Month())
	year := time.Now().Year()

	stats := &FinanceDashboardStats{
		Periode: time.Now().Format("January 2006"),
	}

	// 1. Total Gaji yang Harus Dibayarkan (Status: dikirim_ke_keuangan)
	// Ini adalah tagihan yang belum dibayar bulan ini
	err := database.DB.QueryRow(`
		SELECT COALESCE(SUM(gaji_bersih), 0)
		FROM penggajian
		WHERE bulan = ? AND tahun = ? AND status = 'dikirim_ke_keuangan'
	`, month, year).Scan(&stats.TotalGajiHarusDibayar)
	if err != nil {
		return nil, err
	}

	// 2. Jumlah Karyawan Sudah Dibayar (Status: dibayar/selesai)
	err = database.DB.QueryRow(`
		SELECT COUNT(*)
		FROM penggajian
		WHERE bulan = ? AND tahun = ? AND status = 'dibayar'
	`, month, year).Scan(&stats.KaryawanSudahDibayar)
	if err != nil {
		return nil, err
	}

	// 3. Jumlah Karyawan Belum Dibayar (Status: dikirim_ke_keuangan)
	// (Draft tidak dihitung karena belum masuk ranah finance)
	err = database.DB.QueryRow(`
		SELECT COUNT(*)
		FROM penggajian
		WHERE bulan = ? AND tahun = ? AND status = 'dikirim_ke_keuangan'
	`, month, year).Scan(&stats.KaryawanBelumDibayar)
	if err != nil {
		return nil, err
	}

	// 4. Total Pengeluaran Bulan Ini (Yang sudah dibayar)
	err = database.DB.QueryRow(`
		SELECT COALESCE(SUM(gaji_bersih), 0)
		FROM penggajian
		WHERE bulan = ? AND tahun = ? AND status = 'dibayar'
	`, month, year).Scan(&stats.TotalPengeluaranBulan)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

type MonthlyExpense struct {
	Bulan int     `json:"bulan"`
	Tahun int     `json:"tahun"`
	Total float64 `json:"total"`
}

// GetMonthlyExpenses returns the trend of salary expenses for the last 6 months
func (s *FinanceService) GetMonthlyExpenses() ([]MonthlyExpense, error) {
	query := `
		SELECT bulan, tahun, COALESCE(SUM(gaji_bersih), 0) as total
		FROM penggajian
		WHERE status = 'dibayar'
		GROUP BY tahun, bulan
		ORDER BY tahun DESC, bulan DESC
		LIMIT 6
	`
	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var expenses []MonthlyExpense
	for rows.Next() {
		var expense MonthlyExpense
		if err := rows.Scan(&expense.Bulan, &expense.Tahun, &expense.Total); err != nil {
			return nil, err
		}
		expenses = append(expenses, expense)
	}
	return expenses, nil
}
