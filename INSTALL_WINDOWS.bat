@echo off
chcp 65001 >nul
title ⚡ Установка Fuse
color 0E

echo.
echo ═══════════════════════════════════════════════════════
echo            ⚡ УСТАНОВКА FUSE ⚡
echo ═══════════════════════════════════════════════════════
echo.

REM Проверка Node.js
echo [1/4] Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo.
    echo Скачайте и установите Node.js отсюда:
    echo https://nodejs.org/
    echo.
    echo После установки запустите этот файл снова.
    pause
    exit /b 1
)
echo ✅ Node.js установлен
echo.

REM Проверка PostgreSQL
echo [2/4] Проверка PostgreSQL...
pg_config --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ PostgreSQL не найден
    echo.
    echo Скачайте и установите PostgreSQL отсюда:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo После установки запустите этот файл снова.
    pause
    exit /b 1
)
echo ✅ PostgreSQL установлен
echo.

REM Создание базы данных
echo [3/4] Создание базы данных...
echo.
echo Введите пароль PostgreSQL (по умолчанию: postgres)
createdb -U postgres fuse 2>nul
if %errorlevel% equ 0 (
    echo ✅ База данных создана
) else (
    echo ⚠️ База данных уже существует или ошибка создания
)
echo.

REM Установка зависимостей
echo [4/4] Установка зависимостей...
echo.

cd server
echo Установка зависимостей сервера...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей сервера
    pause
    exit /b 1
)
cd ..

cd client
echo Установка зависимостей клиента...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей клиента
    pause
    exit /b 1
)
cd ..

echo.
echo ═══════════════════════════════════════════════════════
echo            ✅ УСТАНОВКА ЗАВЕРШЕНА! ✅
echo ═══════════════════════════════════════════════════════
echo.
echo Запустите START_FUSE.bat для запуска приложения
echo.
pause
