package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/database"
)

// CreatePengajuanCuti creates a new leave request
func CreatePengajuanCuti(c *gin.Context) {
	var input struct {
		PenggunaID     int    `json:"pengguna_id" binding:"required"`
		TipeCuti       string `json:"tipe_cuti" binding:"required"`
		TanggalMulai   string `json:"tanggal_mulai" binding:"required"`
		TanggalSelesai string `json:"tanggal_selesai" binding:"required"`
		Alasan         string `json:"alasan" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	// Parse dates
	startDate, _ := time.Parse("2006-01-02", input.TanggalMulai)
	endDate, _ := time.Parse("2006-01-02", input.TanggalSelesai)

	// Calculate total days
	totalHari := int(endDate.Sub(startDate).Hours()/24) + 1

	query := `
		INSERT INTO pengajuan_cuti 
		(pengguna_id, tipe_cuti, tanggal_mulai, tanggal_selesai, total_hari, alasan, status) 
		VALUES (?, ?, ?, ?, ?, ?, 'menunggu')
	`

	result, err := database.DB.Exec(query,
		input.PenggunaID,
		input.TipeCuti,
		input.TanggalMulai,
		input.TanggalSelesai,
		totalHari,
		input.Alasan,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengajukan cuti",
			"error":   err.Error(),
		})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Pengajuan cuti berhasil",
		"data": gin.H{
			"id":         id,
			"total_hari": totalHari,
			"status":     "menunggu",
		},
	})
}

// GetPengajuanCuti gets leave requests
func GetPengajuanCuti(c *gin.Context) {
	penggunaID := c.Query("pengguna_id")
	status := c.Query("status")

	query := `
		SELECT 
			pc.id, pc.pengguna_id, pc.tipe_cuti, pc.tanggal_mulai, 
			pc.tanggal_selesai, pc.total_hari, pc.alasan, pc.status,
			pc.tanggal_persetujuan, pc.catatan_persetujuan,
			p.nama_lengkap
		FROM pengajuan_cuti pc
		JOIN pengguna p ON pc.pengguna_id = p.id
		WHERE 1=1
	`

	args := []interface{}{}

	if penggunaID != "" {
		query += " AND pc.pengguna_id = ?"
		args = append(args, penggunaID)
	}

	if status != "" {
		query += " AND pc.status = ?"
		args = append(args, status)
	}

	query += " ORDER BY pc.dibuat_pada DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data pengajuan cuti",
			"error":   err.Error(),
		})
		return
	}
	defer rows.Close()

	var pengajuanList []map[string]interface{}
	for rows.Next() {
		var (
			id, penggunaID, totalHari              int
			tipeCuti, alasan, status, namaLengkap  string
			tanggalMulai, tanggalSelesai           string
			tanggalPersetujuan, catatanPersetujuan *string
		)

		err := rows.Scan(
			&id, &penggunaID, &tipeCuti, &tanggalMulai,
			&tanggalSelesai, &totalHari, &alasan, &status,
			&tanggalPersetujuan, &catatanPersetujuan,
			&namaLengkap,
		)

		if err != nil {
			continue
		}

		pengajuanList = append(pengajuanList, map[string]interface{}{
			"id":                  id,
			"pengguna_id":         penggunaID,
			"nama_lengkap":        namaLengkap,
			"tipe_cuti":           tipeCuti,
			"tanggal_mulai":       tanggalMulai,
			"tanggal_selesai":     tanggalSelesai,
			"total_hari":          totalHari,
			"alasan":              alasan,
			"status":              status,
			"tanggal_persetujuan": tanggalPersetujuan,
			"catatan_persetujuan": catatanPersetujuan,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    pengajuanList,
	})
}

// ApprovePengajuanCuti approves or rejects leave request
func ApprovePengajuanCuti(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Status             string  `json:"status" binding:"required"` // disetujui / ditolak
		DisetujuiOleh      int     `json:"disetujui_oleh" binding:"required"`
		CatatanPersetujuan *string `json:"catatan_persetujuan"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	query := `
		UPDATE pengajuan_cuti 
		SET status = ?, disetujui_oleh = ?, tanggal_persetujuan = NOW(), catatan_persetujuan = ?
		WHERE id = ?
	`

	result, err := database.DB.Exec(query, input.Status, input.DisetujuiOleh, input.CatatanPersetujuan, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memproses pengajuan cuti",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Pengajuan cuti tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pengajuan cuti berhasil diproses",
	})
}
