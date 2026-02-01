package hr

import (
	"log"
	"time"

	"github.com/hris-system/api-golang/internal/database"
)

type LeaveService struct{}

func NewLeaveService() *LeaveService {
	return &LeaveService{}
}

type LeaveRequest struct {
	ID                 int        `json:"id"`
	PenggunaID         int        `json:"pengguna_id"`
	NamaLengkap        string     `json:"nama_lengkap"`
	Divisi             *string    `json:"divisi"`
	TipeCuti           string     `json:"tipe_cuti"`
	TanggalMulai       string     `json:"tanggal_mulai"`
	TanggalSelesai     string     `json:"tanggal_selesai"`
	TotalHari          int        `json:"total_hari"`
	Alasan             string     `json:"alasan"`
	Status             string     `json:"status"`
	TanggalPersetujuan *time.Time `json:"tanggal_persetujuan"`
	CatatanPersetujuan *string    `json:"catatan_persetujuan"`
	SisaCuti           int        `json:"sisa_cuti"`
}

// GetAllLeaveRequests fetches all leave requests for HR
func (s *LeaveService) GetAllLeaveRequests() ([]LeaveRequest, error) {
	query := `
		SELECT 
			pc.id, 
			pc.pengguna_id, 
			p.nama_lengkap, 
			d.nama as divisi,
			pc.tipe_cuti, 
			pc.tanggal_mulai, 
			pc.tanggal_selesai, 
			pc.total_hari, 
			pc.alasan, 
			pc.status,
			pc.tanggal_persetujuan, 
			pc.catatan_persetujuan,
			COALESCE(sc.sisa_hari, 0) as sisa_cuti
		FROM pengajuan_cuti pc
		JOIN pengguna p ON pc.pengguna_id = p.id
		LEFT JOIN divisi d ON p.divisi_id = d.id
		LEFT JOIN saldo_cuti sc ON p.id = sc.pengguna_id AND sc.tahun = YEAR(pc.tanggal_mulai)
		ORDER BY 
			CASE WHEN pc.status = 'menunggu' THEN 1 ELSE 2 END,
			pc.dibuat_pada DESC
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []LeaveRequest
	for rows.Next() {
		var req LeaveRequest
		var startDate, endDate string

		err := rows.Scan(
			&req.ID,
			&req.PenggunaID,
			&req.NamaLengkap,
			&req.Divisi,
			&req.TipeCuti,
			&startDate,
			&endDate,
			&req.TotalHari,
			&req.Alasan,
			&req.Status,
			&req.TanggalPersetujuan,
			&req.CatatanPersetujuan,
			&req.SisaCuti,
		)
		if err != nil {
			log.Println("Scan error:", err)
			continue
		}

		// Setup dates
		req.TanggalMulai = startDate
		req.TanggalSelesai = endDate

		requests = append(requests, req)
	}

	return requests, nil
}

// ProcessLeaveRequest approves or rejects a leave request
func (s *LeaveService) ProcessLeaveRequest(id int, status string, notes string, approvedBy int) error {
	log.Printf("[ProcessLeaveRequest] Processing ID: %d, Status: %s, Approver: %d", id, status, approvedBy)

	tx, err := database.DB.Begin()
	if err != nil {
		log.Printf("[ProcessLeaveRequest] Error starting tx: %v", err)
		return err
	}
	// Defer rollback, will be ignored if committed
	defer tx.Rollback()

	// 1. Update status
	queryUpdate := `
		UPDATE pengajuan_cuti 
		SET status = ?, disetujui_oleh = ?, catatan_persetujuan = ?, tanggal_persetujuan = NOW()
		WHERE id = ?
	`
	_, err = tx.Exec(queryUpdate, status, approvedBy, notes, id)
	if err != nil {
		log.Printf("[ProcessLeaveRequest] Error updating status: %v", err)
		return err
	}

	// 2. If approved and type includes 'cuti' (case insensitive), reduce balance
	if status == "disetujui" {
		var totalHari, penggunaID int
		var tipeCuti string
		var tanggalMulai time.Time // Use time.Time directly

		// Get request details
		err = tx.QueryRow("SELECT pengguna_id, tipe_cuti, total_hari, tanggal_mulai FROM pengajuan_cuti WHERE id = ?", id).
			Scan(&penggunaID, &tipeCuti, &totalHari, &tanggalMulai)
		if err != nil {
			log.Printf("[ProcessLeaveRequest] Error fetching details: %v", err)
			return err
		}

		log.Printf("[ProcessLeaveRequest] Details - User: %d, Type: %s, Days: %d, Start: %v", penggunaID, tipeCuti, totalHari, tanggalMulai)

		// Check if it's a leave type that consumes annual leave (e.g. "Cuti Tahunan" or "cuti")
		// Ideally we should have a flag in 'tipe_cuti' config, but hardcoding for now based on known types
		isAnnualLeave := tipeCuti == "cuti" || tipeCuti == "Cuti Tahunan"

		if isAnnualLeave {
			year := tanggalMulai.Year()
			log.Printf("[ProcessLeaveRequest] Updating balance for Year: %d", year)

			// Update balance
			// NOTE: sisa_hari is a GENERATED ALWAYS AS (total_hari - hari_terpakai) STORED column
			// So we ONLY update hari_terpakai
			queryBalance := `
				UPDATE saldo_cuti 
				SET hari_terpakai = hari_terpakai + ?
				WHERE pengguna_id = ? AND tahun = ?
			`
			result, err := tx.Exec(queryBalance, totalHari, penggunaID, year)
			if err != nil {
				log.Printf("[ProcessLeaveRequest] Error updating balance: %v", err)
				return err
			}

			// Initialize balance if not exists (optional protection)
			rowsAff, _ := result.RowsAffected()
			if rowsAff == 0 {
				log.Printf("[ProcessLeaveRequest] No balance row found, inserting default...")
				// Insert default balance if missing (e.g., 12 days)
				// Do NOT insert sisa_hari
				_, err = tx.Exec(`
					INSERT INTO saldo_cuti (pengguna_id, tahun, total_hari, hari_terpakai)
					VALUES (?, ?, 12, ?)
				`, penggunaID, year, totalHari)
				if err != nil {
					log.Printf("[ProcessLeaveRequest] Error inserting balance: %v", err)
					return err
				}
			}
		}
	}

	if err := tx.Commit(); err != nil {
		log.Printf("[ProcessLeaveRequest] Error committing tx: %v", err)
		return err
	}

	log.Printf("[ProcessLeaveRequest] Success")
	return nil
}
