Write-Host "Clearing Angular build cache..." -ForegroundColor Yellow

# Stop any running Angular processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove Angular cache
if (Test-Path ".angular") {
    Write-Host "Removing .angular cache directory..." -ForegroundColor Green
    Remove-Item -Recurse -Force .angular
}

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Green
    Remove-Item -Recurse -Force node_modules
}

# Remove package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Green
    Remove-Item -Force package-lock.json
}

# Reinstall dependencies
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm install

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Cache cleared successfully!" -ForegroundColor Green
Write-Host "You can now run: ng serve" -ForegroundColor Cyan
