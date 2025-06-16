# ─────────────────────────  base stage  ─────────────────────────
FROM python:3.12.3-slim AS base
WORKDIR /backend
ENV PYTHONPATH=/backend


# install production requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ─────────────────────────  test stage  ─────────────────────────
FROM base AS test

# copy source and tests
COPY .env ./
COPY app/ ./app
COPY tests/ ./tests

# run tests during build → fails build if tests fail
# RUN python -m pytest tests/endpoints/ -v --tb=short --disable-warnings || exit 1
# RUN python -m pytest tests/services/ -v --tb=short --disable-warnings || exit 1
RUN python -m pytest tests/integration/ -v --tb=short --disable-warnings || exit 1

# ────────────────────────  runtime stage  ───────────────────────
FROM base AS runtime
WORKDIR /backend
ENV PYTHONPATH=/backend

# copy app (clean build, without tests) + deps
COPY --from=test /backend/app /backend/app
COPY --from=base /usr/local /usr/local

EXPOSE 8000
CMD ["uvicorn", "app.main:application", "--host", "0.0.0.0", "--port", "8000"]

