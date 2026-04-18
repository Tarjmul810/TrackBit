# DevBoard

A real-time collaborative task management tool for developers and small teams. Built as a portfolio project to demonstrate full-stack engineering with live collaboration features.

> **Note:** The backend is hosted on Render's free tier. Cold starts may take up to 60 seconds on the first request. Please be patient.

---

## Live Demo

- **Frontend:** [devboard.vercel.app](https://track-bit-beta.vercel.app)
- **Backend:** [devboard-api.onrender.com](https://trackbit.onrender.com)

---

## Features

**Authentication**
- Secure register and login with bcrypt password hashing
- JWT-based authentication with 1-day token expiry
- Protected routes via custom auth middleware

**Workspaces**
- Create multiple workspaces for different teams or projects
- Invite team members by email
- Members and owners have separate access levels
- Workspace owners have full control; members have scoped access

**Projects**
- Create projects inside workspaces
- Each project has its own Kanban board
- Only workspace owners can delete projects

**Kanban Board**
- Four columns: To Do, In Progress, In Review, Done
- Drag and drop tasks between columns using `@hello-pangea/dnd`
- Task order persists across sessions
- Task count displayed per column

**Tasks**
- Create tasks with title, description, priority, due date, and assignee
- Priority levels: Low, Medium, High — color coded
- Assign tasks to any workspace member
- Partial updates — update only the fields you change

**Real-time Collaboration**
- Built with WebSockets via Socket.io
- All connected users on the same project board see task updates instantly without refreshing
- Users join project-specific rooms on board load
- Task status changes broadcast to all connected clients

**Comments**
- Comment on any task
- Comments appear in a slide-over panel on task click
- Users can only delete their own comments

**State Management**
- Active workspace and project state managed with Zustand
- Persists active context across navigation

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Fastify | HTTP server and REST API |
| Prisma | ORM and database schema management |
| PostgreSQL | Relational database |
| Socket.io | WebSocket real-time communication |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Zod | Request body validation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | React framework with server-side routing |
| TypeScript | Type safety across the codebase |
| Tailwind CSS | Utility-first styling |
| Zustand | Client-side state management |
| Axios | HTTP client with request interceptors |
| Socket.io Client | Real-time event handling |
| @hello-pangea/dnd | Drag and drop for Kanban board |

---

## Database Schema

```
users         — id, name, avatar, email, password
workspaces    — id, name, userId (owner)
members       — id, userId, workspaceId
projects      — id, name, workspaceId
tasks         — id, title, description, status, priority, due_date, assigned_to, order, userId, projectId, created_at
comments      — id, content, userId, taskId, created_at
```

---

## API Routes

### Auth
```
POST /signup          Register a new user
POST /signin          Login and receive JWT token
```

### Workspaces
```
POST /workspace       Create a workspace
GET  /workspace       Get all workspaces (owned + member of)
```

### Members
```
POST /member/:id      Invite a member by email (owner only)
GET  /member/:id      Get all members of a workspace
```

### Projects
```
POST   /project/:workspaceId    Create a project
GET    /project/:workspaceId    Get all projects in a workspace
DELETE /project/:workspaceId    Delete a project (owner only)
```

### Tasks
```
POST   /task/:projectId    Create a task
GET    /task/:projectId    Get all tasks in a project
PUT    /task/:taskId       Update a task (partial update)
DELETE /task/:taskId       Delete a task
```

### Comments
```
POST   /comment/:taskId      Add a comment to a task
GET    /comment/:taskId      Get all comments on a task
DELETE /comment/:commentId   Delete your own comment
```

### WebSocket Events
```
join:project       Client joins a project room
task:updated       Broadcast when any task is updated
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm (or npm)

### Backend

```bash
cd backend
pnpm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET

# Run migrations
npx prisma migrate dev

# Start server
pnpm dev
```

### Frontend

```bash
cd frontend
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_BACKEND_URL

# Start dev server
pnpm dev
```

Frontend runs on `http://localhost:3000`  
Backend runs on `http://localhost:8080`

---

## Project Structure

```
devboard/
├── backend/
│   ├── src/
│   │   ├── routes/        Auth, workspace, project, task, comment routes
│   │   ├── middleware/     Auth, workspace access, project access, task access
│   │   ├── socket/        Socket.io setup and event handlers
│   │   ├── db.ts          Prisma client instance
│   │   └── config.ts      Environment variables
│   └── prisma/
│       └── schema.prisma
└── frontend/
    ├── app/
    │   ├── (auth)/        Signin and signup pages
    │   ├── (dashboard)/   Dashboard, workspace, and project pages
    │   └── page.tsx       Landing page
    ├── components/        Reusable components (Sidebar, Cards, Modals)
    └── lib/
        ├── axios.ts       Axios instance with token interceptor
        └── socket.ts      Socket.io client instance
```

---

## Key Engineering Decisions

**Why Fastify over Express?**  
Fastify is significantly faster, has built-in TypeScript support, and a cleaner plugin and schema validation system. Better for production-grade APIs.

**Why Prisma?**  
Type-safe database queries with automatic migration management. The nested `include` and `_count` features made complex relational queries clean and readable.

**Why Zustand over Redux?**  
Zustand has zero boilerplate. For the scope of this project — tracking active workspace and project state — it was the right tool. Redux would have been overkill.

**Access control middleware chain**  
Each layer of the app has its own middleware: `authMiddleware` → `workspaceAccess` → `projectAccess` → `taskAccess`. Each middleware does one Prisma query that verifies access through the full relationship chain, keeping routes clean and secure.

**Real-time architecture**  
Socket.io rooms are project-scoped (`project:${projectId}`). Clients join their room on page load and leave on unmount. The REST API handles mutations; Socket.io only handles broadcasting — clean separation of concerns.

---

## Known Limitations

- Backend on Render free tier — cold starts up to 60 seconds
- No email notifications for task assignments or mentions
- No file attachments on tasks
- No mobile-optimised layout

---

## Acknowledgements

The landing page design was assisted by AI. All backend logic, database design, API architecture, real-time implementation, middleware system, and core frontend functionality were designed and built from scratch.

---

## Author

**Tarjmul**  
GitHub: [@Tarjmul810](https://github.com/Tarjmul810)
