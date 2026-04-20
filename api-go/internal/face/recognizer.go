package faceservice

import (
	"encoding/base64"
	"errors"
	"fmt"
	"math"
	"strings"

	dlib "github.com/Kagami/go-face"
)

// Sentinel errors returned by the face service.
var (
	ErrNoFaceDetected        = errors.New("NO_FACE_DETECTED")
	ErrMultipleFacesDetected = errors.New("MULTIPLE_FACES_DETECTED")
)

// Recognizer wraps go-face's Recognizer with helpers.
type Recognizer struct {
	rec *dlib.Recognizer
}

// NewRecognizer loads dlib models from modelsPath and returns a ready Recognizer.
// The caller must call Close() when done.
func NewRecognizer(modelsPath string) (*Recognizer, error) {
	rec, err := dlib.NewRecognizer(modelsPath)
	if err != nil {
		return nil, fmt.Errorf("loading models from %q: %w", modelsPath, err)
	}
	return &Recognizer{rec: rec}, nil
}

// Close releases the underlying dlib resources.
func (r *Recognizer) Close() {
	r.rec.Close()
}

// EmbeddingResult holds the 128-dim descriptor and a liveness score.
// go-face uses float64 for descriptors.
type EmbeddingResult struct {
	Descriptor    dlib.Descriptor // [128]float64
	LivenessScore float32
}

// GenerateEmbedding decodes a base64 image and returns a face embedding.
// Returns ErrNoFaceDetected or ErrMultipleFacesDetected when appropriate.
func (r *Recognizer) GenerateEmbedding(base64Image string) (*EmbeddingResult, error) {
	imgBytes, err := decodeBase64Image(base64Image)
	if err != nil {
		return nil, fmt.Errorf("decoding image: %w", err)
	}

	faces, err := r.rec.Recognize(imgBytes)
	if err != nil {
		return nil, fmt.Errorf("face recognition: %w", err)
	}

	if len(faces) == 0 {
		return nil, ErrNoFaceDetected
	}
	if len(faces) > 1 {
		return nil, ErrMultipleFacesDetected
	}

	f := faces[0]
	liveness := computeLivenessScore(f)

	return &EmbeddingResult{
		Descriptor:    f.Descriptor,
		LivenessScore: liveness,
	}, nil
}

// decodeBase64Image strips the optional data-URI prefix and decodes the bytes.
func decodeBase64Image(b64 string) ([]byte, error) {
	if idx := strings.Index(b64, ","); idx != -1 {
		b64 = b64[idx+1:]
	}
	return base64.StdEncoding.DecodeString(b64)
}

// computeLivenessScore applies a heuristic based on the face rectangle proportions.
// go-face exposes the bounding rectangle; we use its aspect ratio as a proxy for
// the eye-distance / face-width ratio used in the Node.js version.
//
// A well-framed frontal face has a roughly square bounding box (ratio ≈ 1.0).
// Very wide or very tall boxes suggest a partial/angled face (likely a photo of a photo).
func computeLivenessScore(f dlib.Face) float32 {
	rect := f.Rectangle
	w := float64(rect.Max.X - rect.Min.X)
	h := float64(rect.Max.Y - rect.Min.Y)

	if w <= 0 || h <= 0 {
		return 0.2
	}

	ratio := w / h // ~1.0 for a frontal face

	switch {
	case ratio < 0.5 || ratio > 2.0:
		return 0.2
	case ratio >= 0.75 && ratio <= 1.35:
		return 0.95
	default:
		return 0.6
	}
}

// EuclideanDistance computes the L2 distance between two 128-dim descriptors.
func EuclideanDistance(a, b dlib.Descriptor) float32 {
	var sum float64
	for i := range a {
		d := a[i] - b[i]
		sum += d * d
	}
	return float32(math.Sqrt(sum))
}

// DescriptorFromSlice converts a []float64 (stored in the user record) back to dlib.Descriptor.
func DescriptorFromSlice(s []float64) dlib.Descriptor {
	var d dlib.Descriptor
	copy(d[:], s)
	return d
}

// DescriptorToSlice converts a dlib.Descriptor ([128]float64) to []float64 for storage.
func DescriptorToSlice(d dlib.Descriptor) []float64 {
	s := make([]float64, 128)
	copy(s, d[:])
	return s
}
