FROM python:3.12-slim

# Prevent .pyc files and enable unbuffered logging (see logs live)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps needed to build psycopg2 (Postgres driver) and Pillow (image fields)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# In dev, docker-compose overrides this command to add --reload-friendly runserver.
# In production, swap this for gunicorn (see note below the compose file).
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
