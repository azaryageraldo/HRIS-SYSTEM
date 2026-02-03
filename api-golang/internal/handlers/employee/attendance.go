package employee

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/employee"
)

type AttendanceRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func GetCombinedAttendanceDataHandler(c *gin.Context) {
	// Returns Today Status and History in one go for efficient frontend loading
	userID, _ := c.Get("user_id")
	uid := int(userID.(float64))

	service := employee.NewAttendanceService()

	today, err := service.GetTodayStatus(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get status", "error": err.Error()})
		return
	}

	history, err := service.GetAttendanceHistory(uid, 5) // Last 5 records
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get history", "error": err.Error()})
		return
	}

	// Also get config for UI radius display (bonus)
	config, _ := service.GetActiveConfig()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"today":   today,
			"history": history,
			"office":  config, // Send office location so frontend can calculate distance
		},
	})
}

func ClockInHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req AttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid location data"})
		return
	}

	service := employee.NewAttendanceService()
	err := service.ClockIn(int(userID.(float64)), req.Latitude, req.Longitude)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Berhasil melakukan presensi masuk"})
}

func ClockOutHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req AttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid location data"})
		return
	}

	service := employee.NewAttendanceService()
	err := service.ClockOut(int(userID.(float64)), req.Latitude, req.Longitude)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Berhasil melakukan presensi pulang"})
}
