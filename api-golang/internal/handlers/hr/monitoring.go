package hr

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/hr"
)

// GetPresensiMonitoring handles fetching attendance monitoring data
func GetPresensiMonitoring(c *gin.Context) {
	date := c.Query("date") // Format: YYYY-MM-DD

	service := hr.NewMonitoringService()
	data, err := service.GetDailyMonitoring(date)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data monitoring presensi",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
