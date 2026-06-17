#!/bin/sh

rm -f /tmp/app-ready

echo "Installing composer."
composer install --no-interaction --optimize-autoloader

if [ ! grep -q '^APP_KEY=base64:' .env ]; then
    echo "Generating application key."
    php artisan key:generate --force
fi

check_migration_status() {
    php artisan migrate:status > /dev/null 2>&1
    return $?
}

echo "Checking migrations."
check_migration_status

if [ $? -eq 0 ]; then
    echo "Migrations table exists. Skipping migration."
else
    echo "Migrations table does not exist or there is an issue. Running migrations."
    php artisan migrate --force
fi

if [ ! -d "public/storage" ]; then
    echo "Creating storage:link."
    php artisan storage:link
fi

echo "Preparations are done."

touch /tmp/app-ready

exec "$@"