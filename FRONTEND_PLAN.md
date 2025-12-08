# 🎵 Frontend Development Plan (Next.js)

This plan outlines the steps to build the frontend for **6rabyat**, connecting to the existing backend API.

## 🛠️ Phase 1: Setup & Configuration
- [ ] **Environment Setup**: Configure `.env.local` with `NEXT_PUBLIC_API_URL`.
- [ ] **API Client**: Create a reusable `api.js` or `axios` instance to handle:
    - Base URL (`/api`).
    - **Site Password Header** (`x-site-password`).
    - **Auth Token Header** (`Authorization: Bearer ...`).
- [ ] **Global State**: Setup Context or Zustand for:
    - `AuthContext` (User, Login, Logout).
    - `PlayerContext` (Current Track, Play/Pause, Volume).

## 🔐 Phase 2: Authentication & Security
- [ ] **Site Guard Page**:
    - A landing page that asks for the "Site Password" before showing anything else.
    - Store password in LocalStorage/SessionStorage.
- [ ] **Login Page**: Form for Email/Password.
- [ ] **Register Page**: Form for Email/Password.
- [ ] **Verification Success Page**: (Already handled by backend HTML, but maybe a "Go to Login" button on the frontend if needed).

## 🎧 Phase 3: Core Music Player
- [ ] **Global Player Component**: A persistent bar at the bottom of the screen.
    - Play/Pause, Next/Prev, Volume, Progress Bar.
    - Display current track info (Title, Artist, Cover).
    - Handle HTML5 Audio element logic.

## 🏠 Phase 4: Main Pages
- [ ] **Home Page (`/`)**:
    - List all tracks (`GET /api/tracks`).
    - "Play" button for each track.
- [ ] **Upload Page (`/upload`)**:
    - Form to upload MP3 + Cover Image.
    - Progress bar for upload.

## 📜 Phase 5: Playlists
- [ ] **My Playlists Page (`/playlists`)**:
    - List user's playlists.
    - "Create New Playlist" modal/form.
- [ ] **Playlist Detail Page (`/playlists/[id]`)**:
    - Show tracks in the playlist.
    - "Remove Track" button.
    - "Delete Playlist" button.
- [ ] **Add to Playlist**:
    - "Add to Playlist" button on every track in the Home/Search view.

## 🎨 Phase 6: UI/UX Polish
- [ ] **Tailwind Styling**: Ensure a dark, sleek "Spotify-like" or "SoundCloud-like" theme.
- [ ] **Responsive Design**: Ensure it works on mobile.
- [ ] **Loading States**: Skeletons or spinners while fetching data.
