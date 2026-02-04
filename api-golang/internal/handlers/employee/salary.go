package employee

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/services/employee"
)

func GetSalaryHistoryHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	service := employee.NewSalaryService()

	history, err := service.GetSalaryHistory(int(userID.(float64)), 12) // Last 12 months
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": history})
}

func GetSalaryDetailHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID"})
		return
	}

	service := employee.NewSalaryService()
	detail, err := service.GetSalaryDetail(int(userID.(float64)), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": detail})
}
