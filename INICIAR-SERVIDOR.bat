@echo off
echo ========================================
echo   INICIANDO SERVIDOR DO BOLETIM WEB
echo ========================================
echo.
echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js de: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado!
echo.
echo Iniciando servidor...
echo.
node server.js

pause
