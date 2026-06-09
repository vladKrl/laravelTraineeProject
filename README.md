# Laravel + Next.js classifieds platform
___
### Technology stack
* **Backend**: Laravel Framework 12.55.1, Elasticsearch 9.3.2 + Laravel Scout, PostgreSQL, Redis
* **Frontend**: Next.js v16.2.1, Tailwindcss 4.2.2, Laravel Echo with Pusher.js
* **Real-time functions**: Laravel Reverb (Websocket server with Pusher), Laravel Queue Worker
___
## Requirements
Docker\
Docker Compose
___
## Setup
cp .env.example .env\
cp postgre.env.example postgre.env\
cp postgretest.env.example postgretest.env\
cp app/.env.example app/.env\
cp frontend/.env.example frontend/.env

**There is an entrypoint.sh, but in need to launch project manually follow these commands.**

docker compose up -d --build\
docker compose run --rm php composer install\
docker compose run --rm php php artisan key:generate\
docker compose run --rm php php artisan migrate --seed\
docker compose run --rm php php artisan storage:link\
docker compose run --rm php php artisan scout:import "App\\Models\\Product"