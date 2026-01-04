package database

import (
	"database/sql"
	"telegram-bot/config"
	"telegram-bot/models"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	conn *sql.DB
}

func New(cfg *config.Config) (*DB, error) {
	conn, err := sql.Open("sqlite3", cfg.DatabasePath)
	if err != nil {
		return nil, err
	}

	db := &DB{conn: conn}
	if err := db.init(); err != nil {
		return nil, err
	}

	return db, nil
}

func (db *DB) init() error {
	query := `
	CREATE TABLE IF NOT EXISTS files (
		id TEXT PRIMARY KEY,
		filename TEXT NOT NULL,
		filepath TEXT NOT NULL,
		filetype TEXT NOT NULL,
		filesize INTEGER NOT NULL,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.conn.Exec(query)
	return err
}

func (db *DB) CreateFile(file *models.File) error {
	query := `INSERT INTO files (id, filename, filepath, filetype, filesize, description, created_at)
			  VALUES (?, ?, ?, ?, ?, ?, ?)`
	_, err := db.conn.Exec(query, file.ID, file.Filename, file.Filepath, file.Filetype, file.Filesize, file.Description, file.CreatedAt)
	return err
}

func (db *DB) GetFile(id string) (*models.File, error) {
	query := `SELECT id, filename, filepath, filetype, filesize, description, created_at FROM files WHERE id = ?`
	row := db.conn.QueryRow(query, id)

	var file models.File
	err := row.Scan(&file.ID, &file.Filename, &file.Filepath, &file.Filetype, &file.Filesize, &file.Description, &file.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &file, nil
}

func (db *DB) Close() error {
	return db.conn.Close()
}
