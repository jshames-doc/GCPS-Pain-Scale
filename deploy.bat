@echo off
SETLOCAL
SET SERVICE_NAME=gcps-pain-scale
SET REGION=me-west1
SET PROJECT_ID=gen-lang-client-0026629090

echo ====================================================
echo   Cloud Run Deployment: %SERVICE_NAME%
echo ====================================================
echo.

echo [1/3] Building React application...
pushd app
call npm install && call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed. Deployment aborted.
    popd
    pause
    exit /b %ERRORLEVEL%
)
popd

echo.
echo [2/3] Verifying Google Cloud configuration...
call gcloud config set project %PROJECT_ID%

echo.
echo [3/3] Deploying to Cloud Run...
echo This may take a few minutes...
echo.

call gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated

echo.
echo ====================================================
echo   Deployment Process Finished
echo ====================================================
pause
