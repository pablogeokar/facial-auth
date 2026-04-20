package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	faceservice "facial-auth/internal/face"
	"facial-auth/internal/store"
	"facial-auth/internal/types"
)

// EnrollHandler handles POST /api/enroll.
type EnrollHandler struct {
	faceService *faceservice.Service
	store       *store.UserStore
}

// NewEnrollHandler creates an EnrollHandler.
func NewEnrollHandler(fs *faceservice.Service, s *store.UserStore) *EnrollHandler {
	return &EnrollHandler{faceService: fs, store: s}
}

// ServeHTTP handles POST /api/enroll.
func (h *EnrollHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req types.EnrollRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.ErrorResponse{
			Success: false,
			Error:   "Corpo da requisição inválido",
		})
		return
	}

	if req.UserID == "" || req.Name == "" || req.Image == "" {
		writeJSON(w, http.StatusBadRequest, types.ErrorResponse{
			Success: false,
			Error:   "Campos obrigatórios não informados: userId, name, image",
		})
		return
	}

	if h.store.Exists(req.UserID) {
		writeJSON(w, http.StatusConflict, types.ErrorResponse{
			Success: false,
			Error:   fmt.Sprintf("O usuário %q já está cadastrado", req.UserID),
		})
		return
	}

	result, err := h.faceService.GenerateEmbedding(req.Image)
	if err != nil {
		switch {
		case errors.Is(err, faceservice.ErrNoFaceDetected):
			writeJSON(w, http.StatusUnprocessableEntity, types.ErrorResponse{
				Success: false,
				Error:   "Nenhum rosto detectado na imagem",
			})
		case errors.Is(err, faceservice.ErrMultipleFacesDetected):
			writeJSON(w, http.StatusUnprocessableEntity, types.ErrorResponse{
				Success: false,
				Error:   "Múltiplos rostos detectados. Envie uma imagem com apenas um rosto.",
			})
		default:
			writeJSON(w, http.StatusInternalServerError, types.ErrorResponse{
				Success: false,
				Error:   "Erro interno do servidor ao realizar o cadastro",
			})
		}
		return
	}

	if result.LivenessScore < 0.5 {
		writeJSON(w, http.StatusUnprocessableEntity, types.ErrorResponse{
			Success: false,
			Error:   "Verificação de vivacidade falhou. Utilize uma captura ao vivo da câmera.",
		})
		return
	}

	h.store.Add(&types.User{
		ID:         req.UserID,
		Name:       req.Name,
		Descriptor: faceservice.DescriptorToSlice(result.Descriptor),
		EnrolledAt: time.Now().UTC().Format(time.RFC3339),
		Status:     types.StatusAtivo,
	})

	writeJSON(w, http.StatusCreated, types.EnrollResponse{
		Success: true,
		UserID:  req.UserID,
		Message: fmt.Sprintf("Usuário %q cadastrado com sucesso", req.Name),
	})
}
