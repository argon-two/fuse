@echo off
chcp 65001 >nul
title ⚡ Остановка Fuse
color 0C

echo.
echo ═══════════════════════════════════════════════════════
echo             ⚡ ОСТАНОВКА FUSE ⚡
echo ═══════════════════════════════════════════════════════
echo.

echo Остановка всех процессов Node.js...

taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Все процессы остановлены
) else (
    echo ⚠️ Процессы не найдены или уже остановлены
)

echo.
pause
