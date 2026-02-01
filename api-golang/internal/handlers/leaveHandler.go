package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services"
)

// GetAllLeaveRequestsHandler fetches all leave requests
func GetAllLeaveRequestsHandler(c *gin.Context) {
	service := services.NewLeaveService()
	requests, err := service.GetAllLeaveRequests()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data pengajuan cuti",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    requests,
	})
}

// ProcessLeaveRequestHandler handles approval/rejection
func ProcessLeaveRequestHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var input struct {
		Status             string `json:"status" binding:"required"` // disetujui / ditolak
		DisetujuiOleh      int    `json:"disetujui_oleh" binding:"required"`
		CatatanPersetujuan string `json:"catatan_persetujuan"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	service := services.NewLeaveService()
	err = service.ProcessLeaveRequest(id, input.Status, input.CatatanPersetujuan, input.DisetujuiOleh)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memproses pengajuan cuti",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pengajuan cuti berhasil diproses",
	})
}
