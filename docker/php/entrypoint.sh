#!/bin/bash
set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

# Pastikan folder framework storage dan cache tersedia
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# vendor autoloader check
if [ ! -f vendor/autoload.php ]; then
    echo "Autoloader vendor tidak ditemukan, menjalankan composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate APP_KEY bila belum terpasang
if ! grep -q "^APP_KEY=base64" .env; then
    echo "Menghasilkan APP_KEY baru..."
    php artisan key:generate --force --no-interaction || true
fi

# Tunggu database MySQL siap
echo "Menunggu koneksi database MySQL ($DB_HOST:$DB_PORT)..."
until php -r "try { new PDO('mysql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }"; do
    sleep 2
done
echo "Koneksi database MySQL berhasil!"

# Jalankan migrasi database
php artisan migrate --force --no-interaction || true

# Bersihkan cache agar konfigurasi env terbaru langsung aktif
php artisan optimize:clear || true

if [ "$APP_ENV" = "production" ]; then
    echo "Mode Produksi Terdeteksi: Melakukan caching konfigurasi, rute, dan tampilan..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

OCTANE_SERVER_BIN=${OCTANE_SERVER:-frankenphp}
OCTANE_WORKERS_VAL=${OCTANE_WORKERS:-auto}
OCTANE_MAX_REQ_VAL=${OCTANE_MAX_REQUESTS:-500}

echo "Memulai Laravel Octane ($OCTANE_SERVER_BIN) dengan workers=$OCTANE_WORKERS_VAL max-requests=$OCTANE_MAX_REQ_VAL di 0.0.0.0:8000..."
exec php artisan octane:start --server="$OCTANE_SERVER_BIN" --host=0.0.0.0 --port=8000 --workers="$OCTANE_WORKERS_VAL" --max-requests="$OCTANE_MAX_REQ_VAL"
