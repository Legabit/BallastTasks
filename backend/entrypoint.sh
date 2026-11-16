#!/bin/sh
set -e

# Only run migrations when starting Django web server
if [ "$1" = "python" ] && [ "$2" = "manage.py" ] && [ "$3" = "runserver" ]; then
    echo "Applying database migrations..."
    python manage.py migrate --noinput || echo "Database not ready yet or migrations failed, continuing..."
fi

exec "$@"
