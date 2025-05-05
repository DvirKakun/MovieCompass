FROM ollama/ollama:0.6.7

WORKDIR /ollama

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
      curl
      
COPY entrypoint.sh /ollama/entrypoint.sh

RUN chmod +x /ollama/entrypoint.sh
      
ENTRYPOINT ["/ollama/entrypoint.sh"]