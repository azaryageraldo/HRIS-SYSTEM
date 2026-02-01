package finance

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	financeService "github.com/hris-system/api-golang/internal/services/finance"
)

// ExportSalaryReport handles CSV export
func ExportSalaryReport(c *gin.Context) {
	service := financeService.NewFinanceService()

	monthStr := c.Query("month")
	yearStr := c.Query("year")

	if monthStr == "" || yearStr == "" {
		// Default to current month/year if not provided
		now := time.Now()
		if monthStr == "" {
			monthStr = strconv.Itoa(int(now.Month()))
		}
		if yearStr == "" {
			yearStr = strconv.Itoa(now.Year())
		}
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	csvData, filename, err := service.GenerateSalaryCSV(month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate report: " + err.Error()})
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "text/csv")
	c.Data(http.StatusOK, "text/csv", csvData)
}

// GetReportData returns JSON data for report preview
func GetReportData(c *gin.Context) {
	service := financeService.NewFinanceService()

	monthStr := c.Query("month")
	yearStr := c.Query("year")

	if monthStr == "" || yearStr == "" {
		// Default to current month/year if not provided
		now := time.Now()
		if monthStr == "" {
			monthStr = strconv.Itoa(int(now.Month()))
		}
		if yearStr == "" {
			yearStr = strconv.Itoa(now.Year())
		}
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	data, err := service.GetReportData(month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch report data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
