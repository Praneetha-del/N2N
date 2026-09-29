Write-Host "Building StudyHub Microservices..." -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\studyhub-microservices"
mvn clean install -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAll microservices built successfully!" -ForegroundColor Green
} else {
    Write-Host "`nBuild failed! Please check error output." -ForegroundColor Red
}
