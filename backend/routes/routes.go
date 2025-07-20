package routes

import (
	"pizza-billing/controllers"

	"github.com/gorilla/mux"
)

func SetupRoutes(router *mux.Router) {
	// Item routes
	router.HandleFunc("/items", controllers.GetItems).Methods("GET")
	router.HandleFunc("/items", controllers.CreateItem).Methods("POST")
	router.HandleFunc("/items/{id}", controllers.GetItemByID).Methods("GET")
	router.HandleFunc("/items/{id}", controllers.UpdateItem).Methods("PUT")
	router.HandleFunc("/items/{id}", controllers.DeleteItem).Methods("DELETE")

	// Invoice routes

	router.HandleFunc("/invoices", controllers.GetInvoices).Methods("GET")
	router.HandleFunc("/invoices/{id}", controllers.GetInvoiceByID).Methods("GET")
	router.HandleFunc("/invoices", controllers.CreateInvoice).Methods("POST")
	router.HandleFunc("/invoices/{id}", controllers.UpdateInvoice).Methods("PUT")
	router.HandleFunc("/invoices/{id}", controllers.DeleteInvoice).Methods("DELETE")

}
