package finance

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/finance"
)

// GetPendingPaymentsHandler fetches list of employees to be paid
func GetPendingPaymentsHandler(c *gin.Context) {
	service := finance.NewFinanceService()
	payments, err := service.GetPendingPayments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data pembayaran",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    payments,
	})
}

// ProcessPaymentHandler processes a salary payment
func ProcessPaymentHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	service := finance.NewFinanceService()
	err := service.ProcessPayment(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memproses pembayaran",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pembayaran berhasil diproses",
	})
}

// GetPaymentHistoryHandler fetches history of paid salaries
func GetPaymentHistoryHandler(c *gin.Context) {
	service := finance.NewFinanceService()
	payments, err := service.GetPaymentHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil riwayat pembayaran",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    payments,
	})
}
