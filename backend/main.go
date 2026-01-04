package main

import (
	"log"
	"telegram-bot/config"
	"telegram-bot/database"
	"telegram-bot/handlers"
	"telegram-bot/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db, err := database.New(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	storage := services.NewStorage(cfg)
	telegram := services.NewTelegram(cfg)

	uploadHandler := handlers.NewUploadHandler(cfg, db, storage, telegram)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})
		api.POST("/upload", uploadHandler.UploadFile)
		api.POST("/text", uploadHandler.UploadText)
		api.GET("/file/:id", uploadHandler.GetFileInfo)
		api.GET("/download/:id", uploadHandler.DownloadFile)
		api.GET("/preview/:id", uploadHandler.PreviewFile)
	}

	r.Static("/uploads", cfg.UploadDir)

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
