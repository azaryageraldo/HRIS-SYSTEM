package hr

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/database"
)

// CreatePresensi handles presensi masuk
func CreatePresensi(c *gin.Context) {
	var input struct {
		PenggunaID     int     `json:"pengguna_id" binding:"required"`
		LatitudeMasuk  float64 `json:"latitude_masuk" binding:"required"`
		LongitudeMasuk float64 `json:"longitude_masuk" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	// TODO: Validate GPS location against konfigurasi_presensi
	// TODO: Calculate status (hadir/terlambat) based on time

	now := time.Now()
	query := `
		INSERT INTO presensi 
		(pengguna_id, tanggal, waktu_masuk, latitude_masuk, longitude_masuk, status) 
		VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := database.DB.Exec(query,
		input.PenggunaID,
		now.Format("2006-01-02"),
		now,
		input.LatitudeMasuk,
		input.LongitudeMasuk,
		"hadir", // Default status, should be calculated
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan presensi",
			"error":   err.Error(),
		})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Presensi masuk berhasil",
		"data": gin.H{
			"id":          id,
			"waktu_masuk": now,
		},
	})
}

// UpdatePresensiPulang handles presensi pulang
func UpdatePresensiPulang(c *gin.Context) {
	var input struct {
		PenggunaID      int     `json:"pengguna_id" binding:"required"`
		LatitudePulang  float64 `json:"latitude_pulang" binding:"required"`
		LongitudePulang float64 `json:"longitude_pulang" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	now := time.Now()
	query := `
		UPDATE presensi 
		SET waktu_pulang = ?, latitude_pulang = ?, longitude_pulang = ?
		WHERE pengguna_id = ? AND tanggal = ? AND waktu_pulang IS NULL
	`

	result, err := database.DB.Exec(query,
		now,
		input.LatitudePulang,
		input.LongitudePulang,
		input.PenggunaID,
		now.Format("2006-01-02"),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan presensi pulang",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Presensi masuk tidak ditemukan atau sudah presensi pulang",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Presensi pulang berhasil",
		"data": gin.H{
			"waktu_pulang": now,
		},
	})
}

// GetPresensiHariIni gets today's attendance
func GetPresensiHariIni(c *gin.Context) {
	penggunaID := c.Query("pengguna_id")

	query := `
		SELECT 
			id, pengguna_id, tanggal, waktu_masuk, waktu_pulang, 
			status, catatan, dibuat_pada
		FROM presensi
		WHERE pengguna_id = ? AND tanggal = CURDATE()
	`

	var presensi struct {
		ID          int        `json:"id"`
		PenggunaID  int        `json:"pengguna_id"`
		Tanggal     string     `json:"tanggal"`
		WaktuMasuk  *time.Time `json:"waktu_masuk"`
		WaktuPulang *time.Time `json:"waktu_pulang"`
		Status      string     `json:"status"`
		Catatan     *string    `json:"catatan"`
		DibuatPada  time.Time  `json:"dibuat_pada"`
	}

	err := database.DB.QueryRow(query, penggunaID).Scan(
		&presensi.ID,
		&presensi.PenggunaID,
		&presensi.Tanggal,
		&presensi.WaktuMasuk,
		&presensi.WaktuPulang,
		&presensi.Status,
		&presensi.Catatan,
		&presensi.DibuatPada,
	)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Belum ada presensi hari ini",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    presensi,
	})
}
