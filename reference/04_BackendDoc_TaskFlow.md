# TaskFlow — Backend Document

---

## SECTION 1: Tech Stack

### Runtime & Framework
| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Server runtime |
| Express.js | 4.x | HTTP server, routing, middleware |
| Socket.io | 4.x | WebSocket server for real-time collaboration |

### Database
| Tool | Purpose |
|---|---|
| MongoDB | Primary NoSQL database (documents/collections) |
| Mongoose | ODM — schema definition, validation, query helpers |

### Authentication & Security
| Tool | Purpose |
|---|---|
| bcryptjs | Password hashing (salt rounds: 12) |
| jsonwebtoken | JWT signing and verification |
| passport.js | OAuth strategy management |
| passport-google-oauth20 | Google OAuth 2.0 strategy |
| passport-github2 | GitHub OAuth 2.0 strategy |
| express-session | Session management for OAuth callback flow |
| helmet | HTTP security headers |
| express-rate-limit | Rate limiting on auth endpoints |
| cors | Cross-Origin Resource Sharing configuration |
| express-validator | Input validation and sanitization |
| dotenv | Environment variable management |

### Utilities
| Tool | Purpose |
|---|---|
| nodemon | Dev auto-restart on file changes |
| morgan | HTTP request logging |
| multer | Profile image upload handling (if file storage added) |

---

## SECTION 2: Backend Structure

### 2.1 Folder Structure

```
/server
  /config
    db.js              ← MongoDB connection via Mongoose
    passport.js        ← Google & GitHub OAuth strategy setup
    socket.js          ← Socket.io server initialization and event handlers
  /controllers
    authController.js
    taskController.js
    userController.js
  /middleware
    authMiddleware.js  ← JWT verify, attach req.user
    errorMiddleware.js ← Global error handler
    rateLimiter.js     ← express-rate-limit config
    validate.js        ← express-validator chains
  /models
    User.js
    Task.js
  /routes
    authRoutes.js
    taskRoutes.js
    userRoutes.js
  /utils
    jwtHelper.js       ← sign and verify JWT
    emailHelper.js     ← password reset emails (Nodemailer)
  server.js            ← Express app setup, middleware registration, route mounting
.env
package.json
```

---

### 2.2 Database Schema

#### Collection: `users`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated | Primary key |
| `fullName` | String | required, trim | User's display name |
| `username` | String | required, unique, lowercase | Handle/username |
| `email` | String | required, unique, lowercase | Login email |
| `passwordHash` | String | required (null if OAuth only) | bcrypt hash |
| `authProvider` | String | enum: local/google/github | Auth method used |
| `providerId` | String | nullable | OAuth provider's user ID |
| `avatarUrl` | String | nullable | Profile picture URL |
| `bio` | String | maxLength: 300 | Short bio |
| `theme` | String | enum: dark/light, default: dark | UI theme preference |
| `notifications` | Object | | Notification preferences |
| `notifications.email` | Boolean | default: true | Email alerts enabled |
| `notifications.push` | Boolean | default: true | Push notifications enabled |
| `notifications.inApp` | Boolean | default: true | In-app messages enabled |
| `twoFactorEnabled` | Boolean | default: false | 2FA toggled on |
| `twoFactorSecret` | String | nullable | TOTP secret (encrypted) |
| `passwordResetToken` | String | nullable | Hashed reset token |
| `passwordResetExpires` | Date | nullable | Reset token expiry |
| `createdAt` | Date | auto | Account creation timestamp |
| `updatedAt` | Date | auto | Last update timestamp |

**Mongoose Model Notes:**
- `pre('save')` hook: if `passwordHash` is modified, re-hash with bcrypt
- `toJSON()` transform: exclude `passwordHash`, `twoFactorSecret`, `passwordResetToken` from API responses

---

