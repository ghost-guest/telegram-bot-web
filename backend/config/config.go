package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port             string
	BaseURL          string
	TelegramBotToken string
	TelegramChatID   string
	MaxFileSize      int64
	UploadDir        string
	DatabasePath     string
}

func Load() *Config {
	maxFileSize, _ := strconv.ParseInt(getEnv("MAX_FILE_SIZE", "52428800"), 10, 64)

	return &Config{
		Port:             getEnv("PORT", "8080"),
		BaseURL:          getEnv("BASE_URL", "http://localhost:8080"),
		TelegramBotToken: getEnv("TELEGRAM_BOT_TOKEN", ""),
		TelegramChatID:   getEnv("TELEGRAM_CHAT_ID", ""),
		MaxFileSize:      maxFileSize,
		UploadDir:        getEnv("UPLOAD_DIR", "./uploads"),
		DatabasePath:     getEnv("DATABASE_PATH", "./data.db"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
