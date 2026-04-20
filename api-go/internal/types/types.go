package types

// UserStatus represents the possible states of an enrolled user.
type UserStatus string

const (
	StatusAtivo    UserStatus = "ATIVO"
	StatusInativo  UserStatus = "INATIVO"
	StatusBloqueado UserStatus = "BLOQUEADO"
)

// ValidStatuses is the set of accepted status values.
var ValidStatuses = map[UserStatus]bool{
	StatusAtivo:     true,
	StatusInativo:   true,
	StatusBloqueado: true,
}

// User represents an enrolled user with their face descriptor.
type User struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Descriptor  []float64  `json:"-"` // never serialised to JSON — go-face uses float64
	EnrolledAt  string     `json:"enrolledAt"`
	Status      UserStatus `json:"status"`
	Observation string     `json:"observation,omitempty"`
}

// SafeUser is User without the face descriptor, safe to return in API responses.
type SafeUser struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	EnrolledAt  string     `json:"enrolledAt"`
	Status      UserStatus `json:"status"`
	Observation string     `json:"observation,omitempty"`
}

// ToSafe returns a SafeUser copy (no descriptor).
func (u *User) ToSafe() SafeUser {
	return SafeUser{
		ID:          u.ID,
		Name:        u.Name,
		EnrolledAt:  u.EnrolledAt,
		Status:      u.Status,
		Observation: u.Observation,
	}
}

// RecognitionResult is the output of a face verification attempt.
type RecognitionResult struct {
	Matched      bool       `json:"matched"`
	User         *UserRef   `json:"user"`
	Distance     *float32   `json:"distance"`
	LivenessScore *float32  `json:"livenessScore"`
	Blocked      bool       `json:"blocked,omitempty"`
	Inactive     bool       `json:"inactive,omitempty"`
	Observation  *string    `json:"observation,omitempty"`
}

// UserRef is a minimal user reference used inside RecognitionResult.
type UserRef struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// ---- Request / Response types ----

// EnrollRequest is the body for POST /api/enroll.
type EnrollRequest struct {
	UserID string `json:"userId"`
	Name   string `json:"name"`
	Image  string `json:"image"` // base64-encoded image
}

// EnrollResponse is the success body for POST /api/enroll.
type EnrollResponse struct {
	Success bool   `json:"success"`
	UserID  string `json:"userId"`
	Message string `json:"message"`
}

// VerifyRequest is the body for POST /api/verify.
type VerifyRequest struct {
	Image string `json:"image"` // base64-encoded image
}

// ErrorResponse is a generic error body.
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// UpdateUserRequest is the body for PATCH /api/users/:id.
type UpdateUserRequest struct {
	Name        *string     `json:"name"`
	Status      *UserStatus `json:"status"`
	Observation *string     `json:"observation"`
}
