@echo off
chcp 65001 >nul
title ⚡ Запуск Fuse
color 0E

echo.
echo ═══════════════════════════════════════════════════════
echo              ⚡ ЗАПУСК FUSE ⚡
echo ═══════════════════════════════════════════════════════
echo.

REM Проверка установки
if not exist "server\node_modules" (
    echo ❌ Сервер не установлен!
    echo Запустите INSTALL_WINDOWS.bat сначала
    pause
    exit /b 1
)

if not exist "client\node_modules" (
    echo ❌ Клиент не установлен!
    echo Запустите INSTALL_WINDOWS.bat сначала
    pause
    exit /b 1
)

echo [✓] Запуск сервера...
start "Fuse Server" cmd /k "cd server && npm run dev"

timeout /t 5 /nobreak >nul

echo [✓] Запуск клиента (откроется в браузере)...
start "Fuse Client" cmd /k "cd client && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ═══════════════════════════════════════════════════════
echo              ⚡ FUSE ЗАПУЩЕН! ⚡
echo ═══════════════════════════════════════════════════════
echo.
echo Сервер: http://localhost:3000
echo Клиент: http://localhost:5173
echo.
echo Браузер откроется автоматически через несколько секунд...
echo.
echo Для остановки закройте все окна или нажмите Ctrl+C
echo.

timeout /t 5 /nobreak >nul
start http://localhost:5173

pause
