#!/usr/bin/env bash
# Downloads the dlib face recognition models required by go-face.
# Models are fetched from the go-face releases page.
set -euo pipefail

MODELS_DIR="$(cd "$(dirname "$0")/.." && pwd)/models"
BASE_URL="https://github.com/Kagami/go-face-testdata/raw/master/models"

FILES=(
  "shape_predictor_5_face_landmarks.dat"
  "dlib_face_recognition_resnet_model_v1.dat"
  "mmod_human_face_detector.dat"
)

mkdir -p "$MODELS_DIR"

for file in "${FILES[@]}"; do
  dest="$MODELS_DIR/$file"
  if [ -f "$dest" ]; then
    echo "[skip] $file"
    continue
  fi
  echo "[download] $file ..."
  curl -fL --progress-bar "$BASE_URL/$file" -o "$dest"
  echo "[done] $file"
done

echo ""
echo "All models downloaded to: $MODELS_DIR"
