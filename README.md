# Telegram File Share

A web application that allows users to upload files, images, or text, automatically sends them to a Telegram channel/group, and provides shareable preview links.

## Features

- Upload files (images, documents, videos, etc.)
- Upload text content
- Automatic notification to Telegram channel/group
- Shareable preview links
- File download functionality
- Docker deployment support

## Quick Start

### Prerequisites

1. Create a Telegram Bot via [@BotFather](https://t.me/BotFather)
2. Get your Bot Token
3. Add the bot to your channel/group as an administrator
4. Get the Chat ID of your channel/group

### Development

**Backend:**
```bash
cd backend
cp ../.env.example .env
# Edit .env with your configuration
go run .
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker Deployment

1. Copy environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```env
BASE_URL=https://your-domain.com
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

3. Build and run:
```bash
docker-compose up -d --build
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Public URL of your application | `http://localhost` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | - |
| `TELEGRAM_CHAT_ID` | Target channel/group ID | - |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `52428800` (50MB) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload a file |
| POST | `/api/text` | Upload text content |
| GET | `/api/file/:id` | Get file information |
| GET | `/api/download/:id` | Download file |
| GET | `/api/preview/:id` | Preview file |

## Tech Stack

- **Backend:** Go + Gin + SQLite
- **Frontend:** React + TypeScript + Vite
- **Deployment:** Docker + Nginx
