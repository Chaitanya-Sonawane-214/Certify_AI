# Read the doc: https://huggingface.co/docs/hub/spaces-sdks-docker

FROM python:3.11-slim

# Install system-level dependencies: Tesseract OCR, Poppler, ZBar
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    libzbar0 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requires a specific user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install Python dependencies first (layer caching)
COPY --chown=user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend source
COPY --chown=user backend/ .

# Copy frontend (served as static files by FastAPI)
# We copy it to /frontend because backend/app.py looks for "../frontend"
COPY --chown=user frontend/ /frontend/

# Expose port
EXPOSE 7860

# Start the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
