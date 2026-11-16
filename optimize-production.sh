#!/bin/bash
set -e

# ==============================================================================
# RADAR POLITIK KETAPANG // QUICK OPTIMIZATION SHORTCUT
# ==============================================================================

echo "================================================================="
echo "  RADAR POLITIK KETAPANG // RUNNING PRODUCTION OPTIMIZATION      "
echo "================================================================="

docker compose exec app php artisan app:optimize
