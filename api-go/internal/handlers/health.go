package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"facial-auth/internal/store"
)

var startTime = time.Now()

// HealthHandler returns a health-check response.
type HealthHandler struct {
	store *store.UserStore
}

// NewHealthHandler creates a HealthHandler.
func NewHealthHandler(s *store.UserStore) *HealthHandler {
	return &HealthHandler{store: s}
}

// ServeHTTP handles GET /api/health.
func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	resp := map[string]interface{}{
		"status":        "success",
		"message":       "Tudo certo! A API de Autenticação Facial está funcionando perfeitamente.",
		"enrolledUsers": h.store.Count(),
		"uptime":        int(time.Since(startTime).Seconds()),
		"timestamp":     time.Now().UTC().Format(time.RFC3339),
	}
	writeJSON(w, http.StatusOK, resp)
}

// writeJSON is a shared helper that serialises v as JSON and writes it to w.
func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
