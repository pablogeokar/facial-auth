package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"facial-auth/internal/config"
	faceservice "facial-auth/internal/face"
	"facial-auth/internal/router"
	"facial-auth/internal/store"
)

func main() {
	cfg := config.Load()

	userStore := store.NewUserStore()

	recognizer, err := faceservice.NewRecognizer(cfg.ModelsPath)
	if err != nil {
		log.Fatalf("[Server] Failed to load face recognition models: %v", err)
	}
	defer recognizer.Close()

	log.Printf("[Server] Face recognition models loaded from %s", cfg.ModelsPath)

	faceSvc := faceservice.NewService(recognizer, userStore, cfg.MatchThreshold)

	r := router.New(cfg, userStore, faceSvc)

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("[Server] Listening on http://%s:%d", cfg.Host, cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[Server] ListenAndServe error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[Server] Shutting down gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("[Server] Forced shutdown: %v", err)
	}

	log.Println("[Server] Stopped.")
}
