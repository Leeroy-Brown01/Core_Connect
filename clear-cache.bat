@echo off
echo Clearing Angular build cache...

:: Stop any running Angular processes
taskkill /f /im node.exe 2>nul

:: Remove Angular cache
if exist ".angular" (
    echo Removing .angular cache directory...
    rmdir /s /q ".angular"
)

:: Remove node_modules (optional but recommended)
if exist "node_modules" (
    echo Removing node_modules...
    rmdir /s /q "node_modules"
)

:: Remove package-lock.json
if exist "package-lock.json" (
    echo Removing package-lock.json...
    del "package-lock.json"
)

:: Reinstall dependencies
echo Reinstalling dependencies...
npm install

:: Clear npm cache
echo Clearing npm cache...
npm cache clean --force

echo Cache cleared successfully!
echo You can now run: ng serve
pause