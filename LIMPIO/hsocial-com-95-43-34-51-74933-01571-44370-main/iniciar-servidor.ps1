# Script para iniciar el servidor de desarrollo
# Ejecuta este script en PowerShell desde la carpeta del proyecto

Write-Host "=== Iniciando servidor de desarrollo ===" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
$projectPath = "c:\Users\Admin\Desktop\conectar profesionales\hsocial-com-95-43-34-51-74933-01571-44370-main"
Set-Location $projectPath

Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Yellow

# Verificar Node.js
Write-Host "`nVerificando Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "npm: $npmVersion" -ForegroundColor Green

# Verificar si node_modules existe
Write-Host "`nVerificando dependencias..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "node_modules existe ✓" -ForegroundColor Green
    
    # Verificar Vite específicamente
    if (Test-Path "node_modules\vite") {
        Write-Host "Vite está instalado ✓" -ForegroundColor Green
    } else {
        Write-Host "Vite NO está instalado ✗" -ForegroundColor Red
        Write-Host "Instalando dependencias..." -ForegroundColor Yellow
        npm install
    }
} else {
    Write-Host "node_modules NO existe ✗" -ForegroundColor Red
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Iniciar servidor
Write-Host "`n=== Iniciando servidor en http://localhost:8080 ===" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Yellow

npm run dev
