package employee

import (
	"database/sql"
	"errors"

	"github.com/hris-system/api-golang/internal/database"
	"github.com/hris-system/api-golang/internal/models"
)

type SalaryService struct{}

func NewSalaryService() *SalaryService {
	return &SalaryService{}
}

// GetSalaryHistory retrieves paid salary records for a user
func (s *SalaryService) GetSalaryHistory(userID int, limit int) ([]models.Penggajian, error) {
	query := `
		SELECT id, bulan, tahun, gaji_pokok, total_potongan, gaji_bersih, status, dibayar_pada
		FROM penggajian
		WHERE pengguna_id = ? AND status = 'dibayar'
		ORDER BY tahun DESC, bulan DESC
		LIMIT ?
	`
	rows, err := database.DB.Query(query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.Penggajian
	for rows.Next() {
		var p models.Penggajian
		if err := rows.Scan(&p.ID, &p.Bulan, &p.Tahun, &p.GajiPokok, &p.TotalPotongan, &p.GajiBersih, &p.Status, &p.DibayarPada); err != nil {
			return nil, err
		}
		history = append(history, p)
	}
	return history, nil
}

// GetSalaryDetail retrieves full details of a specific payroll record
func (s *SalaryService) GetSalaryDetail(userID int, id int) (*models.Penggajian, error) {
	query := `
		SELECT id, pengguna_id, bulan, tahun, gaji_pokok, total_potongan, gaji_bersih, status, dibayar_pada, dibuat_pada
		FROM penggajian
		WHERE id = ? AND pengguna_id = ?
	`
	var p models.Penggajian
	err := database.DB.QueryRow(query, id, userID).Scan(
		&p.ID, &p.PenggunaID, &p.Bulan, &p.Tahun, &p.GajiPokok, &p.TotalPotongan, &p.GajiBersih, &p.Status, &p.DibayarPada, &p.DibuatPada,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("data gaji tidak ditemukan")
		}
		return nil, err
	}
	return &p, nil
}
