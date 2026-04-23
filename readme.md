# 📘 Bookmate — Full-Stack Book Management System

Bookmate is a comprehensive book management application built with modern web technologies. It combines a robust FastAPI backend with a responsive React frontend to create a powerful platform for managing personal and organizational book collections.

## 🏗️ Architecture Overview

Bookmate follows Clean Architecture principles with Domain-Driven Design (DDD) patterns:

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

## 🚀 Real-World Applications

### 1. Personal Library Management
- **Home Library**: Track your personal book collection with details like purchase date, reading status, and ratings
- **Reading Progress**: Monitor your reading journey with status tracking and completion dates
- **Book Wishlist**: Maintain a wishlist of books you want to read or purchase

### 2. Educational Institutions
- **School Libraries**: Manage school library inventories with student borrowing tracking
- **University Research**: Track academic books and research materials with categorization
- **Course Materials**: Organize textbooks and reference materials for different courses

### 3. Corporate Book Clubs
- **Employee Libraries**: Manage company book collections for employee development
- **Book Sharing Programs**: Track book lending between employees
- **Professional Development**: Monitor reading progress for training programs

### 4. Community Libraries
- **Public Library Systems**: Manage book inventories and member accounts
- **Book Exchange Programs**: Facilitate community book sharing
- **Reading Groups**: Organize and track group reading activities

### 5. E-commerce Integration
- **Book Marketplace**: Extend to include book purchasing and selling features
- **Recommendation Engine**: AI-powered book recommendations based on reading history
- **Digital Library**: Integration with e-book platforms and digital reading services

## 🎯 Key Features

### Core Functionality
- **Book Management**: Full CRUD operations for books (Create, Read, Update, Delete)
- **User Authentication**: Secure login and registration system
- **User Preferences**: Personalized settings and reading preferences
- **AI Chat Integration**: Intelligent book recommendations and assistance

### Advanced Features
- **Book Search**: Powerful search functionality with filters
- **Reading Status**: Track reading progress (To Read, Reading, Completed)
- **Book Ratings**: Rate and review books
- **Wishlist Management**: Maintain a list of desired books
- **Book Details**: Comprehensive book information including author, language, and publication date

## 📂 Project Structure

```
Bookmate/
├── src/
│   ├── Bookmate.API/                # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py              # Application entry point
│   │   │   ├── config.py            # Configuration settings
│   │   │   ├── domain/              # Business logic and models
│   │   │   ├── application/         # Use cases and services
│   │   │   ├── infrastructure/      # Database and external services
│   │   │   └── interfaces/          # API endpoints
│   │   ├── alembic/                 # Database migrations
│   │   ├── tests/                   # Test suite
│   │   └── requirements.txt         # Python dependencies
│   │
│   └── Bookmate.UI/                 # React frontend
│       ├── src/
│       │   ├── Pages/               # Page components
│       │   ├── Componants/          # Reusable components
│       │   ├── Api/                 # API service calls
│       │   ├── Types/               # TypeScript definitions
│       │   └── css/                 # Stylesheets
│       ├── public/                  # Static assets
│       ├── package.json             # Node dependencies
│       └── vite.config.ts           # Build configuration
│
├── .gitignore                       # Git ignore rules
├── readme.md                        # This file
└── structure.txt                    # Project structure documentation
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLModel**: SQL database modeling with Python dataclasses
- **SQLite**: Lightweight database for development and small deployments
- **Alembic**: Database migration tool
- **Pydantic**: Data validation and settings management

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing

## 🚀 Getting Started

For free production deployment with environment-based configuration, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. **Navigate to the API directory**:
   ```bash
   cd src/Bookmate.API
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the API server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. **Verify API is running**:
   - OpenAPI Documentation: http://127.0.0.1:8000/docs
   - API Root: http://127.0.0.1:8000/

### Frontend Setup

1. **Navigate to the UI directory**:
   ```bash
   cd src/Bookmate.UI
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   - http://localhost:5173/

## 👤 User Guide

Bookmate is now easiest to use with this flow:

1. Register or log in.
2. Add your first book from the `Add Book` page.
3. Open `Library` and add the book to `reading`, `completed`, or `wishlist`.
4. Save at least one entry in `Preferences`.
5. Record a rating, like, view, or purchase in `Activity`.
6. Open `Recommendations` to see personalized suggestions.

### In-App Guidance

- The home page now includes a quick-start checklist and workspace summary.
- A dedicated `User Guide` page explains the best first-time workflow.
- Empty states across the app now include direct next-step actions so new users do not get stuck.

### What Makes The App More Ready To Use

- Clear first-run navigation for new users
- Faster discovery of core actions like add, track, and recommend
- Better guidance when pages have no data yet
- Easier handoff for demos, classmates, or non-technical users

## 📡 API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### AI Chat
- `POST /api/ai/chat` - AI book recommendations

## 📚 Use Case Examples

### Personal Library Management
```javascript
// Add a new book to your collection
const newBook = {
  title: "Clean Architecture",
  author: "Robert C. Martin",
  language: "English",
  published_date: "2017-09-01",
  image_url: "https://example.com/clean-architecture.jpg",
  purchased_date: "2023-01-15",
  status: "To Read"
};
```

### Educational Institution
```javascript
// Track student borrowing
const borrowRecord = {
  student_id: "student-123",
  book_id: "book-456",
  borrow_date: "2024-01-15",
  due_date: "2024-02-15",
  status: "Borrowed"
};
```

### Corporate Book Club
```javascript
// Manage book club reading list
const bookClub = {
  name: "Leadership Development Club",
  books: ["book-1", "book-2", "book-3"],
  members: ["employee-1", "employee-2"],
  current_book: "book-1",
  reading_deadline: "2024-03-31"
};
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the API directory:

```env
DATABASE_URL=sqlite:///./bookmate.db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```

### Database Setup
The application uses SQLite by default. For production, consider using PostgreSQL or MySQL.

## 🧪 Testing

### Backend Tests
```bash
cd src/Bookmate.API
python -m pytest
```

### Frontend Tests
```bash
cd src/Bookmate.UI
npm run test
```

## 📊 Deployment

### Docker Deployment
```dockerfile
# Dockerfile for Bookmate
FROM python:3.9-slim

# Backend setup
WORKDIR /app
COPY src/Bookmate.API/requirements.txt .
RUN pip install -r requirements.txt

# Frontend setup
WORKDIR /app/frontend
COPY src/Bookmate.UI/ .
RUN npm install && npm run build

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Configuration
- Use environment variables for configuration
- Implement proper logging and monitoring
- Set up database backups
- Configure SSL/TLS for secure connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📋 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Bookmate** - Your Complete Book Management Solution
