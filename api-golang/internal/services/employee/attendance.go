package employee

import (
	"database/sql"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/hris-system/api-golang/internal/database"
	"github.com/hris-system/api-golang/internal/models"
)

type AttendanceService struct{}

func NewAttendanceService() *AttendanceService {
	return &AttendanceService{}
}

// Haversine formula to calculate distance between two points in meters
func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371000 // Earth radius in meters

	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)

	lat1Rad := lat1 * (math.Pi / 180.0)
	lat2Rad := lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

func (s *AttendanceService) GetActiveConfig() (*models.KonfigurasiPresensi, error) {
	query := `
		SELECT id, jam_masuk_maksimal, jam_pulang_minimal, 
		       latitude_kantor, longitude_kantor, radius_meter
		FROM konfigurasi_presensi 
		WHERE aktif = TRUE 
		ORDER BY id DESC LIMIT 1
	`
	var config models.KonfigurasiPresensi
	err := database.DB.QueryRow(query).Scan(
		&config.ID, &config.JamMasukMaksimal, &config.JamPulangMinimal,
		&config.LatitudeKantor, &config.LongitudeKantor, &config.RadiusMeter,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("konfigurasi presensi belum diatur")
		}
		return nil, err
	}
	return &config, nil
}

func (s *AttendanceService) GetTodayStatus(userID int) (*models.Presensi, error) {
	query := `
		SELECT id, waktu_masuk, waktu_pulang, status
		FROM presensi
		WHERE pengguna_id = ? AND DATE(tanggal) = DATE(NOW())
	`
	var presensi models.Presensi
	var waktuMasuk, waktuPulang sql.NullTime

	err := database.DB.QueryRow(query, userID).Scan(
		&presensi.ID, &waktuMasuk, &waktuPulang, &presensi.Status,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Belum absen
		}
		return nil, err
	}

	if waktuMasuk.Valid {
		presensi.WaktuMasuk = &waktuMasuk.Time
	}
	if waktuPulang.Valid {
		presensi.WaktuPulang = &waktuPulang.Time
	}

	return &presensi, nil
}

func (s *AttendanceService) ClockIn(userID int, lat, long float64) error {
	// 1. Check if already clocked in
	today, err := s.GetTodayStatus(userID)
	if err != nil {
		return err
	}
	if today != nil {
		return errors.New("anda sudah melakukan presensi masuk hari ini")
	}

	// 2. Get Config & Validate Location
	config, err := s.GetActiveConfig()
	if err != nil {
		return err
	}

	distance := calculateDistance(lat, long, config.LatitudeKantor, config.LongitudeKantor)
	if distance > float64(config.RadiusMeter) {
		return fmt.Errorf("anda berada di luar radius kantor (%d meter). jarak anda: %.2f meter", config.RadiusMeter, distance)
	}

	// 3. Determine Status (Hadir / Terlambat)
	now := time.Now()
	status := "Hadir"

	// Parse JamMasukMaksimal (string "HH:MM:SS") to today's time
	layout := "15:04:05"
	maxTime, _ := time.Parse(layout, config.JamMasukMaksimal)
	// Create Date components from now
	deadline := time.Date(now.Year(), now.Month(), now.Day(), maxTime.Hour(), maxTime.Minute(), maxTime.Second(), 0, now.Location())

	if now.After(deadline) {
		status = "Terlambat"
	}

	// 4. Insert
	query := `
		INSERT INTO presensi (pengguna_id, tanggal, waktu_masuk, latitude_masuk, longitude_masuk, status, dibuat_pada, diperbarui_pada)
		VALUES (?, DATE(NOW()), NOW(), ?, ?, ?, NOW(), NOW())
	`
	_, err = database.DB.Exec(query, userID, lat, long, status)
	return err
}

func (s *AttendanceService) ClockOut(userID int, lat, long float64) error {
	// 1. Check if clocked in
	today, err := s.GetTodayStatus(userID)
	if err != nil {
		return err
	}
	if today == nil {
		return errors.New("anda belum melakukan presensi masuk")
	}
	if today.WaktuPulang != nil {
		return errors.New("anda sudah melakukan presensi pulang hari ini")
	}

	// 2. Validate Location
	config, err := s.GetActiveConfig()
	if err != nil {
		return err
	}

	distance := calculateDistance(lat, long, config.LatitudeKantor, config.LongitudeKantor)
	if distance > float64(config.RadiusMeter) {
		return fmt.Errorf("anda berada di luar radius kantor (%d meter). jarak anda: %.2f meter", config.RadiusMeter, distance)
	}

	// 3. Update
	query := `
		UPDATE presensi 
		SET waktu_pulang = NOW(), latitude_pulang = ?, longitude_pulang = ?, diperbarui_pada = NOW()
		WHERE id = ?
	`
	_, err = database.DB.Exec(query, lat, long, today.ID)
	return err
}

func (s *AttendanceService) GetAttendanceHistory(userID int, limit int) ([]models.Presensi, error) {
	query := `
		SELECT id, tanggal, waktu_masuk, waktu_pulang, status
		FROM presensi
		WHERE pengguna_id = ?
		ORDER BY tanggal DESC
		LIMIT ?
	`

	rows, err := database.DB.Query(query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.Presensi
	for rows.Next() {
		var p models.Presensi
		var wm, wp sql.NullTime
		if err := rows.Scan(&p.ID, &p.Tanggal, &wm, &wp, &p.Status); err != nil {
			return nil, err
		}
		if wm.Valid {
			p.WaktuMasuk = &wm.Time
		}
		if wp.Valid {
			p.WaktuPulang = &wp.Time
		}
		history = append(history, p)
	}
	return history, nil
}
