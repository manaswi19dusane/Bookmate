# 📘 Bookmate — UI + API Setup Guide

Bookmate is a full-stack project consisting of:

- **Bookmate.API** — FastAPI + SQLModel backend  
- **Bookmate.UI** — React + Vite frontend  

This guide explains how to set up and run both projects.

---

# 📂 Project Structure

```
src/
│
├── Bookmate.API/                # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   ├── alembic/
│   ├── venv/
│   ├── .env
│   └── requirements.txt
│
└── Bookmate.UI/                 # React frontend (Vite)
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── node_modules/
```

---

# 🚀 Steps to Run

---

# 💻 Running the Backend (FastAPI)

### 📍 Location
```
Bookmate\src\Bookmate.API
```

---

### 1️⃣ Create & Activate Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate
```

---

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

---

### 3️⃣ Run the API Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

### 4️⃣ Verify API is Running
👉 http://127.0.0.1:8000/docs

### Curl for apis - copy this curl and use it in postman

#### Insert Book
```
curl --location 'http://127.0.0.1:8000/api/books' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--data '
  {
    
    "title": "Test Book",
    "author": "OneSolve",
    "language": "english",
    "published_date": "2025-11-29",
    "image_url": "http://",
    "purchased_date": "2025-11-29"
  }
'
```
#### Get All books
```
curl --location --request GET 'http://127.0.0.1:8000/api/books' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--data '
'
```

#### GetBy ID
```
curl --location --request GET 'http://127.0.0.1:8000/api/books/61f696fc-85f6-431b-9ff8-3e5c2782b74b' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--data '
  
'
```
---

# 💻 Running the Frontend (React + Vite)

### 📍 Location
```
Bookmate\src\Bookmate.UI
```

---

### 1️⃣ Install Node Modules
```bash
npm install

```
```bash
npm install react-router-dom
npm install -D @types/react-router-dom

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
---

### 2️⃣ Run Development Server
```bash
npm run dev
```

---

### 3️⃣ Open the UI
👉 http://localhost:5173/

---

# 🗺 Architecture Diagram (ASCII)

```
                 ┌─────────────────────────┐
                 │        Bookmate.UI       │
                 │     (React + Vite App)   │
                 └─────────────┬────────────┘
                               │  REST API Calls
                               ▼
                 ┌─────────────────────────┐
                 │       Bookmate.API       │
                 │   (FastAPI + SQLModel)   │
                 ├─────────────────────────┤
                 │ app/main.py              │
                 │ app/domain               │
                 │ app/application          │
                 │ app/infrastructure       │
                 │ app/interfaces/api_v1    │
                 └─────────────┬────────────┘
                               │ ORM / DB Access
                               ▼
                 ┌─────────────────────────┐
                 │        SQLite / DB       │
                 └─────────────────────────┘
```

---
