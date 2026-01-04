package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"telegram-bot/config"
	"telegram-bot/models"
)

type Telegram struct {
	botToken string
	chatID   string
	baseURL  string
}

func NewTelegram(cfg *config.Config) *Telegram {
	return &Telegram{
		botToken: cfg.TelegramBotToken,
		chatID:   cfg.TelegramChatID,
		baseURL:  cfg.BaseURL,
	}
}

func (t *Telegram) SendFileNotification(file *models.File) error {
	if t.botToken == "" || t.chatID == "" {
		return nil
	}

	shareURL := fmt.Sprintf("%s/s/%s", t.baseURL, file.ID)

	message := fmt.Sprintf(
		"📁 *新文件上传*\n\n"+
			"📄 文件名: `%s`\n"+
			"📊 类型: `%s`\n"+
			"📦 大小: `%s`\n"+
			"📝 描述: %s\n\n"+
			"🔗 [点击查看](%s)",
		file.Filename,
		file.Filetype,
		formatFileSize(file.Filesize),
		getDescription(file.Description),
		shareURL,
	)

	return t.sendMessage(message)
}

func (t *Telegram) SendFileWithDocument(file *models.File) error {
	if t.botToken == "" || t.chatID == "" {
		return nil
	}

	shareURL := fmt.Sprintf("%s/s/%s", t.baseURL, file.ID)
	caption := fmt.Sprintf(
		"📁 %s\n📊 %s | 📦 %s\n🔗 %s",
		file.Filename,
		file.Filetype,
		formatFileSize(file.Filesize),
		shareURL,
	)

	if isImage(file.Filetype) {
		return t.sendPhoto(file.Filepath, caption)
	}

	return t.sendDocument(file.Filepath, caption)
}

func (t *Telegram) sendMessage(text string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", t.botToken)

	payload := map[string]interface{}{
		"chat_id":    t.chatID,
		"text":       text,
		"parse_mode": "Markdown",
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func (t *Telegram) sendDocument(filePath, caption string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendDocument", t.botToken)
	return t.sendFile(url, filePath, caption, "document")
}

func (t *Telegram) sendPhoto(filePath, caption string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendPhoto", t.botToken)
	return t.sendFile(url, filePath, caption, "photo")
}

func (t *Telegram) sendFile(url, filePath, caption, fieldName string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	writer.WriteField("chat_id", t.chatID)
	writer.WriteField("caption", caption)

	part, err := writer.CreateFormFile(fieldName, filepath.Base(filePath))
	if err != nil {
		return err
	}
	io.Copy(part, file)
	writer.Close()

	req, _ := http.NewRequest("POST", url, body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func formatFileSize(size int64) string {
	const (
		KB = 1024
		MB = KB * 1024
		GB = MB * 1024
	)

	switch {
	case size >= GB:
		return fmt.Sprintf("%.2f GB", float64(size)/GB)
	case size >= MB:
		return fmt.Sprintf("%.2f MB", float64(size)/MB)
	case size >= KB:
		return fmt.Sprintf("%.2f KB", float64(size)/KB)
	default:
		return fmt.Sprintf("%d B", size)
	}
}

func getDescription(desc string) string {
	if desc == "" {
		return "无"
	}
	return desc
}

func isImage(mimeType string) bool {
	return mimeType == "image/jpeg" || mimeType == "image/png" || mimeType == "image/gif" || mimeType == "image/webp"
}
