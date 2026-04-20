package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"

	"facial-auth/internal/store"
	"facial-auth/internal/types"
)

// UsersHandler handles /api/users routes.
type UsersHandler struct {
	store *store.UserStore
}

// NewUsersHandler creates a UsersHandler.
func NewUsersHandler(s *store.UserStore) *UsersHandler {
	return &UsersHandler{store: s}
}

// List handles GET /api/users — returns all users without descriptors.
func (h *UsersHandler) List(w http.ResponseWriter, r *http.Request) {
	all := h.store.GetAll()
	safe := make([]types.SafeUser, 0, len(all))
	for _, u := range all {
		safe = append(safe, u.ToSafe())
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"users": safe})
}

// Update handles PATCH /api/users/:id — updates name, status, and/or observation.
func (h *UsersHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req types.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.ErrorResponse{
			Success: false,
			Error:   "Corpo da requisição inválido",
		})
		return
	}

	if req.Name == nil && req.Status == nil && req.Observation == nil {
		writeJSON(w, http.StatusBadRequest, types.ErrorResponse{
			Success: false,
			Error:   "Informe ao menos um campo para atualizar: name, status, observation",
		})
		return
	}

	if req.Status != nil && !types.ValidStatuses[*req.Status] {
		writeJSON(w, http.StatusBadRequest, types.ErrorResponse{
			Success: false,
			Error:   "Status inválido. Deve ser um dos seguintes: ATIVO, INATIVO, BLOQUEADO",
		})
		return
	}

	updated := h.store.Update(id, req.Name, req.Status, req.Observation)
	if updated == nil {
		writeJSON(w, http.StatusNotFound, types.ErrorResponse{
			Success: false,
			Error:   fmt.Sprintf("Usuário %q não encontrado", id),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"user":    updated.ToSafe(),
	})
}

// Delete handles DELETE /api/users/:id.
func (h *UsersHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if !h.store.Delete(id) {
		writeJSON(w, http.StatusNotFound, types.ErrorResponse{
			Success: false,
			Error:   fmt.Sprintf("Usuário %q não encontrado", id),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Usuário %q excluído com sucesso", id),
	})
}
