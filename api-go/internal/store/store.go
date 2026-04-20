package store

import (
	"sync"

	"facial-auth/internal/types"
)

// UserStore is a thread-safe in-memory store for enrolled users.
// Replace with PostgreSQL + pgvector for production persistence.
type UserStore struct {
	mu    sync.RWMutex
	users map[string]*types.User
}

// NewUserStore creates an empty UserStore.
func NewUserStore() *UserStore {
	return &UserStore{
		users: make(map[string]*types.User),
	}
}

// Add inserts a new user. Caller must ensure the ID is unique beforehand.
func (s *UserStore) Add(user *types.User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.users[user.ID] = user
}

// Update modifies mutable fields of an existing user.
// Returns the updated user or nil if not found.
func (s *UserStore) Update(id string, name *string, status *types.UserStatus, observation *string) *types.User {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, ok := s.users[id]
	if !ok {
		return nil
	}

	if name != nil {
		user.Name = *name
	}
	if status != nil {
		user.Status = *status
	}
	if observation != nil {
		user.Observation = *observation
	}

	return user
}

// GetByID returns the user with the given ID, or nil.
func (s *UserStore) GetByID(id string) *types.User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.users[id]
}

// GetAll returns a snapshot of all users.
func (s *UserStore) GetAll() []*types.User {
	s.mu.RLock()
	defer s.mu.RUnlock()

	out := make([]*types.User, 0, len(s.users))
	for _, u := range s.users {
		out = append(out, u)
	}
	return out
}

// Exists reports whether a user with the given ID is enrolled.
func (s *UserStore) Exists(id string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.users[id]
	return ok
}

// Count returns the number of enrolled users.
func (s *UserStore) Count() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.users)
}

// Delete removes a user. Returns true if the user existed.
func (s *UserStore) Delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.users[id]; !ok {
		return false
	}
	delete(s.users, id)
	return true
}
