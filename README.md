# SmartVoucher Admin 🎟️

Hệ thống quản lý voucher bán hàng — bao gồm:

- **Backend**: Django REST Framework + JWT + MySQL
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## ⚡ Cách chạy nhanh nhất – GitHub Codespaces

> Không cần cài đặt bất cứ thứ gì trên máy tính cá nhân.

1. Mở repository trên GitHub
2. Nhấn nút **`< > Code`** → chọn tab **Codespaces** → nhấn **"Create codespace on main"**
3. Chờ khoảng **3–5 phút** để container khởi động và chạy script cài đặt tự động
4. Sau khi xong, mở **2 terminal** trong VS Code:

   **Terminal 1 – Backend:**
   ```bash
   cd Backend
   DJANGO_DB_HOST=127.0.0.1 DJANGO_DB_PASSWORD=123456 python manage.py runserver
   ```

   **Terminal 2 – Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

5. Codespaces sẽ tự động forward port và hiện popup **"Open in Browser"** → nhấn vào đó
6. Đăng nhập bằng tài khoản: **`admin` / `admin123`**

---

## 🐳 Chạy bằng Docker Compose (máy local)

> Yêu cầu: Docker Desktop đã được cài và đang chạy.

```bash
# Clone repo
git clone https://github.com/khoi-pham-it/DACN.git
cd DACN

# Build và chạy tất cả services
docker compose up --build
```

Sau khi khởi động xong (~2 phút):

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:80 |
| Backend API (nội bộ, không expose) | — |

> Port duy nhất expose ra ngoài là **port 80** (frontend nginx). Nginx tự động proxy `/api/` đến backend.

### Tạo tài khoản admin trong Docker

```bash
# Chạy sau khi docker compose up đã chạy xong
docker compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
u.role = 'admin'
u.save(update_fields=['role'])
print('Done')
"
```

---

## 💻 Chạy thủ công trên máy local (Development)

### Yêu cầu

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 20+ |
| MySQL | 8.0+ |

### Bước 1 – MySQL

```sql
-- Chạy trong MySQL client
CREATE DATABASE smartvoucher CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 2 – Backend

```bash
cd Backend
pip install -r requirements.txt
python manage.py migrate

# Tạo tài khoản admin
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
u.role = 'admin'
u.save(update_fields=['role'])
"

python manage.py runserver
# API chạy tại: http://localhost:8000
```

### Bước 3 – Frontend

```bash
cd Frontend
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:5173
```

> Vite đã được cấu hình **proxy** `/api` → `http://localhost:8000`, nên frontend và backend chạy riêng nhưng không bị lỗi CORS.

---

## 🧪 Chạy Puppeteer E2E Tests

Sau khi cả backend và frontend đang chạy:

```bash
cd Frontend

# Chạy tất cả tests
npm run test:e2e

# Hoặc chạy từng phần:
npm run test:e2e:auth       # Test trang login (không cần backend)
npm run test:e2e:vouchers   # Test trang quản lý voucher
npm run test:e2e:staffs     # Test trang quản lý nhân viên
```

**Biến môi trường cho tests** (mặc định đã đúng với setup local):

```bash
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:8000/api
TEST_USERNAME=admin
TEST_PASSWORD=admin123
```

---

## 📁 Cấu trúc dự án

```
DACN/
├── docker-compose.yml          # Chạy toàn bộ stack bằng Docker
├── .devcontainer/
│   ├── devcontainer.json       # Config cho GitHub Codespaces
│   └── setup.sh                # Script cài đặt tự động
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── Backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── smartvoucher/
│   │   └── settings.py
│   ├── users/                  # Quản lý người dùng, staff, khách hàng
│   ├── vouchers/               # Voucher, thống kê, recipients
│   └── orders/
└── Frontend/
    ├── Dockerfile
    ├── nginx.conf              # Nginx proxy config (production)
    ├── vite.config.ts          # Vite proxy config (development)
    ├── tests/e2e/              # Puppeteer E2E tests
    └── src/
        ├── contexts/
        │   └── AuthContext.tsx # JWT auth context
        ├── services/
        │   └── apiService.ts   # API helper với auth headers
        └── pages/Admin/
            ├── Login/          # Trang đăng nhập
            ├── Dashboard/      # Thống kê tổng quan
            ├── Vouchers/       # Danh sách voucher + khách hàng nhận Voucher
            └── Staffs/         # Quản lý nhân viên (CRUD)
```

---

## 🔑 Tài khoản mặc định

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

---

## 🔗 API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/users/login/` | Đăng nhập, lấy JWT token |
| `GET` | `/api/users/staff/` | Danh sách nhân viên |
| `PATCH` | `/api/users/<id>/role/` | Cập nhật vai trò |
| `DELETE` | `/api/users/<id>/` | Vô hiệu hoá tài khoản |
| `GET` | `/api/vouchers/stats/overview/` | Thống kê tổng quan |
| `GET` | `/api/vouchers/stats/performance/` | Hiệu suất voucher |
| `GET` | `/api/vouchers/<id>/recipients/` | Danh sách nhận voucher, đồng bộ khách hàng từ web chính |
