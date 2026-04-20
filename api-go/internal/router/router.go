package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"facial-auth/internal/config"
	faceservice "facial-auth/internal/face"
	"facial-auth/internal/handlers"
	"facial-auth/internal/store"
)

// New builds and returns the application router.
func New(cfg *config.Config, userStore *store.UserStore, faceService *faceservice.Service) http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	// CORS — allow any origin (tighten in production if needed)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Handlers
	healthHandler := handlers.NewHealthHandler(userStore)
	enrollHandler := handlers.NewEnrollHandler(faceService, userStore)
	verifyHandler := handlers.NewVerifyHandler(faceService, userStore)
	usersHandler := handlers.NewUsersHandler(userStore)

	// Routes
	r.Get("/api/health", healthHandler.ServeHTTP)
	r.Post("/api/enroll", enrollHandler.ServeHTTP)
	r.Post("/api/verify", verifyHandler.ServeHTTP)

	r.Route("/api/users", func(r chi.Router) {
		r.Get("/", usersHandler.List)
		r.Patch("/{id}", usersHandler.Update)
		r.Delete("/{id}", usersHandler.Delete)
	})

	return r
}
