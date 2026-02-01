package seeder

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hris-system/api-golang/internal/database"
)

// SeedPresensiData generates dummy attendance data
func SeedPresensiData(c *gin.Context) {
	// Get all karyawan ID
	rows, err := database.DB.Query("SELECT id FROM pengguna WHERE peran_id = 4 AND aktif = TRUE")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data karyawan"})
		return
	}
	defer rows.Close()

	var karyawanIDs []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		karyawanIDs = append(karyawanIDs, id)
	}

	// Generate for last 7 days including today
	now := time.Now()
	generatedCount := 0

	for i := 0; i < 7; i++ {
		date := now.AddDate(0, 0, -i)
		dateStr := date.Format("2006-01-02")

		for _, uid := range karyawanIDs {
			// Check if exists
			var exists int
			database.DB.QueryRow("SELECT COUNT(*) FROM presensi WHERE pengguna_id = ? AND tanggal = ?", uid, dateStr).Scan(&exists)
			if exists > 0 {
				continue
			}

			// Random status
			randVal := rand.Intn(100)
			var status string
			var waktuMasuk, waktuPulang time.Time
			var masukStr, pulangStr *time.Time

			// 80% Hadir, 10% Terlambat, 10% Tidak Hadir
			if randVal < 80 {
				status = "hadir"
				waktuMasuk = time.Date(date.Year(), date.Month(), date.Day(), 7, 50+rand.Intn(10), 0, 0, time.Local)
				waktuPulang = waktuMasuk.Add(9 * time.Hour)
				masukStr = &waktuMasuk
				pulangStr = &waktuPulang
			} else if randVal < 90 {
				status = "terlambat"
				waktuMasuk = time.Date(date.Year(), date.Month(), date.Day(), 9, 5+rand.Intn(30), 0, 0, time.Local)
				waktuPulang = waktuMasuk.Add(9 * time.Hour)
				masukStr = &waktuMasuk
				pulangStr = &waktuPulang
			} else {
				status = "tidak_hadir"
			}

			lat := -6.200000
			long := 106.816666

			query := `
				INSERT INTO presensi (pengguna_id, tanggal, waktu_masuk, waktu_pulang, latitude_masuk, longitude_masuk, status, catatan)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`
			if status == "tidak_hadir" {
				// No check-in/out for absent
				database.DB.Exec(query, uid, dateStr, nil, nil, nil, nil, status, "Tanpa Keterangan")
			} else {
				database.DB.Exec(query, uid, dateStr, masukStr, pulangStr, lat, long, status, nil)
			}
			generatedCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Berhasil membuat %d data presensi dummy", generatedCount),
	})
}

// SeedLeaveData generates dummy leave requests
func SeedLeaveData(c *gin.Context) {
	// Get all karyawan ID
	rows, err := database.DB.Query("SELECT id FROM pengguna WHERE peran_id = 4 AND aktif = TRUE")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data karyawan"})
		return
	}
	defer rows.Close()

	var karyawanIDs []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		karyawanIDs = append(karyawanIDs, id)
	}

	types := []string{"cuti", "izin", "sakit"}
	reasons := []string{"Urusan Keluarga", "Sakit Demam", "Liburan Luar Kota", "Anak Sakit", "Bencana Alam"}
	statuses := []string{"menunggu", "disetujui", "ditolak"}

	count := 0
	for i := 0; i < 10; i++ { // Generate 10 requests
		uid := karyawanIDs[rand.Intn(len(karyawanIDs))]
		tipe := types[rand.Intn(len(types))]
		alasan := reasons[rand.Intn(len(reasons))]
		status := statuses[rand.Intn(len(statuses))]

		// Random date in current month
		now := time.Now()
		startDay := rand.Intn(20) + 1
		startDate := time.Date(now.Year(), now.Month(), startDay, 0, 0, 0, 0, time.Local)
		totalHari := rand.Intn(3) + 1
		endDate := startDate.AddDate(0, 0, totalHari-1)

		query := `
			INSERT INTO pengajuan_cuti (pengguna_id, tipe_cuti, tanggal_mulai, tanggal_selesai, total_hari, alasan, status, dibuat_pada)
			VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
		`

		res, err := database.DB.Exec(query, uid, tipe, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"), totalHari, alasan, status)
		if err == nil {
			count++
			// If approved/rejected, add approval data
			if status != "menunggu" {
				lid, _ := res.LastInsertId()
				db := database.DB
				db.Exec("UPDATE pengajuan_cuti SET disetujui_oleh = 2, tanggal_persetujuan = NOW(), catatan_persetujuan = 'Oke' WHERE id = ?", lid)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Berhasil membuat %d data pengajuan cuti dummy", count),
	})
}

// SeedPayrollData generates dummy payroll drafts
func SeedPayrollData(c *gin.Context) {
	// Get all karyawan ID
	rows, err := database.DB.Query("SELECT id FROM pengguna WHERE peran_id = 4 AND aktif = TRUE")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data karyawan"})
		return
	}
	defer rows.Close()

	var karyawanIDs []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		karyawanIDs = append(karyawanIDs, id)
	}

	month := int(time.Now().Month())
	year := time.Now().Year()
	count := 0

	for _, uid := range karyawanIDs {
		// Check if exists
		var exists int
		database.DB.QueryRow("SELECT COUNT(*) FROM penggajian WHERE pengguna_id = ? AND bulan = ? AND tahun = ?", uid, month, year).Scan(&exists)
		if exists > 0 {
			continue
		}

		// Random salary between 5jt - 15jt
		gajiPokok := float64(5000000 + rand.Intn(10000000))
		potongan := float64(rand.Intn(500000)) // Random deduction
		gajiBersih := gajiPokok - potongan

		query := `
			INSERT INTO penggajian (pengguna_id, bulan, tahun, gaji_pokok, total_potongan, gaji_bersih, status, dihitung_pada, dibuat_pada)
			VALUES (?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())
		`

		_, err := database.DB.Exec(query, uid, month, year, gajiPokok, potongan, gajiBersih)
		if err == nil {
			count++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Berhasil membuat %d draft gaji dummy untuk bulan ini", count),
	})
}
