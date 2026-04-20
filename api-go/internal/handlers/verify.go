package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	faceservice "facial-auth/internal/face"
	"facial-auth/internal/store"
	"facial-auth/internal/types"
)

// VerifyHandler handles POST /api/verify.
type VerifyHandler struct {
	faceService *faceservice.Service
	store       *store.UserStore
}

// NewVerifyHandler creates a VerifyHandler.
func NewVerifyHandler(fs *faceservice.Service, s *store.UserStore) *VerifyHandler {
	return &VerifyHandler{faceService: fs, store: s}
}

// ServeHTTP handles POST /api/verify.
func (h *VerifyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req types.VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.ErrorResponse{
			Success: false,
			Error:   "Corpo da requisição inválido",
		})
		return
	}

	if req.Image == "" {
		writeJSON(w, http.StatusBadRequest, types.ErrorResponse{
			Success: false,
			Error:   "Campo obrigatório não informado: image",
		})
		return
	}

	result, err := h.faceService.VerifyFace(req.Image)
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
				Error:   "Múltiplos rostos detectados. Apenas um rosto é permitido por captura.",
			})
		default:
			writeJSON(w, http.StatusInternalServerError, types.ErrorResponse{
				Success: false,
				Error:   "Erro interno do servidor ao realizar a verificação",
			})
		}
		return
	}

	// Liveness check
	if result.LivenessScore != nil && *result.LivenessScore < 0.5 {
		writeJSON(w, http.StatusForbidden, types.ErrorResponse{
			Success: false,
			Error:   "Verificação de vivacidade falhou. Possível tentativa de fraude detectada.",
		})
		return
	}

	// Status check when a match was found
	if result.Matched && result.User != nil {
		user := h.store.GetByID(result.User.ID)
		if user != nil {
			switch user.Status {
			case types.StatusBloqueado:
				obs := user.Observation
				writeJSON(w, http.StatusForbidden, types.RecognitionResult{
					Matched:       true,
					User:          result.User,
					Distance:      result.Distance,
					LivenessScore: result.LivenessScore,
					Blocked:       true,
					Observation:   &obs,
				})
				return

			case types.StatusInativo:
				writeJSON(w, http.StatusForbidden, types.RecognitionResult{
					Matched:       true,
					User:          result.User,
					Distance:      result.Distance,
					LivenessScore: result.LivenessScore,
					Inactive:      true,
				})
				return
			}
		}
	}

	status := http.StatusUnauthorized
	if result.Matched {
		status = http.StatusOK
	}
	writeJSON(w, status, result)
}
