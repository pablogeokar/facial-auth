# facial-auth — Go API

Reescrita completa da API Node.js de autenticação facial em Go, usando [go-face](https://github.com/Kagami/go-face) (dlib ResNet) para geração de embeddings de 128 dimensões.

## Endpoints

| Método | Rota              | Descrição                          |
|--------|-------------------|------------------------------------|
| GET    | /api/health       | Health check                       |
| POST   | /api/enroll       | Cadastrar usuário com rosto        |
| POST   | /api/verify       | Verificar identidade por rosto     |
| GET    | /api/users        | Listar usuários (sem descriptor)   |
| PATCH  | /api/users/:id    | Atualizar nome/status/observação   |
| DELETE | /api/users/:id    | Remover usuário                    |

## Pré-requisitos

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install libdlib-dev libblas-dev libatlas-base-dev liblapack-dev libjpeg-turbo8-dev
```

### macOS

```bash
brew install dlib
```

### Windows (MSYS2)

```bash
# No MSYS2 MSYS shell:
pacman -Syu
pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-dlib

# Use o MSYS2 MinGW 64-bit shell para compilar
```

## Modelos

Baixe os modelos dlib necessários:

```bash
make download-models
# ou manualmente:
bash scripts/download-models.sh
```

Os modelos são salvos em `models/`:
- `shape_predictor_5_face_landmarks.dat`
- `dlib_face_recognition_resnet_model_v1.dat`
- `mmod_human_face_detector.dat`

## Executar

```bash
# Desenvolvimento
make dev

# Build + executar
make run

# Apenas build
make build
```

## Variáveis de Ambiente

| Variável      | Padrão    | Descrição                              |
|---------------|-----------|----------------------------------------|
| `PORT`        | `3001`    | Porta do servidor                      |
| `HOST`        | `0.0.0.0` | Host do servidor                       |
| `MODELS_PATH` | `./models`| Caminho para os modelos dlib           |

## Estrutura

```
api-go/
├── main.go                      # Entrypoint
├── go.mod / go.sum
├── Makefile
├── scripts/
│   └── download-models.sh       # Download dos modelos dlib
├── models/                      # Modelos dlib (gerado pelo script)
└── internal/
    ├── config/    config.go      # Configuração via env vars
    ├── types/     types.go       # Tipos compartilhados
    ├── store/     store.go       # Store in-memory thread-safe
    ├── face/
    │   ├── recognizer.go         # Wrapper go-face (dlib)
    │   └── service.go            # Lógica de enroll/verify
    ├── handlers/
    │   ├── health.go
    │   ├── enroll.go
    │   ├── verify.go
    │   └── users.go
    └── router/    router.go      # chi router + CORS + middleware
```

## Diferenças em relação à versão Node.js

| Aspecto | Node.js | Go |
|---|---|---|
| Framework | Fastify | chi |
| Face recognition | @vladmandic/face-api (TF.js WASM) | go-face (dlib CGO) |
| Descriptor type | Float32Array (128) | [128]float64 |
| Concorrência | Event loop | goroutines + sync.RWMutex |
| Liveness | Proporção olhos/rosto (landmarks 68) | Proporção aspect ratio do bounding box |
| Storage | Map em memória | Map em memória (thread-safe) |

> **Produção:** substitua o `UserStore` in-memory por PostgreSQL + pgvector para persistência e busca vetorial eficiente.
