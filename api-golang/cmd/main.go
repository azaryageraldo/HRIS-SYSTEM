package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/database"
	"github.com/hris-system/api-golang/internal/handlers"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "OK",
			"service":   "Golang API - Panel HR, Keuangan, Karyawan",
			"timestamp": gin.H{},
		})
	})

	// API info endpoint
	router.GET("/api", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "HRIS Golang API - Panel HR, Keuangan, Karyawan Service",
			"version": "1.0.0",
			"endpoints": gin.H{
				"health":          "/health",
				"presensiMasuk":   "/api/presensi/masuk",
				"presensiPulang":  "/api/presensi/pulang",
				"presensiHariIni": "/api/presensi/hari-ini",
				"pengajuanCuti":   "/api/cuti",
				"approveCuti":     "/api/cuti/:id/approve",
				"penggajian":      "/api/penggajian",
				"pembayaran":      "/api/pembayaran",
				"slipGaji":        "/api/slip/:id",
			},
		})
	})

	// API route groups
	api := router.Group("/api")
	{
		// Presensi endpoints
		api.POST("/presensi/masuk", handlers.CreatePresensi)
		api.POST("/presensi/pulang", handlers.UpdatePresensiPulang)
		api.GET("/presensi/hari-ini", handlers.GetPresensiHariIni)

		// Cuti endpoints
		api.POST("/cuti", handlers.CreatePengajuanCuti)
		api.GET("/cuti", handlers.GetPengajuanCuti)
		api.PUT("/cuti/:id/approve", handlers.ApprovePengajuanCuti)

		// HR Endpoints
		api.GET("/hr/dashboard", handlers.GetHRDashboardStats)
		api.GET("/hr/presensi", handlers.GetPresensiMonitoring)
		api.GET("/hr/cuti", handlers.GetAllLeaveRequestsHandler)
		api.PUT("/hr/cuti/:id/process", handlers.ProcessLeaveRequestHandler)
		api.GET("/hr/gaji/draft", handlers.GetPayrollDraftsHandler)
		api.POST("/hr/gaji/send", handlers.SendPayrollToFinanceHandler)
		api.GET("/hr/gaji/history", handlers.GetPayrollHistoryHandler)

		// Finance Routes
		api.GET("/finance/dashboard", handlers.GetFinanceDashboardHandler)

		// Seeder
		api.POST("/seed/presensi", handlers.SeedPresensiData)
		api.POST("/seed/cuti", handlers.SeedLeaveData)
		api.POST("/seed/gaji", handlers.SeedPayrollData)

		// TODO: Add more endpoints
		// api.GET("/penggajian", handlers.GetPenggajian)
		// api.GET("/pembayaran", handlers.GetPembayaran)
		// api.GET("/slip/:id", handlers.GetSlipGaji)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Golang API (Panel HR, Keuangan, Karyawan) running on port %s\n", port)
	if err := router.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