#### Collection: `tasks`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated | Primary key |
| `userId` | ObjectId | ref: User, required | Owner of the task |
| `title` | String | required, trim, maxLength: 200 | Task name |
| `description` | String | maxLength: 2000 | Full task description |
| `priority` | String | enum: High/Medium/Low, default: Medium | Priority level |
| `category` | String | enum: Development/Design/Marketing/Composition/Others/Contact | Task category |
| `status` | String | enum: Pending/In Progress/Completed, default: Pending | Current status |
| `dueDate` | Date | nullable | Task deadline |
| `order` | Number | default: 0 | Sort order within list (for drag-and-drop) |
| `progress` | Number | min: 0, max: 100, default: 0 | Completion percentage |
| `tags` | [String] | max 10 tags | Freeform tags |
| `assigneeId` | ObjectId | ref: User, nullable | Assigned team member |
| `createdAt` | Date | auto | Task creation timestamp |
| `updatedAt` | Date | auto | Last update timestamp |

**Indexes:**
- `{ userId: 1, status: 1 }` — fetch tasks by user and status (Kanban)
- `{ userId: 1, dueDate: 1 }` — calendar view queries
- `{ userId: 1, order: 1 }` — sorted list view

---

### 2.3 API Endpoints

#### Auth Routes — `/api/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/register` | No | Create new user account |
| POST | `/login` | No | Email/password login; returns JWT |
| GET | `/google` | No | Initiate Google OAuth flow |
| GET | `/google/callback` | No | Google OAuth callback; issues JWT |
| GET | `/github` | No | Initiate GitHub OAuth flow |
| GET | `/github/callback` | No | GitHub OAuth callback; issues JWT |
| POST | `/forgot-password` | No | Send password reset email |
| POST | `/reset-password/:token` | No | Reset password with token |
| PATCH | `/change-password` | Yes | Change password (authenticated) |
| POST | `/logout` | Yes | Invalidate session / clear cookie |

#### User Routes — `/api/users`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/me` | Yes | Get current user profile |
| PATCH | `/profile` | Yes | Update name, username, email, bio, avatar |
| PATCH | `/preferences` | Yes | Update notification and theme settings |
| DELETE | `/account` | Yes | Delete account and all associated tasks |

#### Task Routes — `/api/tasks`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/` | Yes | Get all tasks for current user (supports query params: status, priority, category, sort, search) |
| POST | `/` | Yes | Create a new task |
| GET | `/:id` | Yes | Get single task by ID |
| PATCH | `/:id` | Yes | Update task fields |
| DELETE | `/:id` | Yes | Delete a task |
| PATCH | `/reorder` | Yes | Update task `order` values (drag-and-drop bulk update) |

**Query Params for GET `/api/tasks`:**
- `?status=Pending` — filter by status
- `?priority=High` — filter by priority
- `?category=Design` — filter by category
- `?search=api` — full-text search on title + description
- `?sort=dueDate` or `?sort=priority` or `?sort=order`
- `?startDate=2024-10-01&endDate=2024-10-31` — calendar range query

---

### 2.4 Real-Time API (Socket.io)

**Connection:**
- Client connects with JWT in handshake auth: `{ auth: { token: "..." } }`
- Server verifies JWT on connection; disconnects unauthenticated sockets

**Rooms:**
- Users join a room per task when they open a Task Detail view: `socket.join('task:' + taskId)`
- Users leave the room when they close the modal: `socket.leave('task:' + taskId)`

**Events:**

| Event | Direction | Payload | Description |
|---|---|---|---|
| `task:update` | Client → Server | `{ taskId, field, value }` | User edits a task field |
| `task:update` | Server → Clients | `{ taskId, field, value, updatedBy }` | Broadcast edit to room |
| `task:status-change` | Client → Server | `{ taskId, newStatus }` | User moves Kanban card |
| `task:status-change` | Server → Clients | `{ taskId, newStatus, updatedBy }` | Broadcast status change |
| `task:created` | Server → Clients | `{ task }` | New task created; broadcast to user's socket room |
| `task:deleted` | Server → Clients | `{ taskId }` | Task deleted; broadcast to user's room |
| `user:presence` | Client → Server | `{ taskId }` | User opened a task (join room) |
| `user:left` | Client → Server | `{ taskId }` | User closed a task (leave room) |

---

### 2.5 Environment Variables

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskflow

# JWT
JWT_SECRET=<long_random_secret>
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Email (Nodemailer)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid_api_key>
EMAIL_FROM=no-reply@taskflow.app

# Session (OAuth flow only)
SESSION_SECRET=<another_long_random_secret>

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```
