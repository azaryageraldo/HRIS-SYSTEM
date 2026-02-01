package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services"
)

// GetPayrollDraftsHandler fetches drafts for specific month
func GetPayrollDraftsHandler(c *gin.Context) {
	monthStr := c.Query("bulan")
	yearStr := c.Query("tahun")

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if month == 0 || year == 0 {
		now := time.Now()
		month = int(now.Month())
		year = now.Year()
	}

	service := services.NewPayrollService()
	drafts, err := service.GetPayrollDrafts(month, year)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data draft gaji",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    drafts,
		"meta": gin.H{
			"bulan": month,
			"tahun": year,
		},
	})
}

// SendPayrollToFinanceHandler submits the draft
func SendPayrollToFinanceHandler(c *gin.Context) {
	var input struct {
		Bulan int `json:"bulan" binding:"required"`
		Tahun int `json:"tahun" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	service := services.NewPayrollService()
	err := service.SendToFinance(input.Bulan, input.Tahun)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengirim draft ke keuangan",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Draft gaji berhasil dikirim ke bagian keuangan",
	})
}

// GetPayrollHistoryHandler fetches history
func GetPayrollHistoryHandler(c *gin.Context) {
	service := services.NewPayrollService()
	history, err := service.GetPayrollHistory()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil riwayat gaji",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    history,
	})
}
