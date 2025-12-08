# Music Streaming App (Node.js + Next.js)

This project uses a Node.js backend with a Next.js frontend.

## Architecture
- **Backend**: Node.js (Express) with Prisma ORM.
- **Database**: SQLite (Fast, file-based).
- **Frontend**: Next.js (React).
- **Storage**: Local file system (mapped via Docker volumes).

## Quick Start

1.  **Build and Run**:
    ```bash
    docker-compose up --build -d
    ```

2.  **Access**:
    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:8080` (Internal port 3000)

## Data Persistence
All data is stored in the `./data` folder in your project root.
- Database: `./data/db/dev.db`
- Music Files: `./data/music/`
- Cover Art: `./data/covers/`

## Configuration
Environment variables are set in `docker-compose.yml`.
