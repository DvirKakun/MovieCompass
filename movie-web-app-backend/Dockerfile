# Use a Python base image
FROM python:3.12.3-slim

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything into the container
COPY . .

# Expose FastAPI on port 8000
EXPOSE 8000

# Set PYTHONPATH so it can import from /ollama
ENV PYTHONPATH="${PYTHONPATH}:/ollama"

# Command to run FastAPI
CMD ["uvicorn", "app.main:application", "--host", "0.0.0.0", "--port", "8000"]
