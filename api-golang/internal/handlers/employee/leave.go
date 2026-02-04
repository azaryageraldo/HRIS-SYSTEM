package employee

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/employee"
)

func GetLeaveBalanceHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	service := employee.NewLeaveService()

	// Use current year
	year := time.Now().Year()

	balance, err := service.GetBalance(int(userID.(float64)), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": balance})
}

func RequestLeaveHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req employee.LeaveRequestInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request data"})
		return
	}

	service := employee.NewLeaveService()
	err := service.RequestLeave(int(userID.(float64)), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Pengajuan cuti berhasil dikirim"})
}

func GetLeaveHistoryHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	service := employee.NewLeaveService()

	history, err := service.GetHistory(int(userID.(float64)))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": history})
}
