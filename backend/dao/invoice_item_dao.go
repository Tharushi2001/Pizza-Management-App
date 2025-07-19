package dao

import (
	"pizza-billing/config"
)

type InvoiceItem struct {
	ID        int     `json:"id"`
	InvoiceID int     `json:"invoice_id"`
	ItemID    int     `json:"item_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}

func GetInvoiceItemsByInvoiceID(invoiceID int) ([]InvoiceItem, error) {
	rows, err := config.DB.Query("SELECT id, invoice_id, item_id, quantity, price FROM invoice_items WHERE invoice_id = ?", invoiceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []InvoiceItem
	for rows.Next() {
		var item InvoiceItem
		if err := rows.Scan(&item.ID, &item.InvoiceID, &item.ItemID, &item.Quantity, &item.Price); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func CreateInvoiceItem(invItem *InvoiceItem) error {
	stmt, err := config.DB.Prepare("INSERT INTO invoice_items(invoice_id, item_id, quantity, price) VALUES (?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(invItem.InvoiceID, invItem.ItemID, invItem.Quantity, invItem.Price)
	return err
}

func DeleteInvoiceItemsByInvoiceID(invoiceID int) error {
	stmt, err := config.DB.Prepare("DELETE FROM invoice_items WHERE invoice_id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(invoiceID)
	return err
}
