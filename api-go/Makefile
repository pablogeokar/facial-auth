.PHONY: build run dev download-models tidy clean

# Binary output
BIN := bin/facial-auth

build: download-models
	go build -o $(BIN) ./...

run: build
	./$(BIN)

dev:
	go run ./main.go

download-models:
	bash scripts/download-models.sh

tidy:
	go mod tidy

clean:
	rm -rf bin/
