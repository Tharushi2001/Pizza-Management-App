package config

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func ConnectDB() {
	var err error
	// Add parseTime=true to your DSN
	dsn := "root:@tcp(127.0.0.1:3306)/pizza_db?parseTime=true"
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Error connecting to database: ", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Cannot reach database: ", err)
	}
	log.Println("Connected to database successfully!")
}
