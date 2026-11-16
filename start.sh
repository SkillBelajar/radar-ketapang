#!/bin/bash
set -e

# ==============================================================================
# RADAR POLITIK KETAPANG // PRODUCTION RUNNER SCRIPT
# Menjalankan Laravel Octane dengan High Concurrency & Memory Management
# ==============================================================================

SERVER_TYPE="${OCTANE_SERVER:-frankenphp}"
HOST="${OCTANE_HOST:-0.0.0.0}"
PORT="${OCTANE_PORT:-8000}"
WORKERS="${OCTANE_WORKERS:-auto}"
MAX_REQUESTS="${OCTANE_MAX_REQUESTS:-500}"

echo "================================================================="
echo "  RADAR POLITIK KETAPANG // HIGH-CONCURRENCY OCTANE RUNNER       "
echo "  Server: $SERVER_TYPE | Host: $HOST:$PORT | Workers: $WORKERS   "
echo "  Max Requests / Worker: $MAX_REQUESTS                           "
echo "================================================================="

# Jalankan optimasi Laravel jika mode production
if [ "$APP_ENV" = "production" ]; then
    echo ">> Mengoptimalkan cache konfigurasi dan routing..."
    php artisan optimize:clear
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Jalankan Octane Server
exec php artisan octane:start \
    --server="$SERVER_TYPE" \
    --host="$HOST" \
    --port="$PORT" \
    --workers="$WORKERS" \
    --max-requests="$MAX_REQUESTS"
