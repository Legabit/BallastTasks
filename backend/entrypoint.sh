#!/bin/sh
set -e

echo "Applying database migrations..."
python manage.py migrate --noinput || echo "Database not ready yet or migrations failed, continuing..."

exec "$@"
