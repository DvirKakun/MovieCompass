#!/bin/bash
set -e

# 👇 the model you want to serve
MODEL_NAME="mistral:latest"

# derive the folder name inside /root/.ollama/models  (everything before the colon)
MODEL_DIR="${MODEL_NAME%%:*}"
MODEL_PATH="/root/.ollama/models/${MODEL_DIR}/ggml-model.bin"

if [ ! -f "$MODEL_PATH" ]; then
  echo "🧠 Model '$MODEL_NAME' not found. Pulling from Ollama..."

  # Start Ollama server in the background
  ollama serve &                 # launches API on :11434
  SERVER_PID=$!

  # Wait for the API to accept connections
  echo "⏳ Waiting for Ollama server..."
  curl --retry 10 --retry-connrefused --retry-delay 1 http://localhost:11434

  # Pull the model through the API
  curl -X POST -d "{\"name\": \"$MODEL_NAME\"}" \
       http://localhost:11434/api/pull

  echo "✅ Model pulled. Shutting down temp server..."
  kill "$SERVER_PID"
  wait "$SERVER_PID" || true
else
  echo "✅ Model '$MODEL_NAME' already exists — skipping pull"
fi

echo "🚀 Starting Ollama server..."
exec ollama serve                # foreground
