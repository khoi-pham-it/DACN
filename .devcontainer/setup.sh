#!/usr/bin/env bash
# .devcontainer/setup.sh
# Runs once after GitHub Codespaces (or any devcontainer) is created.
# Sets up MySQL, Django backend, and installs Node.js frontend deps.

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo ""
echo "======================================================"
echo "  SmartVoucher – Dev Environment Setup"
echo "======================================================"
echo ""

# ── 1. MySQL database ─────────────────────────────────────
echo "▶ Setting up MySQL database..."
# Wait for MySQL to be ready
for i in $(seq 1 30); do
  if mysqladmin ping -h 127.0.0.1 -u root -p123456 --silent 2>/dev/null; then
    break
  fi
  echo "  Waiting for MySQL... ($i/30)"
  sleep 2
done

mysql -h 127.0.0.1 -u root -p123456 <<'SQL'
CREATE DATABASE IF NOT EXISTS smartvoucher
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON smartvoucher.* TO 'root'@'%' IDENTIFIED BY '123456';
FLUSH PRIVILEGES;
SQL
echo "  ✅ MySQL database 'smartvoucher' is ready."

# ── 2. Python / Django backend ────────────────────────────
echo ""
echo "▶ Installing Python dependencies..."
cd "$REPO_ROOT/Backend"
pip install --quiet -r requirements.txt
echo "  ✅ Python packages installed."

echo ""
echo "▶ Running Django migrations..."
DJANGO_DB_HOST=127.0.0.1 \
DJANGO_DB_PORT=3306 \
DJANGO_DB_NAME=smartvoucher \
DJANGO_DB_USER=root \
DJANGO_DB_PASSWORD=123456 \
  python manage.py migrate --verbosity=0
echo "  ✅ Migrations applied."

echo ""
echo "▶ Creating admin user (admin / admin123)..."
DJANGO_DB_HOST=127.0.0.1 \
DJANGO_DB_PORT=3306 \
DJANGO_DB_NAME=smartvoucher \
DJANGO_DB_USER=root \
DJANGO_DB_PASSWORD=123456 \
  python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    u = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    u.role = 'admin'
    u.save(update_fields=['role'])
    print('  ✅ Admin created')
else:
    print('  ℹ️  Admin already exists')
"

# ── 3. Node.js / Vite frontend ────────────────────────────
echo ""
echo "▶ Installing frontend dependencies..."
cd "$REPO_ROOT/Frontend"
npm install --silent
echo "  ✅ npm packages installed."

echo ""
echo "======================================================"
echo "  Setup complete! 🎉"
echo ""
echo "  Start the backend:"
echo "    cd Backend && python manage.py runserver"
echo ""
echo "  Start the frontend (new terminal):"
echo "    cd Frontend && npm run dev"
echo ""
echo "  Admin login:  admin / admin123"
echo "  Frontend URL: http://localhost:5173"
echo "  Backend API:  http://localhost:8000/api"
echo "======================================================"
echo ""
