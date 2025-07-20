package controllers

import (
	"encoding/json"
	"net/http"
	"pizza-billing/config"
	"pizza-billing/dao"
	"strconv"

	"github.com/gorilla/mux"
)

// GET /invoices - List all invoices
func GetInvoices(w http.ResponseWriter, r *http.Request) {
	invoices, err := dao.GetAllInvoices()
	if err != nil {
		http.Error(w, "Failed to fetch invoices", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invoices)
}

// GET /invoices/{id} - Get invoice by ID
func GetInvoiceByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid invoice ID", http.StatusBadRequest)
		return
	}

	invoice, err := dao.GetInvoiceByID(id)
	if err != nil {
		http.Error(w, "Invoice not found", http.StatusNotFound)
		return
	}

	items, err := dao.GetInvoiceItemsByInvoiceID(id)
	if err != nil {
		http.Error(w, "Failed to fetch invoice items", http.StatusInternalServerError)
		return
	}

	response := struct {
		dao.Invoice
		Items []dao.InvoiceItem `json:"items"`
	}{
		Invoice: *invoice,
		Items:   items,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// POST /invoices - Create new invoice with items
func CreateInvoice(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var req struct {
		CustomerName string            `json:"customer_name"`
		Tax          float64           `json:"tax"`
		Total        float64           `json:"total"`
		Items        []dao.InvoiceItem `json:"items"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}

	res, err := tx.Exec("INSERT INTO invoices (customer_name, tax, total) VALUES (?, ?, ?)", req.CustomerName, req.Tax, req.Total)
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to create invoice", http.StatusInternalServerError)
		return
	}

	invoiceID, err := res.LastInsertId()
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to retrieve invoice ID", http.StatusInternalServerError)
		return
	}

	stmt, err := tx.Prepare("INSERT INTO invoice_items (invoice_id, item_id, quantity, price) VALUES (?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to prepare invoice items insert", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	for _, item := range req.Items {
		_, err = stmt.Exec(invoiceID, item.ItemID, item.Quantity, item.Price)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Failed to insert invoice item", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Transaction commit failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"invoice_id": invoiceID,
	})
}

// PUT /invoices/{id} - Update invoice and its items
func UpdateInvoice(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid invoice ID", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()
	var req struct {
		CustomerName string            `json:"customer_name"`
		Tax          float64           `json:"tax"`
		Total        float64           `json:"total"`
		Items        []dao.InvoiceItem `json:"items"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec("UPDATE invoices SET customer_name = ?, tax = ?, total = ? WHERE id = ?", req.CustomerName, req.Tax, req.Total, id)
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to update invoice", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec("DELETE FROM invoice_items WHERE invoice_id = ?", id)
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to clear existing invoice items", http.StatusInternalServerError)
		return
	}

	stmt, err := tx.Prepare("INSERT INTO invoice_items (invoice_id, item_id, quantity, price) VALUES (?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to prepare item insertion", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	for _, item := range req.Items {
		_, err = stmt.Exec(id, item.ItemID, item.Quantity, item.Price)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Failed to insert updated invoice items", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Invoice updated successfully"})
}

// DELETE /invoices/{id} - Delete invoice and its items
func DeleteInvoice(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid invoice ID", http.StatusBadRequest)
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec("DELETE FROM invoice_items WHERE invoice_id = ?", id)
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to delete invoice items", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec("DELETE FROM invoices WHERE id = ?", id)
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to delete invoice", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Failed to commit delete transaction", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Invoice deleted successfully"})
}
