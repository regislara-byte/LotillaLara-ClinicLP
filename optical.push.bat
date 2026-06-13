@echo off

echo.
echo =================================
echo      LL-OPTICALV2 DEPLOY
echo =================================
echo.

git add .
git commit -m "LL-OPTICALV2 Update"
git push origin main

echo.
echo =================================
echo       DEPLOY COMPLETE
echo =================================
echo.

start https://github.com/regislara-byte.github.io/LL-Optical-v2/

echo.
echo Opening GitHub Repository...
echo.

pause