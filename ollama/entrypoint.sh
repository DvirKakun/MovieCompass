#!/bin/bash
set -e

# Check if the model file exists (adjust the file path as needed)
if [ ! -f "/root/.ollama/models/nous-hermes/ggml-model.bin" ]; then
  echo "Model not found. Downloading..."
  # Start the server in the background and capture its PID
  ollama serve &
  SERVER_PID=$!

  # Wait for the server to be up and running
  curl --retry 10 --retry-connrefused --retry-delay 1 http://localhost:11434

  # Download the model
  curl -X POST -d '{"name": "nous-hermes"}' http://localhost:11434/api/pull

  # Once downloaded, kill the background server
  kill $SERVER_PID
  # Wait for the process to terminate gracefully
  wait $SERVER_PID || true
else
  echo "Model already exists — skipping download ✅"
fi

# Finally, start the Ollama server in the foreground
exec ollama serve
