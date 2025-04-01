FROM ollama/ollama:latest

WORKDIR /ollama

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
      curl
      
COPY entrypoint.sh /ollama/entrypoint.sh

RUN chmod +x /ollama/entrypoint.sh
      
ENTRYPOINT ["/ollama/entrypoint.sh"]

