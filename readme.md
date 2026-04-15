# Bookmate

Bookmate is a full-stack book management project with two main parts:

- `src/Bookmate.API`: a FastAPI backend with SQLModel/SQLite, JWT authentication, seeded demo data, and feature APIs for books, preferences, interactions, library tracking, institutions, clubs, community groups, marketplace items, and AI chat.
- `src/Bookmate.UI`: a React + TypeScript + Vite frontend that consumes those APIs and turns them into a personal reading dashboard.

At a high level, the app lets a user register, add books, move books into a personal library or wishlist, save reading preferences, log interactions, browse recommendations, and create community or marketplace records.

## What the project does

Bookmate combines catalog management and reading activity into one workflow:

1. A user registers or logs in.
2. The user creates books in the catalog.
3. Books can be added to a personal library with statuses like `reading`, `completed`, or `wishlist`.
4. The user saves preferred genres/authors and logs interactions such as `view`, `like`, `rating`, or `purchase`.
5. The frontend builds lightweight recommendations from available books plus the user profile/activity data.
6. The project also exposes additional community-style features: institutions, corporate clubs, community groups, and marketplace listings.

## Tech stack

### Backend
- FastAPI
- SQLModel + SQLAlchemy
- SQLite
- Pydantic / pydantic-settings
- Alembic
- `python-jose` for JWT
- `passlib[bcrypt]` for password hashing
- OpenAI Python SDK for AI chat

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- React Icons
- Plain CSS modules/files per feature area

## Repository structure

```text
Bookmate/
|-- .github/
|   `-- workflows/deploy.yml
|-- Bookmate.postman_collection.json
|-- package.json
|-- vite.config.ts
|-- readme.md
`-- src/
    |-- Bookmate.API/
    |   |-- alembic/
    |   |-- app/
    |   |   |-- application/
    |   |   |-- domain/
    |   |   |-- infrastructure/
    |   |   `-- interfaces/
    |   `-- tests/
    `-- Bookmate.UI/
        |-- public/
        `-- src/
            |-- Api/
            |-- Componants/
            |-- Pages/
            |-- context/
            |-- css/
            `-- services/
