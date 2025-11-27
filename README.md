# Alaca

![CI/CD Pipeline](https://github.com/hiamchubbybear/fitlife-planner/actions/workflows/ci-cd.yml/badge.svg)
![Docker Compose Test](https://github.com/hiamchubbybear/fitlife-planner/actions/workflows/docker-compose-test.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Alaca** là nền tảng web hỗ trợ người dùng xây dựng và duy trì kế hoạch tập luyện và dinh dưỡng cá nhân hóa.
Hệ thống sử dụng dữ liệu cơ thể, mục tiêu và thói quen sống để tối ưu hóa lộ trình sức khỏe cho từng cá nhân.

Dự án được phát triển như **đồ án tốt nghiệp**, thể hiện khả năng ứng dụng các công nghệ web hiện đại (.NET, React, Redis, Kafka) để xây dựng một hệ thống có tính mở rộng và vận hành dựa trên dữ liệu.

---

## 🌟 Tính năng chính

- **Chương trình tập luyện cá nhân hóa** – tự động sinh routine dựa trên mục tiêu và trình độ.
- **Gợi ý dinh dưỡng thông minh** – tính BMR → TDEE → lượng calories mục tiêu và đề xuất thực đơn hằng ngày.
- **Dashboard tiến trình** – biểu đồ cân nặng, calories và hiệu suất tập luyện.
- **Cộng đồng & chia sẻ** – kết nối người dùng, chia sẻ mẹo và tạo động lực (tùy chọn).
- **Thông báo thời gian thực** – sử dụng Redis & Kafka để xử lý tác vụ nền và cập nhật tức thời.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React (Vite, TypeScript, TailwindCSS) |
| Backend | ASP.NET 8 REST API |
| Database | PostgreSQL / MongoDB |
| Caching | Redis |
| Messaging | Kafka |
| Deployment | Docker, Nginx, CI/CD |

---

## 🎯 Mục tiêu dự án

- Xây dựng nền tảng quản lý sức khỏe toàn diện với kiến trúc module hóa, dễ mở rộng.
- Áp dụng các kỹ thuật backend và system design như authentication, caching, event-driven, persistence.
- Tạo trải nghiệm người dùng hiện đại, tối giản và hiệu quả.

---

## 🚀 Deployment & CI/CD

Dự án được tích hợp **GitHub Actions** để tự động build, test và deploy:

### Tính năng CI/CD:
- **Automatic Build** - Tự động build khi push code
- **Docker Build & Push** - Build và push Docker images lên GitHub Container Registry
- **Security Scanning** - Quét lỗ hổng bảo mật với Trivy
- **Multi-platform Support** - Build cho cả Linux AMD64 và ARM64
- **Automated Releases** - Tự động tạo releases khi push tags

### Pull Docker Image:

```bash
# Pull latest version
docker pull ghcr.io/hiamchubbybear/alaca-backend:latest

# Pull specific version
docker pull ghcr.io/hiamchubbybear/alaca-backend:v1.0.0
```

### Run với Docker:

```bash
# Run backend service
docker run -d \
  -p 8000:8000 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  --name alaca-backend \
  ghcr.io/hiamchubbybear/alaca-backend:latest
```

### Development Setup:

```bash
# Clone repository
git clone https://github.com/hiamchubbybear/fitlife-planner.git
cd fitlife-planner/back-end/fitlife-planner-back-end

# Copy environment file
cp .env.example .env

# Start with Docker Compose
docker-compose up -d

# Or run locally
dotnet restore
dotnet run
```

📖 **Chi tiết setup CI/CD**: Xem [CI/CD Setup Guide](.github/CICD_SETUP.md)

---

> 🚀 **Alaca — nền tảng sức khỏe cá nhân hóa cho mọi người.**
