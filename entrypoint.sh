#!/bin/sh

set -e

rm -f /tmp/app-ready

echo "Installing composer."
composer install --no-interaction --optimize-autoloader

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    echo "Generating application key."
    php artisan key:generate --force
fi

echo "Running migrations."
php artisan migrate --force

if [ ! -L "public/storage" ]; then
    echo "Creating storage:link."
    php artisan storage:link || true
fi

echo "Preparations are done."

touch /tmp/app-ready

exec "$@"