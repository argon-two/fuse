# 🐳 Docker Deployment для Fuse

Самый простой способ развернуть Fuse сервер - использовать Docker.

## 📋 Требования

- Docker 20.10+
- Docker Compose 2.0+

## 🚀 Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone <your-repo>
cd fuse
```

### 2. Запустите сервер

```bash
docker-compose up -d
```

Вот и всё! 🎉

Сервер будет доступен на `http://localhost:3000`

### 3. Проверьте статус

```bash
docker-compose ps
```

Вы должны увидеть:
```
NAME                COMMAND                  SERVICE    STATUS
fuse-postgres       "docker-entrypoint.s…"   postgres   Up
fuse-server         "node dist/index.js"     server     Up
```

### 4. Проверьте работу

```bash
curl http://localhost:3000/health
```

Ответ должен быть:
```json
{"status":"ok","message":"Fuse Server is running"}
```

## 🔧 Конфигурация

### Изменение переменных окружения

Отредактируйте `docker-compose.yml`:

```yaml
environment:
  PORT: 3000
  JWT_SECRET: ваш-секретный-ключ  # ВАЖНО: измените в продакшне!
  MAX_FILE_SIZE: 52428800  # 50MB
```

### Изменение портов

Если порт 3000 занят:

```yaml
ports:
  - "8080:3000"  # Внешний:Внутренний
```

Теперь сервер доступен на порту 8080.

## 📊 Управление

### Запуск

```bash
docker-compose up -d
```

### Остановка

```bash
docker-compose down
```

### Перезапуск

```bash
docker-compose restart
```

### Остановка с удалением данных

```bash
docker-compose down -v
```

⚠️ **Внимание**: Это удалит все данные из базы!

## 📝 Логи

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только сервер
docker-compose logs -f server

# Только база данных
docker-compose logs -f postgres
```

### Последние 100 строк

```bash
docker-compose logs --tail=100 server
```

## 🔄 Обновление

```bash
# Остановите контейнеры
docker-compose down

# Обновите код
git pull

# Пересоберите и запустите
docker-compose up -d --build
```

## 💾 Резервное копирование

### Бэкап базы данных

```bash
docker-compose exec postgres pg_dump -U fuseuser fuse > backup.sql
```

### Восстановление из бэкапа

```bash
docker-compose exec -T postgres psql -U fuseuser fuse < backup.sql
```

### Бэкап загруженных файлов

```bash
docker cp fuse-server:/app/uploads ./uploads_backup
```

## 🌐 Развертывание на сервере

### 1. На VPS/Cloud сервере

```bash
# Установите Docker
curl -fsSL https://get.docker.com | sh

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Выйдите и войдите снова
exit
```

### 2. Клонируйте и запустите

```bash
git clone <your-repo>
cd fuse
docker-compose up -d
```

### 3. Настройте Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 3000/tcp
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 🔐 Безопасность

### 1. Измените JWT_SECRET

Отредактируйте `docker-compose.yml`:

```yaml
JWT_SECRET: $(openssl rand -base64 32)
```

### 2. Измените пароли базы данных

```yaml
POSTGRES_PASSWORD: новый-пароль
DB_PASSWORD: новый-пароль
```

### 3. Ограничьте доступ к PostgreSQL

Закомментируйте проброс порта:

```yaml
postgres:
  # ports:
  #   - "5432:5432"
```

### 4. Используйте Nginx reverse proxy

Создайте `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📈 Мониторинг

### Использование ресурсов

```bash
docker stats fuse-server fuse-postgres
```

### Дисковое пространство

```bash
docker system df
```

### Очистка неиспользуемых данных

```bash
docker system prune -a
```

## 🐛 Troubleshooting

### Сервер не запускается

```bash
# Проверьте логи
docker-compose logs server

# Проверьте, что PostgreSQL готов
docker-compose exec postgres pg_isready -U fuseuser
```

### База данных недоступна

```bash
# Перезапустите PostgreSQL
docker-compose restart postgres

# Проверьте пароли в docker-compose.yml
```

### Порт уже используется

```bash
# Найдите процесс
sudo lsof -i :3000

# Остановите процесс или измените порт в docker-compose.yml
```

### Проблемы с правами доступа к файлам

```bash
# Исправьте владельца папки uploads
docker-compose exec server chown -R node:node /app/uploads
```

## 🔧 Продвинутая конфигурация

### Использование внешней базы данных

Закомментируйте сервис `postgres` и укажите внешний хост:

```yaml
server:
  environment:
    DB_HOST: your-external-db-host.com
    DB_PORT: 5432
    DB_NAME: fuse
    DB_USER: fuseuser
    DB_PASSWORD: password
```

### Масштабирование

```bash
docker-compose up -d --scale server=3
```

Потребуется балансировщик нагрузки (Nginx/HAProxy).

### Персистентное хранилище

Volumes уже настроены в `docker-compose.yml`:
- `postgres_data` - данные PostgreSQL
- `uploads_data` - загруженные файлы

## 📚 Полезные команды

```bash
# Войти в контейнер сервера
docker-compose exec server sh

# Войти в PostgreSQL
docker-compose exec postgres psql -U fuseuser fuse

# Экспорт базы
docker-compose exec postgres pg_dump -U fuseuser fuse > dump.sql

# Импорт базы
docker-compose exec -T postgres psql -U fuseuser fuse < dump.sql

# Просмотр сетей
docker network ls

# Очистка всего
docker-compose down -v --rmi all
```

---

<div align="center">

**Готово! Ваш Fuse сервер работает в Docker! 🎉**

</div>
