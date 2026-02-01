package hr

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/hr"
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

	service := hr.NewPayrollService()
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

// GetPayrollDetailsHandler fetches details for history
func GetPayrollDetailsHandler(c *gin.Context) {
	monthStr := c.Query("bulan")
	yearStr := c.Query("tahun")
	status := c.Query("status") // Optional status filter

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if month == 0 || year == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bulan dan tahun harus diisi"})
		return
	}

	service := hr.NewPayrollService()
	details, err := service.GetPayrollDetails(month, year, status)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil detail gaji",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    details,
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

	service := hr.NewPayrollService()
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
	service := hr.NewPayrollService()
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
