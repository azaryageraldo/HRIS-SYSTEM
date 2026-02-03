package employee

import (
	"database/sql"
	"time"

	"github.com/hris-system/api-golang/internal/database"
)

type EmployeeService struct{}

func NewEmployeeService() *EmployeeService {
	return &EmployeeService{}
}

type DashboardStats struct {
	AttendanceStatus string     `json:"attendance_status"` // "Hadir", "Belum Absen", "Izin", "Cuti"
	CheckInTime      *string    `json:"check_in_time"`
	CheckOutTime     *string    `json:"check_out_time"`
	LeaveBalance     int        `json:"leave_balance"`
	LastSalaryAmount float64    `json:"last_salary_amount"`
	LastSalaryPeriod *string    `json:"last_salary_period"` // "Januari 2024"
}

func (s *EmployeeService) GetDashboardStats(userID int) (*DashboardStats, error) {
	stats := &DashboardStats{
		AttendanceStatus: "Belum Absen",
		LeaveBalance:     0,
		LastSalaryAmount: 0,
	}

	// 1. Get Today's Attendance
	today := time.Now().Format("2006-01-02")
	var status string
	var checkIn, checkOut *time.Time

	queryAttendance := `
		SELECT status, waktu_masuk, waktu_pulang 
		FROM presensi 
		WHERE pengguna_id = ? AND DATE(tanggal) = ?
	`
	err := database.DB.QueryRow(queryAttendance, userID, today).Scan(&status, &checkIn, &checkOut)
	if err == nil {
		stats.AttendanceStatus = status
		if checkIn != nil {
			t := checkIn.Format("15:04")
			stats.CheckInTime = &t
		}
		if checkOut != nil {
			t := checkOut.Format("15:04")
			stats.CheckOutTime = &t
		}
	} else if err != sql.ErrNoRows {
		return nil, err
	}

	// 2. Get Leave Balance
	// Assumes saldo_cuti table has a record for the current year
	currentYear := time.Now().Year()
	queryLeave := `
		SELECT sisa_hari 
		FROM saldo_cuti 
		WHERE pengguna_id = ? AND tahun = ?
	`
	var balance int
	err = database.DB.QueryRow(queryLeave, userID, currentYear).Scan(&balance)
	if err == nil {
		stats.LeaveBalance = balance
	} else if err != sql.ErrNoRows {
		// If no record found, we assume 0 or handle error appropriately. 
		// For now, logging error or ignoring might be safest, assuming 0 is default.
		// However, returning error might break the whole dashboard if config is missing.
		// Let's just keep it 0.
	}

	// 3. Get Last Salary
	querySalary := `
		SELECT gaji_bersih, bulan, tahun 
		FROM penggajian 
		WHERE pengguna_id = ? AND status = 'dibayar' 
		ORDER BY tahun DESC, bulan DESC 
		LIMIT 1
	`
	var amount float64
	var month, year int
	err = database.DB.QueryRow(querySalary, userID).Scan(&amount, &month, &year)
	if err == nil {
		stats.LastSalaryAmount = amount
		period := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local).Format("January 2006")
		stats.LastSalaryPeriod = &period
	}

	return stats, nil
}
