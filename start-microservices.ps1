# StudyHub Microservices Launcher
$root = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting StudyHub Microservices Stack  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. StudyHub Gateway (Port 8080)
Write-Host "[1/4] Starting StudyHub Gateway on port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\studyhub-gateway'; mvn spring-boot:run"

# 2. Auth Service (Port 8085)
Write-Host "[2/4] Starting Auth Service on port 8085..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\auth-service'; mvn spring-boot:run"

# 3. Material Service (Port 8082)
Write-Host "[3/4] Starting Material Service on port 8082..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\material-service'; mvn spring-boot:run"

# 4. AI Service (Port 8083)
Write-Host "[4/4] Starting AI Service on port 8083..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\ai-service'; mvn spring-boot:run"

Write-Host "`nAll 4 backend services launched in separate windows!" -ForegroundColor Green
Write-Host "Gateway URL:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend API: http://localhost:8080/api" -ForegroundColor Cyan
