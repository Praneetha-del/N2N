# StudyHub Full Stack Launcher (Backend Microservices + Frontend)
$root = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "     Starting StudyHub Full Stack        " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. StudyHub Gateway (Port 8080)
Write-Host "[1/5] Starting StudyHub Gateway on port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\studyhub-gateway'; Write-Host '--- Starting Gateway on 8080 ---' -ForegroundColor Cyan; mvn spring-boot:run"

# 2. Auth Service (Port 8085)
Write-Host "[2/5] Starting Auth Service on port 8085..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\auth-service'; Write-Host '--- Starting Auth Service on 8085 ---' -ForegroundColor Cyan; mvn spring-boot:run"

# 3. Material Service (Port 8082)
Write-Host "[3/5] Starting Material Service on port 8082..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\material-service'; Write-Host '--- Starting Material Service on 8082 ---' -ForegroundColor Cyan; mvn spring-boot:run"

# 4. AI Service (Port 8083)
Write-Host "[4/5] Starting AI Service on port 8083..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-microservices\ai-service'; Write-Host '--- Starting AI Service on 8083 ---' -ForegroundColor Cyan; mvn spring-boot:run"

# 5. Frontend (Port 5173)
Write-Host "[5/5] Starting StudyHub Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\studyhub-frontend'; Write-Host '--- Starting Frontend on 5173 ---' -ForegroundColor Cyan; npm run dev"

Write-Host "`nAll 5 services launched in separate windows!" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor DarkGray
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Green
Write-Host "API Gateway:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Auth Service: http://localhost:8085" -ForegroundColor DarkYellow
Write-Host "Material Svc: http://localhost:8082" -ForegroundColor DarkYellow
Write-Host "AI Service:   http://localhost:8083" -ForegroundColor DarkYellow
Write-Host "-----------------------------------------" -ForegroundColor DarkGray
Write-Host "Ensure MongoDB is active on localhost:27017" -ForegroundColor Magenta