```

## System architecture

### Backend request flow

The backend mostly follows a layered style:

- `interfaces/api_v1`: FastAPI routes receive HTTP requests and shape responses.
- `application/usecases`: use-case classes coordinate book-related actions.
- `application/services`: service classes contain feature logic for auth, library, marketplace support, and AI chat.
- `domain`: domain entities and custom exceptions.
- `infrastructure/Mappers`: SQLModel table classes and conversion helpers.
- `infrastructure/repositories`: persistence layer for books and users.
- `infrastructure/db.py`: async engine/session creation and startup schema bootstrapping.

Example for creating a book:

1. `POST /api/books` hits `app/interfaces/api_v1/books.py`.
2. The route creates `BookRepository` and `CreateBookUseCase`.
3. `CreateBookUseCase.execute()` maps the request DTO to a domain `Book`.
4. `BookRepository.add()` converts the domain object into `BookORM` and commits it.
5. The use case returns a DTO, which is serialized back to the client.

### Frontend request flow

The frontend is organized around pages and shared API helpers:

1. `src/main.tsx` mounts the app.
2. `App.tsx` sets up routing and auth guards.
3. `AuthContext.tsx` stores the logged-in user and JWT token in local storage.
4. `services/api.ts` wraps all HTTP calls to the backend.
5. Page components fetch data, manage form state, and render UI with shared components such as `BookCard`, `Navbar`, and `Sidebar`.

## Backend walkthrough

### Entry point and configuration

- `src/Bookmate.API/app/main.py`
  Creates the FastAPI app, wires routers, enables CORS, initializes the database on startup, and optionally seeds sample data. It also injects the Bearer auth scheme into Swagger/OpenAPI.
- `src/Bookmate.API/app/config.py`
  Loads settings from environment variables and `.env`. Important values are the database URL, JWT secret, OpenAI API key, and `ENABLE_SAMPLE_DATA`.
- `src/Bookmate.API/app/infrastructure/db.py`
  Builds the async SQLAlchemy engine and async session factory. `init_db()` creates tables and also patches the `userpreferenceorm` table by adding `book_id` if missing.

### Domain layer

- `src/Bookmate.API/app/domain/models.py`
  Defines the `BookId` value object and `Book` entity.
- `src/Bookmate.API/app/domain/models_user.py`
  Defines `User`, `UserPreference`, and `UserInteraction` entities plus their ID value objects.
- `src/Bookmate.API/app/domain/extended_models.py`
  Defines higher-level entities for `Library`, `Institution`, `CorporateClub`, `CommunityGroup`, and `Marketplace`.
- `src/Bookmate.API/app/domain/exceptions.py`
  Holds custom exceptions like `BookNotFound`, `UserNotFound`, and `UserAlreadyExists` that routes/services use for clean error handling.

### DTOs and use cases

- `src/Bookmate.API/app/application/dtos.py`
  Defines request/response DTOs used in the book use-case layer.
- `src/Bookmate.API/app/application/Mappers/book_dto_mapper.py`
  Converts domain `Book` objects to DTOs.
- `src/Bookmate.API/app/application/usecases/create_book.py`
  Creates a new domain book and persists it.
- `src/Bookmate.API/app/application/usecases/list_books.py`
  Reads all books and maps them to DTOs.
- `src/Bookmate.API/app/application/usecases/Update_book.py`
  Replaces a book with updated values.
- `src/Bookmate.API/app/application/usecases/Partial_update_book.py`
  Intended for patch-style book updates.
- `src/Bookmate.API/app/application/usecases/Delete_book.py`
  Intended for book deletion.
- `src/Bookmate.API/app/application/usecases/library.py`
  Encapsulates library-related operations.
- `src/Bookmate.API/app/application/usecases/institution.py`
  Encapsulates institution-related operations.
- `src/Bookmate.API/app/application/usecases/corporate_club.py`
  Encapsulates corporate club-related operations.
- `src/Bookmate.API/app/application/usecases/community_group.py`
  Encapsulates community-group-related operations.
- `src/Bookmate.API/app/application/usecases/marketplace.py`
  Encapsulates marketplace-related operations.
- `src/Bookmate.API/app/application/usecases/__init__.py`
  Re-exports use-case types for convenience.

### Service layer

- `src/Bookmate.API/app/application/services/auth_service.py`
  Handles user registration, password hashing, login verification, and JWT token creation.
- `src/Bookmate.API/app/application/services/auth_dependency.py`
  Implements `get_current_user`, which decodes the JWT and fetches the current user from the repository.
- `src/Bookmate.API/app/application/services/book_service.py`
  An older service abstraction for CRUD operations on books. The current routes use repositories/use cases more directly.
- `src/Bookmate.API/app/application/services/user_preference_service.py`
  Older abstraction for preference operations.
- `src/Bookmate.API/app/application/services/library_service.py`
  Core logic for adding books to a user library, filtering by status, updating status, and removing items.
- `src/Bookmate.API/app/application/services/institution_service.py`
  Service wrapper for institution logic.
- `src/Bookmate.API/app/application/services/corporate_club_service.py`
  Service wrapper for club logic.
- `src/Bookmate.API/app/application/services/community_group_service.py`
  Service wrapper for public group logic.
- `src/Bookmate.API/app/application/services/marketplace_service.py`
  Service wrapper for marketplace logic.
- `src/Bookmate.API/app/application/services/ai_chat_service.py`
  Calls the OpenAI Responses API through a shared client. If `OPENAI_API_KEY` is missing, it returns a helpful fallback string instead of failing hard.

### Infrastructure layer

#### ORM models
- `src/Bookmate.API/app/infrastructure/Mappers/book_orm.py`
  SQLModel table for books.
- `src/Bookmate.API/app/infrastructure/Mappers/user_orm.py`
  SQLModel tables for users, preferences, and interactions.
- `src/Bookmate.API/app/infrastructure/Mappers/extended_orm.py`
  SQLModel tables for library entries, institutions, corporate clubs, community groups, and marketplace listings.
- `src/Bookmate.API/app/infrastructure/Mappers/extended_book_orm.py`
  Extra book-related ORM definitions kept in the repo for older/alternate modeling work.

#### Mappers
- `src/Bookmate.API/app/infrastructure/Mappers/book_mapper.py`
  Converts between book DTOs, domain objects, and `BookORM` rows.
- `src/Bookmate.API/app/infrastructure/Mappers/user_mapper.py`
  Converts between user domain models and user ORM tables.

#### Repositories
- `src/Bookmate.API/app/infrastructure/repositories/interfaces.py`
  Declares repository protocols used by use cases.
- `src/Bookmate.API/app/infrastructure/repositories/book_repo.py`
  Implements create/read/update/delete for books with async SQLModel access.
- `src/Bookmate.API/app/infrastructure/repositories/user_repo.py`
  Implements user lookup plus preference and interaction persistence.

#### External integration and sample data
- `src/Bookmate.API/app/infrastructure/external/openai_client.py`
  Creates one reusable OpenAI client instance.
- `src/Bookmate.API/app/infrastructure/sample_data.py`
  Additional sample data helpers kept in the repo.
- `src/Bookmate.API/app/infrastructure/seed/seed_data.py`
  Seeds demo users, books, preferences, interactions, library rows, marketplace rows, institutions, clubs, and community groups. Also tracks whether sample data is already loaded.

### API routes

- `src/Bookmate.API/app/interfaces/schemas.py`
  Shared Pydantic request/response schemas for books, auth, preferences, interactions, institutions, clubs, groups, marketplace items, and library entries.
- `src/Bookmate.API/app/interfaces/api_v1/books.py`
  Endpoints for:
  - `POST /api/books`
  - `GET /api/books`
  - `GET /api/books/{id}`
  - `PUT /api/books/{id}`
  - `PATCH /api/books/{id}`
  - `DELETE /api/books/{id}`
  - `POST /api/books/bulk`
  - `GET /api/books/available` for books the current user has not interacted with yet
- `src/Bookmate.API/app/interfaces/api_v1/users.py`
  Registration/login plus preference and interaction endpoints.
- `src/Bookmate.API/app/interfaces/api_v1/libraries.py`
  User library endpoints to list, add, change status, and remove library items.
- `src/Bookmate.API/app/interfaces/api_v1/institutions.py`
  CRUD-style endpoints for institutions.
- `src/Bookmate.API/app/interfaces/api_v1/corporate_clubs.py`
  CRUD-style endpoints for corporate clubs.
- `src/Bookmate.API/app/interfaces/api_v1/community_groups.py`
  CRUD-style endpoints for community groups.
- `src/Bookmate.API/app/interfaces/api_v1/marketplaces.py`
  CRUD-style endpoints for marketplace items.
- `src/Bookmate.API/app/interfaces/api_v1/ai.py`
  `POST /api/ai/chat` endpoint for the AI assistant.

### Migrations, tests, and backend utility files

- `src/Bookmate.API/alembic.ini`
  Alembic configuration.
- `src/Bookmate.API/alembic/env.py`
  Alembic environment setup. It targets SQLModel metadata, though the file currently mixes async and sync patterns and may need cleanup before heavy migration work.
- `src/Bookmate.API/alembic/script.py.mako`
  Template used when generating new migrations.
- `src/Bookmate.API/alembic/versions/*.py`
  Migration history for user preferences, sample-data tracking, and the extra entity tables.
- `src/Bookmate.API/tests/test_books.py`
  Basic async API test for creating and listing books. It looks outdated because the test payload omits required fields such as `language`.
- `src/Bookmate.API/check_table.py`
  Local helper script for inspecting tables.
- `src/Bookmate.API/test_db.py`
  Local helper script for validating DB connectivity.
- `src/Bookmate.API/requirements.txt`
  Python dependencies.
- `src/Bookmate.API/.env`
  Local backend environment file.
- `src/Bookmate.API/README.md`
  Backend-specific README.
- `src/Bookmate.API/.gitignore`
  Ignores backend-generated artifacts.
- `src/Bookmate.API/.vscode/launch.json`
  VS Code debug profile.
- `src/Bookmate.API/.vscode/settings.json`
  VS Code workspace settings for the backend.
- `src/Bookmate.API/structure.txt`
  Generated structure snapshot of the backend tree.

### Legacy or duplicate backend folders

These folders are present but appear to be older iterations rather than the main active flow used by `app/main.py` and the route layer:

- `src/Bookmate.API/app/features/books/controllers/books_controller.py`
- `src/Bookmate.API/app/features/books/usecases/*`
- `src/Bookmate.API/app/features/users/services/*`

They mirror concepts already implemented in `app/interfaces`, `app/application`, and `app/infrastructure`.

## Frontend walkthrough

### Bootstrap and routing

- `src/Bookmate.UI/src/main.tsx`
  React entry point.
- `src/Bookmate.UI/src/App.tsx`
  Declares all routes, wraps the app with `AuthProvider`, and implements `PrivateRoute` / `PublicRoute` behavior.
- `src/Bookmate.UI/src/context/AuthContext.tsx`
  Stores the JWT and current user in React state plus local storage. Exposes `login`, `register`, and `logout` to the rest of the app.

### Shared API layer

- `src/Bookmate.UI/src/services/api.ts`
  Main frontend API client. It centralizes base URL handling, headers, request parsing, types, and all endpoint wrappers for auth, books, preferences, interactions, library, AI, institutions, clubs, groups, and marketplace.
- `src/Bookmate.UI/src/Api/Books.ts`
  Older standalone books API helper. Much of this overlaps with `services/api.ts`.
- `src/Bookmate.UI/src/Api/auth.ts`
  Older standalone auth/preference/interaction helper.
- `src/Bookmate.UI/src/Api/aiChat.ts`
  Thin helper used by the chatbot UI.
- `src/Bookmate.UI/src/Api/wishlist.ts`
  Wishlist-specific API helper from an older approach.

### Layout and shared components

- `src/Bookmate.UI/src/Componants/layout.tsx`
  Shared shell that renders the navbar, sidebar, chatbot, and current page.
- `src/Bookmate.UI/src/Componants/Navbar.tsx`
  Top navigation with search box, user email, section links, and logout.
- `src/Bookmate.UI/src/Componants/sidebar.tsx`
  Left navigation rail for the main feature areas.
- `src/Bookmate.UI/src/Componants/BookCard.tsx`
  Reusable book summary card used across home, wishlist, library, and recommendations.
- `src/Bookmate.UI/src/Componants/BookDetail.tsx`
  Fetches one book by id and renders the details page.
- `src/Bookmate.UI/src/Componants/updatebook.tsx`
  Drawer/modal used to edit an existing book.
- `src/Bookmate.UI/src/Componants/BookForm.tsx`
  Reusable form component kept in the repo from an earlier UI iteration.
- `src/Bookmate.UI/src/Componants/login.tsx`
  Older login component version.
- `src/Bookmate.UI/src/Componants/signup.tsx`
  Older signup component version.

### Chatbot components

- `src/Bookmate.UI/src/Componants/ChatBot/Chatbot.tsx`
  Controls whether the floating chatbot button or the chat window is shown.
- `src/Bookmate.UI/src/Componants/ChatBot/ChatbotButton.tsx`
  Floating launcher button.
- `src/Bookmate.UI/src/Componants/ChatBot/ChatbotWindow.tsx`
  Manages chat messages, suggestions, loading state, and calls `sendChatMessage()`.
- `src/Bookmate.UI/src/Componants/ChatBot/ChatMessage.tsx`
  Renders one chat bubble.

### Page-by-page logic

- `src/Bookmate.UI/src/Pages/Home.tsx`
  Main dashboard. Loads all books, summarizes library/preferences/interactions, supports search and language filtering, opens the edit drawer, deletes books, and lets the user add books to the library or wishlist.
- `src/Bookmate.UI/src/Pages/AddBook.tsx`
  Form for creating a new book.
- `src/Bookmate.UI/src/Pages/Library.tsx`
  Lists user library items, filters them by status, adds books to the library, updates statuses, and removes entries.
- `src/Bookmate.UI/src/Pages/Wishlist.tsx`
  Reads library items filtered to `wishlist`, joins them to book details, and allows moving items into `reading` or removing them.
- `src/Bookmate.UI/src/Pages/Preferences.tsx`
  Loads saved preferences and available books, then creates new preference entries.
- `src/Bookmate.UI/src/Pages/Interactions.tsx`
  Lets the user log reading actions and view interaction history.
- `src/Bookmate.UI/src/Pages/Recommendations.tsx`
  Builds client-side recommendations by combining available books, preferences, and interactions. Matching a preferred author gives a higher score.
- `src/Bookmate.UI/src/Pages/Marketplace.tsx`
  Lists marketplace entries and creates new listings tied to the current user.
- `src/Bookmate.UI/src/Pages/Institution.tsx`
  Lists institutions, filters by type, and creates new institutions.
- `src/Bookmate.UI/src/Pages/Club.tsx`
  Lists corporate clubs and creates new club records using the authenticated user as admin.
- `src/Bookmate.UI/src/Pages/Community.tsx`
  Lists community groups and creates new ones using the authenticated user as creator.
- `src/Bookmate.UI/src/Pages/Login.tsx`
  Auth page for signing in.
- `src/Bookmate.UI/src/Pages/Register.tsx`
  Auth page for creating an account.
- `src/Bookmate.UI/src/Pages/UserGuide.tsx`
  End-user onboarding guide inside the app, with links to the API docs.
- `src/Bookmate.UI/src/Pages/deletebook.tsx`
  Older delete-book page/component kept from an earlier approach.

### Types, data, styles, and assets

- `src/Bookmate.UI/src/Types/Book.ts`
  Type definitions for books used in older UI code.
- `src/Bookmate.UI/src/Data/books.ts`
  Static data source from an earlier mock-data phase.
- `src/Bookmate.UI/src/App.css`, `src/Bookmate.UI/src/index.css`
  Global styling.
- `src/Bookmate.UI/src/css/*.css`
  Feature-specific styles for auth, navbar, sidebar, chatbot, homepage, preferences, interactions, wishlist, update drawer, and other views.
- `src/Bookmate.UI/src/assets/*`
  Logo, welcome images, banner image, and the default Vite asset.
- `src/Bookmate.UI/src/vite-env.d.ts`
  Vite TypeScript environment typing.

### UI project config files

- `src/Bookmate.UI/package.json`
  Frontend dependencies and scripts.
- `src/Bookmate.UI/package-lock.json`
  Frontend lockfile.
- `src/Bookmate.UI/vite.config.ts`
  Vite config for the UI app.
- `src/Bookmate.UI/eslint.config.js`
  ESLint setup.
- `src/Bookmate.UI/index.html`
  Vite HTML shell.
- `src/Bookmate.UI/tsconfig.json`
  Base TypeScript config.
- `src/Bookmate.UI/tsconfig.app.json`
  App-specific TS config.
- `src/Bookmate.UI/tsconfig.node.json`
  Node/Vite TS config.
- `src/Bookmate.UI/README.md`
  UI-specific README.
- `src/Bookmate.UI/.gitignore`
  Frontend ignore rules.
- `src/Bookmate.UI/public/vite.svg`
  Default Vite public asset.

## Root-level files

- `.github/workflows/deploy.yml`
  GitHub Actions workflow that installs UI dependencies, builds the frontend, and deploys `src/Bookmate.UI/dist` to GitHub Pages.
- `.gitignore`
  Global ignore rules.
- `Bookmate.postman_collection.json`
  Postman collection for exercising the backend APIs.
- `package.json`
  Minimal root Node package manifest. The main frontend app still lives in `src/Bookmate.UI`.
- `package-lock.json`
  Root lockfile for the minimal root package.
- `vite.config.ts`
  Root Vite config pointing to `/Bookmate/src/Bookmate.UI/`. This appears related to GitHub Pages/static hosting rather than local development of the UI app.
- `structure.txt`
  Generated repository structure snapshot.
- `readme.md`
  This project-level guide.

## Main API surface

### Auth
- `POST /api/users/register`
- `POST /api/users/login`

### Books
- `POST /api/books`
- `GET /api/books`
- `GET /api/books/{book_id}`
- `PUT /api/books/{book_id}`
- `PATCH /api/books/{book_id}`
- `DELETE /api/books/{book_id}`
- `POST /api/books/bulk`
- `GET /api/books/available`

### User profile data
- `GET /api/users/preferences`
- `POST /api/users/preferences`
- `GET /api/interactions`
- `POST /api/interactions`

### Library
- `GET /api/library/`
- `POST /api/library/`
- `PATCH /api/library/{library_id}/status`
- `DELETE /api/library/{library_id}`

### Community and marketplace
- `GET/POST /institutions`
- `GET/PUT/DELETE /institutions/{id}`
- `GET/POST /corporate-clubs`
- `GET/PUT/DELETE /corporate-clubs/{id}`
- `GET/POST /community-groups`
- `GET/PUT/DELETE /community-groups/{id}`
- `GET/POST /marketplaces`
- `GET/PUT/DELETE /marketplaces/{id}`

### AI
- `POST /api/ai/chat`

## How to run the project

### Backend

```bash
cd src/Bookmate.API
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend default URL:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

Optional backend `.env` values:

```env
DATABASE_URL=sqlite+aiosqlite:///./bookmate.db
APP_NAME=BookMate
DEBUG=True
OPENAI_API_KEY=
JWT_SECRET_KEY=supersecretbookmate
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENABLE_SAMPLE_DATA=False
```

If you want demo data on startup, set:

```env
ENABLE_SAMPLE_DATA=True
```

### Frontend

```bash
cd src/Bookmate.UI
npm install
npm run dev
```

Optional UI environment:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The frontend expects the backend to be running.

## Important code logic and behavior notes

- Authentication uses JWT Bearer tokens. The frontend stores the token and user in local storage.
- The `books/available` endpoint excludes books the current user has already interacted with.
- Recommendations are currently client-side heuristics, not AI-generated recommendations.
- AI chat is optional. Without `OPENAI_API_KEY`, the backend returns a fallback message instead of failing.
- Sample/demo data is seeded only if `ENABLE_SAMPLE_DATA=True` and the tracking table shows data has not already been loaded.
- The repo contains duplicate or older files in both backend and frontend folders. The main active flows are the FastAPI routes under `app/interfaces/api_v1` and the React code under `src/Bookmate.UI/src/Pages`, `src/Bookmate.UI/src/Componants`, and `src/Bookmate.UI/src/services/api.ts`.

## Current strengths

- Clear split between backend and frontend apps.
- Good breadth of features for a learning/full-stack project.
- JWT auth and OpenAI integration are already wired.
- Frontend pages are aligned closely with backend endpoints.
- The project includes API docs, Postman collection, seeding, and deployment workflow.

## Current rough edges

- Several legacy/duplicate files remain in the repo, which makes the structure look larger than the truly active code path.
- Some text files/components contain encoding artifacts from copied emoji/symbol characters.
- The backend test file is outdated relative to the current request schema.
- Alembic setup likely needs cleanup before relying on migrations heavily.
- Root-level Node/Vite config and UI-level Node/Vite config overlap and can be confusing for a new contributor.

## Best mental model for this project

Think of Bookmate as two cooperating applications:

- The backend is the source of truth for data, auth, and business operations.
- The frontend is a dashboard that composes those APIs into a smooth reading-management experience.

If you are learning from this repo, start in this order:

1. `src/Bookmate.API/app/main.py`
2. `src/Bookmate.API/app/interfaces/api_v1`
3. `src/Bookmate.API/app/infrastructure/repositories`
4. `src/Bookmate.API/app/infrastructure/Mappers`
5. `src/Bookmate.UI/src/App.tsx`
6. `src/Bookmate.UI/src/services/api.ts`
7. `src/Bookmate.UI/src/Pages/Home.tsx`
8. Then the rest of the UI pages.

That path gives the clearest picture of how requests move through the system.
