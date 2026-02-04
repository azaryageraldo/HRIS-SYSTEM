package employee

import (
	"database/sql"
	"errors"
	"time"

	"github.com/hris-system/api-golang/internal/database"
	"github.com/hris-system/api-golang/internal/models"
)

type LeaveService struct{}

func NewLeaveService() *LeaveService {
	return &LeaveService{}
}

func (s *LeaveService) GetBalance(userID int, year int) (*models.SaldoCuti, error) {
	query := `
		SELECT id, pengguna_id, tahun, total_hari, hari_terpakai, sisa_hari, diperbarui_pada
		FROM saldo_cuti
		WHERE pengguna_id = ? AND tahun = ?
	`
	var saldo models.SaldoCuti
	err := database.DB.QueryRow(query, userID, year).Scan(
		&saldo.ID, &saldo.PenggunaID, &saldo.Tahun, &saldo.TotalHari,
		&saldo.HariTerpakai, &saldo.SisaHari, &saldo.DiperbaruiPada,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			// If no record, return default/empty balance logic or error
			// For now, let's return a default "0" balance or create one if policy dictates
			return &models.SaldoCuti{
				PenggunaID:   userID,
				Tahun:        year,
				TotalHari:    12, // Default
				HariTerpakai: 0,
				SisaHari:     12,
			}, nil
		}
		return nil, err
	}
	return &saldo, nil
}

type LeaveRequestInput struct {
	TipeCuti       string `json:"tipe_cuti" binding:"required"` // cuti, izin, sakit
	TanggalMulai   string `json:"tanggal_mulai" binding:"required"`
	TanggalSelesai string `json:"tanggal_selesai" binding:"required"`
	Alasan         string `json:"alasan" binding:"required"`
}

func (s *LeaveService) RequestLeave(userID int, req LeaveRequestInput) error {
	// 1. Parse dates
	layout := "2006-01-02"
	start, err := time.Parse(layout, req.TanggalMulai)
	if err != nil {
		return errors.New("format tanggal mulai tidak valid")
	}
	end, err := time.Parse(layout, req.TanggalSelesai)
	if err != nil {
		return errors.New("format tanggal selesai tidak valid")
	}

	if end.Before(start) {
		return errors.New("tanggal selesai tidak boleh lebih awal dari tanggal mulai")
	}

	// Calculate days (simple calculation, improved logic would skip weekends/holidays)
	days := int(end.Sub(start).Hours()/24) + 1

	// 2. Check Balance if type is 'cuti'
	if req.TipeCuti == "cuti" {
		balance, err := s.GetBalance(userID, start.Year())
		if err != nil {
			return err
		}
		if balance.SisaHari < days {
			return errors.New("sisa cuti tidak mencukupi")
		}
	}

	// 3. Insert Request
	// Note: We are NOT deducting balance yet. Balance is deducted upon APPROVAL (HR side).
	// Status default: 'menunggu'
	query := `
		INSERT INTO pengajuan_cuti (pengguna_id, tipe_cuti, tanggal_mulai, tanggal_selesai, total_hari, alasan, status, dibuat_pada, diperbarui_pada)
		VALUES (?, ?, ?, ?, ?, ?, 'menunggu', NOW(), NOW())
	`
	_, err = database.DB.Exec(query, userID, req.TipeCuti, start, end, days, req.Alasan)
	return err
}

func (s *LeaveService) GetHistory(userID int) ([]models.PengajuanCuti, error) {
	query := `
		SELECT id, tipe_cuti, tanggal_mulai, tanggal_selesai, total_hari, alasan, status, dibuat_pada
		FROM pengajuan_cuti
		WHERE pengguna_id = ?
		ORDER BY id DESC
	`
	rows, err := database.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.PengajuanCuti
	for rows.Next() {
		var p models.PengajuanCuti
		if err := rows.Scan(&p.ID, &p.TipeCuti, &p.TanggalMulai, &p.TanggalSelesai, &p.TotalHari, &p.Alasan, &p.Status, &p.DibuatPada); err != nil {
			return nil, err
		}
		history = append(history, p)
	}
	return history, nil
}
