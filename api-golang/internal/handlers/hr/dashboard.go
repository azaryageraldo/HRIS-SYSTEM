package hr

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/hr"
)

// GetHRDashboardStats handles stats for HR Dashboard
func GetHRDashboardStats(c *gin.Context) {
	service := hr.NewDashboardService()
	stats, err := service.GetStats()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data dashboard",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}
