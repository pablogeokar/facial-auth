package faceservice

import (
	"facial-auth/internal/store"
	"facial-auth/internal/types"
)

// Service provides high-level face operations (enroll / verify).
type Service struct {
	rec            *Recognizer
	store          *store.UserStore
	matchThreshold float32
}

// NewService creates a Service with the given dependencies.
func NewService(rec *Recognizer, store *store.UserStore, matchThreshold float32) *Service {
	return &Service{
		rec:            rec,
		store:          store,
		matchThreshold: matchThreshold,
	}
}

// GenerateEmbedding is a thin wrapper so handlers don't import the recognizer directly.
func (s *Service) GenerateEmbedding(base64Image string) (*EmbeddingResult, error) {
	return s.rec.GenerateEmbedding(base64Image)
}

// VerifyFace compares a probe image against all enrolled users.
// Returns a RecognitionResult with the best match (if any).
func (s *Service) VerifyFace(base64Image string) (*types.RecognitionResult, error) {
	result, err := s.rec.GenerateEmbedding(base64Image)
	if err != nil {
		return nil, err
	}

	ls := result.LivenessScore
	recognitionResult := &types.RecognitionResult{
		Matched:       false,
		User:          nil,
		Distance:      nil,
		LivenessScore: &ls,
	}

	users := s.store.GetAll()
	if len(users) == 0 {
		return recognitionResult, nil
	}

	var (
		bestUserID   string
		bestUserName string
		bestDist     float32 = s.matchThreshold + 1 // start above threshold
	)

	for _, u := range users {
		enrolled := DescriptorFromSlice(u.Descriptor)
		dist := EuclideanDistance(result.Descriptor, enrolled)

		if dist < s.matchThreshold && dist < bestDist {
			bestDist = dist
			bestUserID = u.ID
			bestUserName = u.Name
		}
	}

	if bestUserID != "" {
		recognitionResult.Matched = true
		recognitionResult.User = &types.UserRef{ID: bestUserID, Name: bestUserName}
		recognitionResult.Distance = &bestDist
	}

	return recognitionResult, nil
}
