package finance

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"strconv"
	"time"

	"github.com/hris-system/api-golang/internal/database"
)

type SalaryReportRow struct {
	ID               int
	NamaLengkap      string
	Divisi           string
	Bulan            int
	Tahun            int
	GajiPokok        float64
	TotalPotongan    float64
	GajiBersih       float64
	Status           string
	DibayarPada      *time.Time
	MetodePembayaran *string
	NamaBank         *string
	NomorRekening    *string
}

func (s *FinanceService) GetReportData(month, year int) ([]SalaryReportRow, error) {
	// Query to fetch salary data
	query := `
		SELECT 
			p.id,
			u.nama_lengkap,
			COALESCE(d.nama, '-') as divisi,
			p.bulan,
			p.tahun,
			p.gaji_pokok,
			p.total_potongan,
			p.gaji_bersih,
			p.status,
			p.dibayar_pada,
			u.nama_bank,
			u.nomor_rekening
		FROM penggajian p
		JOIN pengguna u ON p.pengguna_id = u.id
		LEFT JOIN divisi d ON u.divisi_id = d.id
		WHERE p.bulan = ? AND p.tahun = ? AND p.status = 'dibayar'
		ORDER BY u.nama_lengkap ASC
	`

	// Debug log
	fmt.Printf("[DEBUG] GetReportData: Month=%d, Year=%d\n", month, year)

	rows, err := database.DB.Query(query, month, year)
	if err != nil {
		fmt.Printf("[DEBUG] Query Error: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var reportRows []SalaryReportRow
	for rows.Next() {
		var row SalaryReportRow
		var bank, rek *string

		err := rows.Scan(
			&row.ID,
			&row.NamaLengkap,
			&row.Divisi,
			&row.Bulan,
			&row.Tahun,
			&row.GajiPokok,
			&row.TotalPotongan,
			&row.GajiBersih,
			&row.Status,
			&row.DibayarPada,
			&bank,
			&rek,
		)
		if err != nil {
			return nil, err
		}
		row.NamaBank = bank
		row.NomorRekening = rek
		reportRows = append(reportRows, row)
	}
	return reportRows, nil
}

func (s *FinanceService) GenerateSalaryCSV(month, year int) ([]byte, string, error) {
	reportRows, err := s.GetReportData(month, year)
	if err != nil {
		return nil, "", err
	}

	// Create CSV
	b := &bytes.Buffer{}
	w := csv.NewWriter(b)

	// Header
	header := []string{
		"ID Gaji", "Nama Karyawan", "Divisi", "Periode",
		"Gaji Pokok", "Potongan", "Gaji Bersih",
		"Tanggal Bayar", "Bank", "No. Rekening",
	}
	if err := w.Write(header); err != nil {
		return nil, "", err
	}

	// Rows
	for _, row := range reportRows {
		payDate := "-"
		if row.DibayarPada != nil {
			payDate = row.DibayarPada.Format("2006-01-02")
		}

		bankInfo := "-"
		if row.NamaBank != nil && row.NomorRekening != nil {
			bankInfo = fmt.Sprintf("%s (%s)", *row.NamaBank, *row.NomorRekening)
		} else if row.NamaBank != nil {
			bankInfo = *row.NamaBank
		}

		record := []string{
			strconv.Itoa(row.ID),
			row.NamaLengkap,
			row.Divisi,
			fmt.Sprintf("%d-%d", row.Bulan, row.Tahun),
			fmt.Sprintf("%.0f", row.GajiPokok),
			fmt.Sprintf("%.0f", row.TotalPotongan),
			fmt.Sprintf("%.0f", row.GajiBersih),
			payDate,
			bankInfo,
			"", // Separate column for ref if needed
		}

		// Adjust bank column logic slightly to match header
		record[8] = ""
		if row.NamaBank != nil {
			record[8] = *row.NamaBank
		}
		record[9] = ""
		if row.NomorRekening != nil {
			record[9] = *row.NomorRekening
		}

		if err := w.Write(record); err != nil {
			return nil, "", err
		}
	}

	w.Flush()
	if err := w.Error(); err != nil {
		return nil, "", err
	}

	filename := fmt.Sprintf("laporan_gaji_%d_%d.csv", month, year)
	return b.Bytes(), filename, nil
}
