@echo off
title LL-OPTICALV2 DEPLOY ENGINE

echo.
echo =====================================
echo        LL-OPTICALV2 DEPLOY
echo =====================================
echo.

git add .

git commit -m "LL-OPTICALV2 Update %date% %time%"

git push origin main

echo.
echo =====================================
echo          PUSH COMPLETE
echo =====================================
echo.

echo Waiting for GitHub Pages update...
timeout /t 5 >nul

echo.
echo Opening Repository...
start https://github.com/regislara-byte/LotillaLara-ClinicLP

echo.
echo Opening Live Website...
start https://regislara-byte.github.io/LotillaLara-ClinicLP/

echo.
echo =====================================
echo       DEPLOYMENT FINISHED
echo =====================================
echo.

pause