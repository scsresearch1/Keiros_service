@echo off
echo ========================================
echo EAS Project Initialization
echo ========================================
echo.
echo This will create/link your Expo project to EAS.
echo When prompted, type 'yes' to create a new project.
echo.
pause
eas init
echo.
echo ========================================
echo If successful, you can now run:
echo   npm run build:android:preview
echo ========================================
pause

