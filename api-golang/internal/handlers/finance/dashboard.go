package finance

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/finance"
)

// GetFinanceDashboardHandler fetches dashboard stats
func GetFinanceDashboardHandler(c *gin.Context) {
	service := finance.NewFinanceService()

	stats, err := service.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data dashboard",
			"error":   err.Error(),
		})
		return
	}

	expenses, err := service.GetMonthlyExpenses()
	if err != nil {
		// Log error but stick with empty expenses if fails
		expenses = []finance.MonthlyExpense{}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"stats":    stats,
			"expenses": expenses,
		},
	})
}
