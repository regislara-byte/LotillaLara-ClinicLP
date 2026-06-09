@echo off
title LL-OPTICALV2 DEPLOY

echo.
echo ==========================
echo   LL-OPTICALV2 DEPLOY
echo ==========================
echo.

git add .
git commit -m "LL-OPTICALV2 Update"
git push origin main

echo.
echo ==========================
echo   DEPLOY COMPLETE
echo ==========================
echo.

pause