# MovieCompass 🎬

> A modern, AI-powered movie discovery platform that helps you find your next favorite film through personalized recommendations, and comprehensive movie management.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.5-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

MovieCompass is a full-stack movie discovery platform that leverages AI to provide personalized movie recommendations. Built with modern web technologies, it offers an intuitive interface for discovering, managing, and rating movies from The Movie Database (TMDB).

[![Watch the MovieCompass demo on YouTube](https://img.youtube.com/vi/TGv8HDpFMIg/0.jpg)](https://www.youtube.com/watch?v=TGv8HDpFMIg)

> Click the thumbnail (or the link) to watch a full walkthrough of all features in action.

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│◄──► │  FastAPI Backend│◄──►│   MongoDB Atlas │
│   (TypeScript)  │     │    (Python)     │    │   (Database)    │
└─────────────────┘     └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│  Ollama/Mistral │◄─────────────┘
                        │ (AI/LLM Service)│
                        └─────────────────┘
```

**Key Design Principles:**

- **Microservices Architecture**: Separate frontend, backend, and AI services
- **Real-time Data**: Live movie data from TMDB API with intelligent caching
- **AI-Powered**: Personalized recommendations using local LLM (Mistral via Ollama)
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Secure Authentication**: JWT tokens with Google OAuth2 integration

## Features

### 🎯 Core Features

- **AI Smart Recommendations** - Personalized movie suggestions based on your preferences
- **Advanced Filtering** - Find movies by genre, rating, year, and more
- **User Profile Management** - Watchlist, favorites, ratings, and profile customization
- **Movie Details** - Comprehensive information including trailers, cast, and reviews
- **Real-time Updates** - Live data synchronization with TMDB

### 🔐 Authentication & Security

- **JWT Authentication** - Secure token-based authentication
- **Google OAuth2** - Sign in with Google integration
- **Email Verification** - Account verification and password reset
- **Protected Routes** - Role-based access control

### 🎨 User Experience

- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Theme** - Modern dark UI with smooth animations
- **Infinite Scroll** - Smooth browsing experience with pagination
- **Loading States** - Comprehensive loading and error handling
- **Toast Notifications** - Real-time feedback for user actions

### 🛠️ Developer Features

- **Docker Containerization** - Easy deployment and development setup
- **API Documentation** - Auto-generated Swagger/OpenAPI docs
- **Type Safety** - Full TypeScript coverage on frontend
- **Error Handling** - Comprehensive error management across the stack
- **Code Organization** - Clean architecture with separation of concerns

## Tech Stack

### Frontend

- **React 18.3.1** - Modern React with Hooks and Context
- **TypeScript 5.6.2** - Type-safe development
- **Vite 5.4.10** - Fast build tool and dev server
- **Tailwind CSS 3.4.14** - Utility-first CSS framework
- **Framer Motion 11.11.17** - Smooth animations and transitions
- **React Router 6.28.0** - Client-side routing
- **Shadcn/ui** - Beautiful, accessible UI components built on Radix UI
- **Radix UI** - Accessible component primitives (via Shadcn/ui)

### Backend

- **FastAPI 0.115.5** - Modern Python web framework
- **Python 3.12+** - Latest Python features
- **Pydantic 2.10.3** - Data validation and settings management
- **PyJWT 2.10.1** - JSON Web Token implementation
- **Httpx 0.28.1** - Modern HTTP client
- **Passlib 1.7.4** - Password hashing utilities

### Database & External Services

- **MongoDB Atlas** - Cloud-hosted MongoDB database service
- **TMDB API** - The Movie Database for movie data
- **Ollama + Mistral 7B** - Local LLM for AI recommendations
- **Gmail SMTP** - Email service for notifications

### DevOps & Tools

- **Docker & Docker Compose** - Containerization and orchestration
- **Uvicorn** - ASGI server for FastAPI
- **ESLint & Prettier** - Code linting and formatting
- **Git** - Version control

## Project Structure

```
MovieCompass/
├── backend
│   ├── app
│   │   ├── api
│   │   │   ├── endpoints
│   │   │   │   ├── auth.py
│   │   │   │   ├── movies.py
│   │   │   │   └── users.py
│   │   │   ├── __init__.py
│   │   │   └── dependencies.py
│   │   ├── core
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── schemas
│   │   │   ├── email.py
│   │   │   ├── genre.py
│   │   │   ├── movie.py
│   │   │   ├── rating.py
│   │   │   ├── user.py
│   │   │   └── validator.py
│   │   ├── services
│   │   │   ├── auth.py
│   │   │   ├── email.py
│   │   │   ├── ollama_recommender.py
│   │   │   ├── scheduler.py
│   │   │   ├── security.py
│   │   │   ├── tmdb.py
│   │   │   ├── tmdb_constants.py
│   │   │   └── user.py
│   │   ├── utils
│   │   │   ├── __init__.py
│   │   │   └── app_instance.py
│   │   ├── __init__.py
│   │   ├── exceptions.py
│   │   └── main.py
│   ├── tests
│   │   ├── endpoints
│   │   │   ├── test_auth.py
│   │   │   ├── test_movies.py
│   │   │   └── tests_users.py
│   │   ├── integration
│   │   │   ├── conftest.py
│   │   │   ├── test_auth_flow.py
│   │   │   ├── test_email_service_integration.py
│   │   │   ├── test_email_verification_flow.py
│   │   │   ├── test_movie_discovery.py
│   │   │   ├── test_movie_favorites.py
│   │   │   ├── test_password_reset.py
│   │   │   ├── test_profile_management.py
│   │   │   ├── test_tmdb_integration.py
│   │   │   ├── test_token_expiration.py
│   │   │   └── test_watchlist_ratings.py
│   │   ├── services
│   │   │   ├── test_auth_service.py
│   │   │   ├── test_email_service.py
│   │   │   ├── test_recommender_service.py
│   │   │   ├── test_scheduler_service.py
│   │   │   ├── test_security_service.py
│   │   │   ├── test_tmdb_service.py
│   │   │   └── test_user_service.py
│   │   └── __init__.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend
│   ├── public
│   │   ├── icons
│   │   │   └── app_icon.png
│   │   ├── posters
│   │   │   ├── banger_movie.png
│   │   │   ├── captain_america_movie.png
│   │   │   └── the_quite_ones_movie.png
│   │   └── videos
│   │       └── family_animation_video.mp4
│   ├── src
│   │   ├── api
│   │   │   ├── authFetch.ts
│   │   │   └── logoutRegistry.ts
│   │   ├── assets
│   │   ├── components
│   │   │   ├── about
│   │   │   │   ├── AboutContent.tsx
│   │   │   │   ├── AboutHeader.tsx
│   │   │   │   ├── AboutMission.tsx
│   │   │   │   └── AboutTMDBIntegration.tsx
│   │   │   ├── auth
│   │   │   │   ├── AuthFooter.tsx
│   │   │   │   ├── AuthForm.tsx
│   │   │   │   ├── AuthFormCard.tsx
│   │   │   │   ├── AuthFormFields.tsx
│   │   │   │   ├── AuthFormTitle.tsx
│   │   │   │   ├── AuthHeader.tsx
│   │   │   │   ├── AuthMobileHeader.tsx
│   │   │   │   ├── AuthModeToggle.tsx
│   │   │   │   ├── AuthSidebar.tsx
│   │   │   │   ├── AuthSubmitButton.tsx
│   │   │   │   ├── AuthVerificationAlert.tsx
│   │   │   │   ├── GoogleAuthButton.tsx
│   │   │   │   ├── GoogleCallbackHandler.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── common
│   │   │   │   ├── CategoryFilterPanel.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   ├── GlobalMessages.tsx
│   │   │   │   ├── LegalModal.tsx
│   │   │   │   └── SignUpButton.tsx
│   │   │   ├── contact
│   │   │   │   ├── ContactCTA.tsx
│   │   │   │   └── ContactHeader.tsx
│   │   │   ├── dashboard
│   │   │   │   ├── movie_modal
│   │   │   │   │   ├── MovieCastList.tsx
│   │   │   │   │   ├── MovieDetailModal.tsx
│   │   │   │   │   ├── MovieRating.tsx
│   │   │   │   │   └── MovieReviewsList.tsx
│   │   │   │   ├── AIRecommendationsResultsProps .tsx
│   │   │   │   ├── CategoryResults.tsx
│   │   │   │   ├── CategorySidebar.tsx
│   │   │   │   ├── LogoComponent.tsx
│   │   │   │   ├── MovieCard.tsx
│   │   │   │   ├── MoviePlaceholder.tsx
│   │   │   │   ├── MovieRoller.tsx
│   │   │   │   ├── UserAvatar.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   ├── favorites
│   │   │   │   └── FavoriteMovieCard.tsx
│   │   │   ├── features
│   │   │   │   ├── FeatureCard.tsx
│   │   │   │   └── FeaturesHeader.tsx
│   │   │   ├── hero
│   │   │   │   ├── CinemaVideo.tsx
│   │   │   │   └── HeroCTA.tsx
│   │   │   ├── home
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   ├── AuthFormSection.tsx
│   │   │   │   ├── ContactSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   └── HeroSection.tsx
│   │   │   ├── layout
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── navigation
│   │   │   │   └── Navbar.tsx
│   │   │   ├── profile
│   │   │   │   ├── AccountInfoSection.tsx
│   │   │   │   ├── BasicInfoSection.tsx
│   │   │   │   └── PasswordSection.tsx
│   │   │   ├── ratings
│   │   │   │   └── RatingsMovieCard.tsx
│   │   │   ├── search
│   │   │   │   ├── SearchNavbar.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── ui
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   └── slider.tsx
│   │   │   └── watchlist
│   │   │       └── WatchlistMovieCard.tsx
│   │   ├── contexts
│   │   │   ├── AuthContext.tsx
│   │   │   ├── MessageContext.tsx
│   │   │   ├── MovieModalContext.tsx
│   │   │   ├── MoviesContext.tsx
│   │   │   └── UserContext.tsx
│   │   ├── data
│   │   │   ├── constants.ts
│   │   │   ├── features.ts
│   │   │   └── legalContent.tsx
│   │   ├── hooks
│   │   │   ├── useAuthContent.ts
│   │   │   ├── useAuthMode.ts
│   │   │   ├── useAuthSubmit.ts
│   │   │   ├── useFetchOnView.tsx
│   │   │   ├── useInfiniteScroll.tsx
│   │   │   └── useProfileForm.tsx
│   │   ├── lib
│   │   │   └── utils.ts
│   │   ├── pages
│   │   │   ├── AuthPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── EmailVerificationPage.tsx
│   │   │   ├── FavoritesPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── RatingsPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── UserProfilePage.tsx
│   │   │   └── WatchlistPage.tsx
│   │   ├── types
│   │   │   ├── auth.ts
│   │   │   ├── message.ts
│   │   │   ├── movie_modal.ts
│   │   │   ├── movies.ts
│   │   │   └── user.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── Dockerfile
│   ├── README.md
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── ollama
│   ├── Dockerfile
│   ├── __init__.py
│   └── entrypoint.sh
├── README.md
├── docker-compose.yml
└── package-lock.json
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Git** for cloning the repository
- **TMDB API Key** - Get one free from [The Movie Database](https://www.themoviedb.org/settings/api)
- **Google OAuth Credentials** - Set up at [Google Cloud Console](https://console.cloud.google.com/)
- **Gmail App Password** - For email notifications (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/DvirKakun/MovieCompass.git
   cd MovieCompass
   ```

2. **Create environment files**

   ```bash
   # Create backend environment file
   cp backend/.env.example backend/.env

   # Create frontend environment file
   cp frontend/.env.example frontend/.env
   ```

### Environment Setup

#### Backend Environment (`backend/.env`)

```bash
# TMDB API Configuration
TMDB_API_KEY="your_tmdb_api_key_here"
BASE_URL="https://api.themoviedb.org/3"

# Security Configuration
SECRET_KEY="your_secret_key_here_64_characters_minimum"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMAIL_ACCESS_TOKEN_EXPIRE_HOURS=1

# Database Configuration
# Option 1: Use MongoDB Atlas (Recommended)
MONGO_CONNECTION_STRING="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"

# Option 2: Use Local MongoDB Container
MONGO_CONNECTION_STRING="mongodb://mongo:27017"

MONGO_DATABASE_NAME="movie_compass_database"
MONGO_COLLECTION_NAME="Users"

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
GOOGLE_REDIRECT_URI="http://localhost:8000/auth/google/callback"
GOOGLE_AUTHORIZATION_ENDPOINT="https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT="https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT="https://www.googleapis.com/oauth2/v3/userinfo"

# Application URLs
FRONTEND_URL="http://localhost:5173"

# Email Configuration (Optional - for notifications)
EMAIL_FROM="your_email@gmail.com"
EMAIL_USERNAME="your_email@gmail.com"
EMAIL_PASSWORD="your_gmail_app_password"
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587

# AI/LLM Configuration
MODEL_ID="mistral:latest"
OLLAMA_SERVER_ENDPOINT="http://ollama:11434/v1"
```

#### Frontend Environment (`frontend/.env`)

```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:8000
VITE_TORRENTS_URL=http://localhost:8009
```

#### Environment Variables Guide

| Variable                  | Required    | Description                | How to Obtain                                                            |
| ------------------------- | ----------- | -------------------------- | ------------------------------------------------------------------------ |
| `TMDB_API_KEY`            | ✅ Yes      | API key for movie data     | [Get free API key](https://www.themoviedb.org/settings/api)              |
| `SECRET_KEY`              | ✅ Yes      | JWT signing secret         | Generate: `openssl rand -hex 32`                                         |
| `MONGO_CONNECTION_STRING` | ✅ Yes      | MongoDB connection         | [MongoDB Atlas](https://www.mongodb.com/atlas) or local container        |
| `GOOGLE_CLIENT_ID`        | ⚠️ OAuth    | Google OAuth client ID     | [Google Cloud Console](https://console.cloud.google.com/)                |
| `GOOGLE_CLIENT_SECRET`    | ⚠️ OAuth    | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com/)                |
| `EMAIL_PASSWORD`          | 🔧 Optional | Gmail app password         | [Gmail App Passwords](https://support.google.com/accounts/answer/185833) |

## Running the Application

### **1. MongoDB Setup (Required)**

Since this project uses **MongoDB Atlas**, you need to:

- Create a MongoDB Atlas account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get your connection string
- Add the connection string to your `backend/.env` file as `MONGO_CONNECTION_STRING`

**Note**: The docker-compose setup does **NOT** include a local MongoDB container. You must use MongoDB Atlas or set up your own MongoDB container separately.

### **2. Start all services**

```bash
docker-compose up --build
```

### **3. Wait for Ollama Model Download**

**Important**: After running `docker-compose up --build`, the Ollama container will start but the **Mistral model needs to be downloaded**. This process can take several minutes depending on your internet connection.

You can monitor the download progress by checking the Ollama container logs:

```bash
docker logs ollama -f
```

The **AI recommendations feature will not work** until the Mistral model is fully downloaded and available.

### **4. Access the application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

The application will automatically:

- Build and start the React frontend on port 5173
- Launch the FastAPI backend on port 8000
- Initialize Ollama container and begin downloading Mistral model for AI recommendations
- Configure all necessary services and dependencies

**Note**: MongoDB is not included in the docker-compose setup. You must configure your own MongoDB Atlas connection or local MongoDB instance.

## API Documentation

### **Authentication Endpoints**

| Method | Endpoint                    | Description                 | Auth Required |
| ------ | --------------------------- | --------------------------- | ------------- |
| `POST` | `/auth/signup`              | Create new user account     | ❌            |
| `POST` | `/auth/token`               | Login with credentials      | ❌            |
| `GET`  | `/auth/google/login`        | Initiate Google OAuth       | ❌            |
| `GET`  | `/auth/google/callback`     | Google OAuth callback       | ❌            |
| `POST` | `/auth/forgot-password`     | Request password reset      | ❌            |
| `POST` | `/auth/reset-password`      | Reset password with token   | ❌            |
| `GET`  | `/auth/verify-email`        | Verify email address        | ❌            |
| `POST` | `/auth/resend-verification` | Resend email verification   | ❌            |
| `GET`  | `/auth/verify-reset-token`  | Verify password reset token | ❌            |

### **User Management**

| Method   | Endpoint                         | Description              | Auth Required |
| -------- | -------------------------------- | ------------------------ | ------------- |
| `GET`    | `/users/me`                      | Get current user profile | ✅            |
| `PATCH`  | `/users/me`                      | Update user profile      | ✅            |
| `PUT`    | `/users/me/watchlist/{movie_id}` | Add to watchlist         | ✅            |
| `DELETE` | `/users/me/watchlist/{movie_id}` | Remove from watchlist    | ✅            |
| `PUT`    | `/users/me/favorite/{movie_id}`  | Add to favorites         | ✅            |
| `DELETE` | `/users/me/favorite/{movie_id}`  | Remove from favorites    | ✅            |
| `PUT`    | `/users/me/rating/{movie_id}`    | Rate a movie             | ✅            |
| `DELETE` | `/users/me/rating/{movie_id}`    | Remove rating            | ✅            |
| `POST`   | `/users/me/recommendations`      | Get AI recommendations   | ✅            |

### **Movie Data**

| Method | Endpoint                     | Description          | Auth Required |
| ------ | ---------------------------- | -------------------- | ------------- |
| `GET`  | `/movies/genres`             | Get all movie genres | ❌            |
| `GET`  | `/movies/popular`            | Get popular movies   | ❌            |
| `GET`  | `/movies/genre/{genre_id}`   | Get movies by genre  | ❌            |
| `GET`  | `/movies/search`             | Search movies        | ❌            |
| `GET`  | `/movies/`                   | Get movies by IDs    | ❌            |
| `GET`  | `/movies/{movie_id}/cast`    | Get movie cast       | ❌            |
| `GET`  | `/movies/{movie_id}/reviews` | Get movie reviews    | ❌            |
| `GET`  | `/movies/{movie_id}/trailer` | Get movie trailer    | ❌            |

### Example API Usage

```bash
# Get popular movies
curl "http://localhost:8000/movies/popular?page=1"

# Search for movies
curl "http://localhost:8000/movies/search?query=inception&page=1"

# Get movie details
curl "http://localhost:8000/movies/550"

# Login (get access token)
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=yourpassword"

# Get user profile (authenticated)
curl "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Add movie to watchlist
curl -X PUT "http://localhost:8000/users/me/watchlist/550" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Usage Guide

### 1. User Registration & Authentication

1. **Sign Up**: Create an account with email and password
2. **Email Verification**: Check your email and click the verification link
3. **Login**: Access your account with credentials or Google OAuth

### 2. Discovering Movies

- **Browse Popular**: Explore trending and popular movies
- **Search**: Find specific movies
- **Filter**: Use advanced filters for rating, year, and genre
- **Categories**: Browse by specific movie genres

### 3. Managing Your Collection

- **Watchlist**: Save movies to watch later
- **Favorites**: Mark movies you love
- **Ratings**: Rate movies you've watched (1-10 scale)
- **AI Recommendations**: Get personalized suggestions based on your preferences

### 4. Movie Details

- **Trailers**: Watch movie trailers when available
- **Cast Information**: See cast members and their roles
- **Reviews**: Read user reviews from TMDB
- **Ratings**: View IMDb ratings and community scores

### 5. AI Recommendations

The AI recommendation system analyzes your:

- Favorite movies
- Watchlist preferences
- Rating patterns

To get better recommendations:

1. Rate at least 5-10 movies
2. Add movies to your favorites
3. Use the watchlist feature
4. Click "Get AI Recommendations" in the browse menu

## Development

### Local Development Setup

1. **Frontend Development**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Development**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Database Setup (Local MongoDB)**
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:7.0
   ```

## Testing

The project includes **comprehensive backend testing** that runs automatically during the Docker build process. Tests are executed before the backend container starts using:

```bash
# Endpoint tests
RUN python -m pytest tests/endpoints/ -v --tb=short --disable-warnings || exit 1

# Service tests
RUN python -m pytest tests/services/ -v --tb=short --disable-warnings || exit 1

# Integration tests
RUN python -m pytest tests/integration/ -v --tb=short --disable-warnings || exit 1
```

**Note**: There are currently **no frontend tests** implemented. Only backend testing is available.

### **Running Tests Manually**

If you want to run tests manually during development:

```bash
# Navigate to backend directory
cd backend

# Run all tests
pytest

# Run specific test categories
pytest tests/endpoints/ -v
pytest tests/services/ -v
pytest tests/integration/ -v
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Project Maintainer**: Dvir Kakun

- Email: moviecompassservice@gmail.com
- GitHub: [DvirKakun](https://github.com/DvirKakun)
- Project Link: [https://github.com/DvirKakun/MovieCompass](https://github.com/DvirKakun/MovieCompass)

---

**Built with ❤️ using React, FastAPI, and MongoDB**

_MovieCompass - Your guide to discovering amazing movies_
