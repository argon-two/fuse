# Fuse Server

Серверная часть приложения Fuse.

## Быстрый старт

### Установка

```bash
npm install
```

### Настройка

Создайте файл `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fuse
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### База данных

Создайте базу данных PostgreSQL:

```bash
createdb fuse
```

Миграции запустятся автоматически при первом запуске сервера.

### Запуск

Продакшн:
```bash
npm run build
npm start
```

Разработка:
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Аутентификация
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Каналы
```
GET /api/channels
POST /api/channels
GET /api/channels/:id/messages
DELETE /api/channels/:id
```

### Загрузка файлов
```
POST /api/upload
```

### Статические файлы
```
GET /uploads/:filename
```

## WebSocket Events

Сервер слушает следующие события:

- `join-channel`
- `leave-channel`
- `send-message`
- `call-user`
- `make-answer`
- `ice-candidate`
- `join-voice-channel`
- `leave-voice-channel`
- `typing-start`
- `typing-stop`

## Структура базы данных

### users
- id, username, email, password_hash
- avatar_url, status
- created_at, last_seen

### channels
- id, name, type (text/voice/video)
- created_by, created_at

### messages
- id, channel_id, user_id
- content, message_type
- file_url, file_name, file_size
- created_at, edited_at, deleted_at

### sessions
- id, user_id, token
- ip_address, user_agent
- created_at, expires_at

### calls
- id, channel_id, started_by
- started_at, ended_at, call_type

### call_participants
- id, call_id, user_id
- joined_at, left_at

## Порты

По умолчанию сервер слушает на порту **3000**.

Для изменения установите переменную `PORT` в `.env`.

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- CORS настроен для разработки (настройте для продакшна!)
- Лимиты на размер файлов

## Логирование

Все запросы логируются в консоль с временем выполнения.
