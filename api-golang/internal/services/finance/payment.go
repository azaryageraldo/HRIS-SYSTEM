package finance

import (
	"github.com/hris-system/api-golang/internal/database"
)

type EmployeePayment struct {
	ID                  int     `json:"id"`
	PenggunaID          int     `json:"pengguna_id"`
	NamaLengkap         string  `json:"nama_lengkap"`
	Divisi              *string `json:"divisi"`
	Bulan               int     `json:"bulan"`
	Tahun               int     `json:"tahun"`
	GajiBersih          float64 `json:"gaji_bersih"`
	Status              string  `json:"status"`
	NomorRekening       *string `json:"nomor_rekening"`
	NamaPemilikRekening *string `json:"nama_pemilik_rekening"`
	Bank                *string `json:"bank"`
	DibayarPada         *string `json:"dibayar_pada"`
}

// GetPendingPayments fetches payrolls with status 'dikirim_ke_keuangan' including bank details
func (s *FinanceService) GetPendingPayments() ([]EmployeePayment, error) {
	query := `
		SELECT 
			p.id,
			p.pengguna_id,
			u.nama_lengkap,
			d.nama as divisi,
			p.bulan,
			p.tahun,
			p.gaji_bersih,
			p.status,
			u.nomor_rekening,
			u.nama_pemilik_rekening,
			p.dibayar_pada
		FROM penggajian p
		JOIN pengguna u ON p.pengguna_id = u.id
		LEFT JOIN divisi d ON u.divisi_id = d.id
		WHERE p.status = 'dikirim_ke_keuangan'
		ORDER BY u.nama_lengkap ASC
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []EmployeePayment
	for rows.Next() {
		var ep EmployeePayment
		err := rows.Scan(
			&ep.ID,
			&ep.PenggunaID,
			&ep.NamaLengkap,
			&ep.Divisi,
			&ep.Bulan,
			&ep.Tahun,
			&ep.GajiBersih,
			&ep.Status,
			&ep.NomorRekening,
			&ep.NamaPemilikRekening,
			&ep.DibayarPada,
		)
		if err != nil {
			return nil, err
		}
		payments = append(payments, ep)
	}

	return payments, nil
}

// ProcessPayment updates status to 'dibayar' for a specific payroll ID
func (s *FinanceService) ProcessPayment(id int) error {
	query := `
		UPDATE penggajian 
		SET status = 'dibayar', dibayar_pada = NOW() 
		WHERE id = ? AND status = 'dikirim_ke_keuangan'
	`
	_, err := database.DB.Exec(query, id)
	return err
}

// GetPaymentHistory fetches payrolls with status 'dibayar' (history)
func (s *FinanceService) GetPaymentHistory() ([]EmployeePayment, error) {
	query := `
		SELECT 
			p.id,
			p.pengguna_id,
			u.nama_lengkap,
			d.nama as divisi,
			p.bulan,
			p.tahun,
			p.gaji_bersih,
			p.status,
			u.nomor_rekening,
			u.nama_pemilik_rekening,
			p.dibayar_pada
		FROM penggajian p
		JOIN pengguna u ON p.pengguna_id = u.id
		LEFT JOIN divisi d ON u.divisi_id = d.id
		WHERE p.status = 'dibayar'
		ORDER BY p.dibayar_pada DESC
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []EmployeePayment
	for rows.Next() {
		var ep EmployeePayment
		err := rows.Scan(
			&ep.ID,
			&ep.PenggunaID,
			&ep.NamaLengkap,
			&ep.Divisi,
			&ep.Bulan,
			&ep.Tahun,
			&ep.GajiBersih,
			&ep.Status,
			&ep.NomorRekening,
			&ep.NamaPemilikRekening,
			&ep.DibayarPada,
		)
		if err != nil {
			return nil, err
		}
		payments = append(payments, ep)
	}

	return payments, nil
}
