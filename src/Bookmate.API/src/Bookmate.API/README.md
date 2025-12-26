# BookMate - FastAPI + DDD + Clean Architecture (Async, SQLite, Alembic)

## Quick start (Windows)

1. Create virtualenv and activate (PowerShell):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Initialize DB (optional - app creates tables on startup):
```powershell
uvicorn app.main:app --reload
```

3. Alembic
- alembic is included. To generate the first migration:
```powershell
alembic revision --autogenerate -m "init"
alembic upgrade head
```
Note: Alembic is configured to use the DATABASE_URL in this project.

## Project layout
See `app/` folder for Domain, Application, Infrastructure and Interfaces layers.

