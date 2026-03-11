# Movidex - User Frontend

The React user-facing application for the Movidex movie platform. Browse movies, manage watchlists, write reviews, and rate films -- all wrapped in a cinematic glassmorphism UI.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [Routes & Pages](#routes--pages)
- [Components](#components)
- [Authentication Flow](#authentication-flow)
- [State Management](#state-management)
- [Styling & Design System](#styling--design-system)
- [API Communication](#api-communication)
- [Folder Structure](#folder-structure)

---

## Overview

This is the main user interface for Movidex, built with React 19 and React Router 6. It communicates with the `movidex-api` backend via REST API calls with JWT authentication.

**URL:** `http://localhost:3000`
**Requires:** `movidex-api` running on port 5000

### Key Features
- Cinematic glassmorphism login with video background
- User registration with strong password enforcement
- Movie browsing with real-time search, genre filter, and rating filter
- Personal watchlist (add/remove movies with one click)
- Movie detail pages with full description and average rating
- Review system (text + 1-5 star rating per movie)
- Auto-logout when JWT token expires

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.0 | Component-based UI framework |
| react-dom | 19.1.0 | DOM rendering for React components |
| react-router-dom | 6.22.3 | Client-side routing (SPA navigation without page reloads) |
| js-cookie | 3.0.5 | Read/write browser cookies for username and login status |
| react-scripts | 5.0.1 | Build tooling (webpack, babel, dev server, hot reload) |
| @testing-library/react | 16.3.0 | Unit testing utilities for React components |
| @testing-library/jest-dom | 6.6.3 | Custom matchers for DOM assertions |

Note: This frontend has **no backend packages** (no express, bcryptjs, or jsonwebtoken). All authentication is handled by the API.

---

## Getting Started

### Prerequisites
- Node.js 18+
- `movidex-api` running on port 5000

### Install & Run
```bash
cd movidex
npm install
npm start
```

Opens automatically at `http://localhost:3000`.

---

## How It Works

### Application Lifecycle

```
1. User visits http://localhost:3000
   |
   v
2. App.js checks sessionStorage for existing token
   |
   +-- No token? --> Show Login page (/)
   |
   +-- Has token? --> Fetch user's movies and watchlist from API
       |
       v
3. User navigates to /home (MoviesGrid)
   |
   v
4. MoviesGrid displays all movies with filters
   |
   v
5. User can:
   - Click a movie card --> /movie/:id (MovieDetail)
   - Click watchlist icon --> toggles movie in watchlist
   - Click "Watchlist" nav --> /watchlist page
   - Write review on movie detail page
   - Logout --> clears session, back to /
```

### What happens on every page load (App.js)

When the app mounts, `useEffect` in App.js runs:

1. Reads the JWT token from `sessionStorage`
2. Reads the username from cookies
3. If token exists:
   - `GET /api/movies` with the token --> stores all movies in state
   - `GET /api/users/:id/watchlist` with the token --> stores watchlist IDs in state
4. If any fetch returns 401:
   - Clears sessionStorage and cookies
   - Redirects to login page
5. If no token exists, user stays on login page

---

## Routes & Pages

Defined in `App.js` using React Router v6 `<Routes>`:

| Path | Component | Auth Required | Description |
|------|-----------|--------------|-------------|
| `/` | Loginpage | No | Cinematic login page with video background and glassmorphism card |
| `/register` | RegisterPage | No | Registration form with password strength requirements |
| `/home` | MoviesGrid | Yes | Movie grid with search, genre filter, and rating filter |
| `/movie/:id` | MovieDetail | Yes | Full movie page with description, reviews, and ratings |
| `/watchlist` | Watchlist | Yes | Personal watchlist showing all saved movies |
| `*` | 404 Message | No | "Page Not Found" for any unrecognized path |

### Layout System

The `Layout` component in App.js conditionally renders the `Header` and `Footer`:
- **Login (`/`) and Register (`/register`):** Header and Footer are HIDDEN (full-screen cinematic experience)
- **All other pages:** Header and Footer are visible

```jsx
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === '/' || location.pathname === '/register';
  return (
    <>
      {!hideLayout && <Header />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}
```

---

## Components

### Login/Loginpage.js

The login page with a cinematic glassmorphism design.

**Visual elements:**
- Full-screen looping video background (from `public/videos/`)
- Semi-transparent overlay on top of video
- Glassmorphism card with `backdrop-filter: blur(30px)`, purple glow (::before), gold glow (::after)
- Slide-in animation (`cardIn` keyframe)

**Functionality:**
1. User enters username and password
2. On submit, sends `POST /api/users/login` to the API
3. If successful:
   - Stores JWT token in `sessionStorage`
   - Stores user object (id, username, role) in `sessionStorage`
   - Sets cookies: `username` and `loggedIn=true` with `secure: true, sameSite: 'Strict'`
   - Redirects to `/home`
4. If failed:
   - Displays error message from API (e.g., "Invalid credentials")
5. Has a "Register" link for new users

### Register/RegisterPage.js

Registration form for new users.

**Functionality:**
1. User enters desired username and password
2. Sends `POST /api/users/register` to the API
3. Backend validates:
   - Username: 3-30 chars, alphanumeric + underscores
   - Password: 12+ chars, uppercase, lowercase, digit, special character
4. On success: shows alert and navigates to login page (`/`)
5. On error: displays validation message from API
6. "Back to Login" button uses React Router `navigate('/')` (safe navigation)

### Moviefile/MoviesGrid.js

The main movie browsing page with filtering capabilities.

**State:**
- `searchTerm` - text input for title search
- `genre` - selected genre from dropdown
- `rating` - selected minimum rating
- `movies` - received from App.js as prop (already fetched)

**Filtering logic (client-side):**
```
1. Start with all movies from props
2. If searchTerm: filter where title includes searchTerm (case-insensitive)
3. If genre selected: filter where movie.genre includes the genre
   - Handles comma-separated genres: splits "Action, Crime, Drama"
     into ["action", "crime", "drama"] and checks if selected genre
     is in that array
4. If rating selected: filter where movie.rating >= selected rating
5. Display filtered results as movie cards in a CSS grid
```

**Genre dropdown:** Hardcoded list of 15 genres:
Action, Adventure, Animation, Comedy, Crime, Drama, Fantasy, Horror, Musical, Mystery, Romance, Sci-Fi, Sports, Superhero, Thriller

**Logout button:** Clears sessionStorage, removes cookies, navigates to `/`

### Moviefile/MovieCard.js

Individual movie card component displayed in the grid.

**Props:** `movie`, `isWatchlisted`, `toggleWatchlist`

**Displays:**
- Movie poster image (from `/images/${movie.image}`, fallback to `/images/default.jpg`)
- Movie title as link to `/movie/${movie._id}`
- Genre text
- Watchlist toggle button (bookmark icon, changes appearance when watchlisted)

**Image handling:** Uses absolute paths `/images/...` so images work from any route depth (e.g., `/movie/123`).

### Moviefile/MovieDetail.js

Full movie detail page accessed at `/movie/:id`.

**Data fetching:**
- On mount, fetches `GET /api/movies/:id` using the ID from URL params
- The API returns the movie with populated reviews (including reviewer usernames)
- If fetch fails or returns 401, handles error appropriately

**Displays:**
- Movie title, genre, description
- Movie poster image
- Average rating (calculated from `ratings` array: sum of values / count)
- ReviewSection component for adding/viewing reviews
- Back button to return to `/home`

### Moviefile/ReviewSection.js

Review form and review list, embedded inside MovieDetail.

**Review submission:**
1. User types review text in textarea
2. User selects star rating (1-5)
3. Sends `POST /api/movies/:id/review` with `{ text, rating }`
4. On success: review appears in the list
5. On error: shows error message (e.g., "You have already reviewed this movie.")
6. Network errors show "Please check your connection"

**Review display:**
- Each review shows: username, review text, date, star rating
- Reviews are ordered by date (newest first from API)

### Moviefile/Watchlist.js

Shows all movies the user has added to their watchlist.

**Props:** `movies`, `watchlist` (array of movie IDs from App.js)

**How it works:**
- Filters `movies` array to only show movies whose `_id` is in the `watchlist` array
- Displays them as MovieCard components
- If empty, shows "Your watchlist is empty"
- Back button uses `navigate('/home')` (safe navigation, not `window.history.back()`)

### Header.js

Navigation bar shown on all pages except login/register.

**Contains:**
- App logo (from `/logo.png`)
- Navigation links: Home, Watchlist
- Username display

### Footer.js

Page footer with basic info.

---

## Authentication Flow

### Login Process (detailed)

```
User                     Loginpage.js                    API (port 5000)
=====                    ============                    ===============

1. Types username
   and password
        |
        v
2. Clicks "Login"
        |
        v
3.                  fetch('http://localhost:5000
                    /api/users/login', {
                      method: 'POST',
                      headers: { 'Content-Type':
                        'application/json' },
                      body: JSON.stringify({
                        username, password })
                    })
                           |
                           +------------------------->
                                                     4. Validates input
                                                     5. Finds user by username
                                                     6. bcrypt.compare(password, hash)
                                                     7. jwt.sign({ id, username, role })
                                                     <-------------------------+
                           |
                    8. Receives { user, token }
                    9. sessionStorage.setItem('token', token)
                    10. sessionStorage.setItem('user', JSON.stringify(user))
                    11. Cookies.set('username', ..., { secure, sameSite: 'Strict' })
                    12. Cookies.set('loggedIn', 'true', { secure, sameSite: 'Strict' })
                    13. navigate('/home')
        |
        v
14. App.js useEffect fires
    (detects token in storage)
        |
        v
15. Fetches movies and watchlist
        |
        v
16. MoviesGrid renders
```

### How token is used on every API call

Every component that calls the API reads the token from sessionStorage:

```javascript
const token = sessionStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/...', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

### Auto-logout on 401

In App.js, if any API call returns 401 or 403:
1. `sessionStorage.clear()` removes token and user data
2. `Cookies.remove('username')` and `Cookies.remove('loggedIn')` clear cookies
3. `navigate('/')` redirects to login page

---

## State Management

This app uses **React's built-in state** (no Redux, no Context API). All shared state lives in App.js and is passed down as props.

### State variables in App.js

| State | Type | Initialized | Updated by | Passed to |
|-------|------|-------------|-----------|-----------|
| `movies` | Array | `[]` | `useEffect` fetch on mount | MoviesGrid, Watchlist, MovieDetail |
| `user` | Object/null | `null` | Login callback | Header (username) |
| `watchlist` | Array of IDs | `[]` | `useEffect` fetch + `toggleWatchlist` | MoviesGrid, MovieCard, Watchlist |

### Watchlist toggle flow

When a user clicks the watchlist icon on a MovieCard:

```
1. MovieCard calls toggleWatchlist(movieId)
   |
   v
2. App.js toggleWatchlist function:
   - If movieId is in watchlist -> remove it (filter)
   - If movieId is NOT in watchlist -> add it (spread + push)
   |
   v
3. Sets new watchlist state
   |
   v
4. POST /api/users/:id/watchlist with { watchlist: newArray }
   |
   v
5. If API returns 401 or 403 -> auto-logout
   If API succeeds -> watchlist is persisted in MongoDB
```

---

## Styling & Design System

### CSS Files

| File | Scope | What it styles |
|------|-------|---------------|
| `index.css` | Global | HTML/body reset (margin: 0, padding: 0, box-sizing) |
| `App.css` | App-level | App container, layout spacing |
| `styles.css` | Shared components | Movie cards, grid, buttons, forms, watchlist, movie detail |
| `Login/Loginpage.css` | Login page only | Video background, glassmorphism card, animations |
| `Register/RegisterPage.css` | Register page only | Registration form styling |

### Glassmorphism Login Design

The login page uses a multi-layer z-index system:

```
Layer 1 (z-index: 1):   <video> - Full-screen looping movie background
Layer 2 (z-index: 2):   <div>   - Semi-transparent dark overlay
Layer 3 (z-index: 3):   <div>   - Glassmorphism login card

Card effects:
- backdrop-filter: blur(30px)    -- frosted glass effect
- background: rgba(0,0,0,0.3)   -- semi-transparent black
- border: 1px solid rgba(255,255,255,0.08)
- ::before pseudo-element: purple corner glow (top-left)
- ::after pseudo-element: gold corner glow (bottom-right)
- cardIn animation: slides up + fades in on page load
```

### Fonts

Loaded via Google Fonts CDN in `index.html`:
- **Bebas Neue** - Used for the app logo and large headings
- **DM Sans** (weights: 400, 500, 700) - Used for all body text, buttons, and form elements

### Image Handling

Movie posters are stored as static files in `public/images/`. The database stores just the filename (e.g., `dark_knight.jpg`), and MovieCard renders:

```jsx
<img src={`/images/${movie.image}`} />
```

Using absolute paths (starting with `/`) ensures images load correctly even on nested routes like `/movie/123`.

Fallback for missing images:
```jsx
onError={(e) => { e.target.src = '/images/default.jpg' }}
```

---

## API Communication

All API calls go to `http://localhost:5000`. The endpoints used by this frontend:

| Component | Method | Endpoint | Purpose |
|-----------|--------|----------|---------|
| Loginpage | POST | `/api/users/login` | Authenticate user |
| RegisterPage | POST | `/api/users/register` | Create account |
| App.js | GET | `/api/movies` | Fetch all movies on mount |
| App.js | GET | `/api/users/:id/watchlist` | Fetch user watchlist on mount |
| App.js | POST | `/api/users/:id/watchlist` | Sync watchlist after toggle |
| MovieDetail | GET | `/api/movies/:id` | Fetch single movie details |
| ReviewSection | POST | `/api/movies/:id/review` | Submit review + rating |

### Error handling pattern

Every fetch call follows this pattern:
```javascript
try {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 401 || response.status === 403) {
    // Auto-logout
    sessionStorage.clear();
    Cookies.remove('username');
    navigate('/');
    return;
  }
  const data = await response.json();
  // Use data...
} catch (error) {
  // Network error handling
  console.error(error);
}
```

---

## Folder Structure

```
movidex/
+-- package.json              Dependencies and scripts
+-- public/
|   +-- index.html            HTML shell with Google Fonts links
|   +-- manifest.json         PWA manifest
|   +-- robots.txt            Crawler rules
|   +-- logo.png              App logo (used in Header)
|   +-- images/               Movie poster images (dark_knight.jpg, etc.)
|   +-- videos/               Login page background video
+-- src/
    +-- index.js              React entry: renders <App> inside <BrowserRouter>
    +-- index.css             Global CSS reset
    +-- App.js                Main component: Layout, Routes, state, data fetching
    +-- App.css               App-level styles
    +-- styles.css            Shared component styles (cards, grid, buttons, etc.)
    +-- components/
        +-- Header.js         Navigation bar (visible on all pages except login/register)
        +-- Footer.js         Page footer
        +-- Login/
        |   +-- Loginpage.js  Login form + API call + session/cookie storage
        |   +-- Loginpage.css Glassmorphism design (video bg, blur card, glows, animation)
        +-- Register/
        |   +-- RegisterPage.js    Registration form + API call
        |   +-- RegisterPage.css   Registration page styling
        +-- Moviefile/
            +-- MoviesGrid.js      Movie grid with search/genre/rating filters
            +-- MovieCard.js       Individual movie card (poster, title, watchlist toggle)
            +-- MovieDetail.js     Full movie page (description, avg rating, reviews)
            +-- ReviewSection.js   Review form (text + stars) and review list
            +-- Watchlist.js       Personal watchlist display
```
