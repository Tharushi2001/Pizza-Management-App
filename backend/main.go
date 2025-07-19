package main

import (
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	"pizza-billing/config"
	"pizza-billing/routes"
)

func main() {
	// 1.  DB connection
	config.ConnectDB()
	log.Println("Connected to MySQL")

	// 2.  Router + routes
	r := mux.NewRouter()
	routes.SetupRoutes(r)

	// 3.  CORS: allow React dev server (http://localhost:3000)
	cors := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)

	// 4.  Start
	log.Println("🚀 API listening on :8080")
	if err := http.ListenAndServe(":8080", cors(r)); err != nil {
		log.Fatal(err)
	}
}
