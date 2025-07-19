package dao

import (
	"log"
	"pizza-billing/config"
	"time"
)

type Invoice struct {
	ID           int       `json:"id"`
	CustomerName string    `json:"customer_name"`
	CreatedAt    time.Time `json:"created_at"`
	Tax          float64   `json:"tax"`
	Total        float64   `json:"total"`
}

func GetAllInvoices() ([]Invoice, error) {
	rows, err := config.DB.Query("SELECT id, customer_name, created_at, tax, total FROM invoices ORDER BY created_at DESC")
	if err != nil {
		log.Println("Query error:", err)
		return nil, err
	}
	defer rows.Close()

	var invoices []Invoice
	for rows.Next() {
		var inv Invoice
		if err := rows.Scan(&inv.ID, &inv.CustomerName, &inv.CreatedAt, &inv.Tax, &inv.Total); err != nil {
			log.Println("Scan error:", err) // 👈 ADD THIS
			return nil, err
		}
		invoices = append(invoices, inv)
	}
	return invoices, nil
}

func GetInvoiceByID(id int) (*Invoice, error) {
	row := config.DB.QueryRow("SELECT id, customer_name, created_at, tax, total FROM invoices WHERE id = ?", id)
	var inv Invoice
	if err := row.Scan(&inv.ID, &inv.CustomerName, &inv.CreatedAt, &inv.Tax, &inv.Total); err != nil {
		return nil, err
	}
	return &inv, nil
}

func CreateInvoice(inv *Invoice) (int64, error) {
	stmt, err := config.DB.Prepare("INSERT INTO invoices(customer_name, tax, total) VALUES (?, ?, ?)")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(inv.CustomerName, inv.Tax, inv.Total)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func UpdateInvoice(inv *Invoice) error {
	stmt, err := config.DB.Prepare("UPDATE invoices SET customer_name = ?, tax = ?, total = ? WHERE id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(inv.CustomerName, inv.Tax, inv.Total, inv.ID)
	return err
}

func DeleteInvoice(id int) error {
	stmt, err := config.DB.Prepare("DELETE FROM invoices WHERE id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	return err
}
