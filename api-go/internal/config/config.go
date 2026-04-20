package config

import (
	"os"
	"path/filepath"
	"runtime"
	"strconv"
)

// Config holds all application configuration.
type Config struct {
	Port           int
	Host           string
	MatchThreshold float32
	ModelsPath     string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	port := 3001
	if v := os.Getenv("PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			port = p
		}
	}

	host := "0.0.0.0"
	if v := os.Getenv("HOST"); v != "" {
		host = v
	}

	modelsPath := defaultModelsPath()
	if v := os.Getenv("MODELS_PATH"); v != "" {
		modelsPath = v
	}

	return &Config{
		Port:           port,
		Host:           host,
		MatchThreshold: 0.45,
		ModelsPath:     modelsPath,
	}
}

// defaultModelsPath returns the models directory relative to the binary location.
func defaultModelsPath() string {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		return "models"
	}
	// Walk up from internal/config/ to project root, then into models/
	root := filepath.Join(filepath.Dir(filename), "..", "..", "models")
	abs, err := filepath.Abs(root)
	if err != nil {
		return "models"
	}
	return abs
}
