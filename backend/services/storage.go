package services

import (
	"io"
	"os"
	"path/filepath"
	"telegram-bot/config"

	"github.com/google/uuid"
)

type Storage struct {
	uploadDir string
}

func NewStorage(cfg *config.Config) *Storage {
	os.MkdirAll(cfg.UploadDir, 0755)
	return &Storage{uploadDir: cfg.UploadDir}
}

func (s *Storage) Save(filename string, reader io.Reader) (string, string, error) {
	id := uuid.New().String()
	ext := filepath.Ext(filename)
	storedName := id + ext
	filePath := filepath.Join(s.uploadDir, storedName)

	file, err := os.Create(filePath)
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	_, err = io.Copy(file, reader)
	if err != nil {
		return "", "", err
	}

	return id, filePath, nil
}

func (s *Storage) SaveText(content string) (string, string, error) {
	id := uuid.New().String()
	filePath := filepath.Join(s.uploadDir, id+".txt")

	err := os.WriteFile(filePath, []byte(content), 0644)
	if err != nil {
		return "", "", err
	}

	return id, filePath, nil
}

func (s *Storage) GetPath(id string, ext string) string {
	return filepath.Join(s.uploadDir, id+ext)
}
