package dao

import (
	"pizza-billing/config"
)

type Item struct {
	ID       int     `json:"id"`
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Price    float64 `json:"price"`
	ImageURL string  `json:"image_url"`
}

func GetAllItems() ([]Item, error) {
	rows, err := config.DB.Query(`
		SELECT id, name, type, price, image_url
		FROM items`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []Item
	for rows.Next() {
		var it Item
		if err := rows.Scan(&it.ID, &it.Name, &it.Type, &it.Price, &it.ImageURL); err != nil {
			continue
		}
		items = append(items, it)
	}
	return items, nil
}

func GetItemByID(id int) (*Item, error) {
	row := config.DB.QueryRow(`
		SELECT id, name, type, price, image_url
		FROM items
		WHERE id = ?`, id)

	var it Item
	if err := row.Scan(&it.ID, &it.Name, &it.Type, &it.Price, &it.ImageURL); err != nil {
		return nil, err
	}
	return &it, nil
}

func CreateItem(it *Item) error {
	stmt, err := config.DB.Prepare(`
		INSERT INTO items (name, type, price, image_url)
		VALUES (?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	res, err := stmt.Exec(it.Name, it.Type, it.Price, it.ImageURL)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	it.ID = int(id)
	return nil
}

func UpdateItem(it *Item) error {
	stmt, err := config.DB.Prepare(`
		UPDATE items
		SET name = ?, type = ?, price = ?, image_url = ?
		WHERE id = ?`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(it.Name, it.Type, it.Price, it.ImageURL, it.ID)
	return err
}

func DeleteItem(id int) error {
	stmt, err := config.DB.Prepare(`DELETE FROM items WHERE id = ?`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	return err
}
