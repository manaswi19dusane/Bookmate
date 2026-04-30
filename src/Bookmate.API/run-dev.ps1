$apiRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $apiRoot

$venvPython = Join-Path $apiRoot "venv\\Scripts\\python.exe"

if (Test-Path $venvPython) {
    & $venvPython -m uvicorn app.main:app --reload
    exit $LASTEXITCODE
}

uvicorn app.main:app --reload
