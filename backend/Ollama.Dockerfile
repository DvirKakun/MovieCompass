FROM ollama/ollama:latest

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
      curl
      
RUN ollama serve & \
    curl --retry 10 --retry-connrefused --retry-delay 1 http://localhost:11434/ && \
    curl -X POST -d '{"name": "nous-hermes"}' http://localhost:11434/api/pull