package handlers

import (
	"net/http"
	"path/filepath"
	"telegram-bot/config"
	"telegram-bot/database"
	"telegram-bot/models"
	"telegram-bot/services"
	"time"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	cfg      *config.Config
	db       *database.DB
	storage  *services.Storage
	telegram *services.Telegram
}

func NewUploadHandler(cfg *config.Config, db *database.DB, storage *services.Storage, telegram *services.Telegram) *UploadHandler {
	return &UploadHandler{
		cfg:      cfg,
		db:       db,
		storage:  storage,
		telegram: telegram,
	}
}

func (h *UploadHandler) UploadFile(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	if header.Size > h.cfg.MaxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large"})
		return
	}

	description := c.PostForm("description")

	id, filePath, err := h.storage.Save(header.Filename, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	fileModel := &models.File{
		ID:          id,
		Filename:    header.Filename,
		Filepath:    filePath,
		Filetype:    contentType,
		Filesize:    header.Size,
		Description: description,
		CreatedAt:   time.Now(),
	}

	if err := h.db.CreateFile(fileModel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file info"})
		return
	}

	go h.telegram.SendFileWithDocument(fileModel)

	shareURL := h.cfg.BaseURL + "/s/" + id

	c.JSON(http.StatusOK, models.UploadResponse{
		ID:       id,
		Filename: header.Filename,
		ShareURL: shareURL,
	})
}

func (h *UploadHandler) UploadText(c *gin.Context) {
	var req models.TextUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	id, filePath, err := h.storage.SaveText(req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save text"})
		return
	}

	fileModel := &models.File{
		ID:          id,
		Filename:    "text.txt",
		Filepath:    filePath,
		Filetype:    "text/plain",
		Filesize:    int64(len(req.Content)),
		Description: req.Description,
		CreatedAt:   time.Now(),
	}

	if err := h.db.CreateFile(fileModel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save text info"})
		return
	}

	go h.telegram.SendFileNotification(fileModel)

	shareURL := h.cfg.BaseURL + "/s/" + id

	c.JSON(http.StatusOK, models.UploadResponse{
		ID:       id,
		Filename: "text.txt",
		ShareURL: shareURL,
	})
}

func (h *UploadHandler) GetFileInfo(c *gin.Context) {
	id := c.Param("id")

	file, err := h.db.GetFile(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	c.JSON(http.StatusOK, file)
}

func (h *UploadHandler) DownloadFile(c *gin.Context) {
	id := c.Param("id")

	file, err := h.db.GetFile(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+file.Filename)
	c.Header("Content-Type", file.Filetype)
	c.File(file.Filepath)
}

func (h *UploadHandler) PreviewFile(c *gin.Context) {
	id := c.Param("id")

	file, err := h.db.GetFile(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	ext := filepath.Ext(file.Filename)
	if isPreviewable(ext, file.Filetype) {
		c.Header("Content-Type", file.Filetype)
		c.File(file.Filepath)
		return
	}

	c.JSON(http.StatusOK, file)
}

func isPreviewable(ext, mimeType string) bool {
	previewableExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
		".pdf": true, ".txt": true,
	}
	return previewableExts[ext]
}
