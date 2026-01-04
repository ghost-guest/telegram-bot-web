package models

import "time"

type File struct {
	ID          string    `json:"id"`
	Filename    string    `json:"filename"`
	Filepath    string    `json:"-"`
	Filetype    string    `json:"filetype"`
	Filesize    int64     `json:"filesize"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type UploadResponse struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	ShareURL string `json:"share_url"`
}

type TextUploadRequest struct {
	Content     string `json:"content" binding:"required"`
	Description string `json:"description"`
}
