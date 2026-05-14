# TaskFlow — Implementation Strategy & Blueprint

## SECTION 1 — PROJECT UNDERSTANDING

TaskFlow is a production-grade productivity platform designed to provide an immersive, real-time collaborative experience for task and project management. 

### Core Architecture
The system follows a decoupled Full-Stack architecture:
*   **Frontend**: A high-performance Vanilla JavaScript Single Page Application (SPA) shell (`app.html`) that handles routing and state without a heavy framework. It prioritizes "Cinematic Dark" aesthetics and micro-animations.
*   **Backend**: A stateless Node.js/Express server providing a RESTful API and a stateful WebSocket layer (Socket.io) for real-time synchronization.
*   **Database**: MongoDB for flexible task storage, utilizing Mongoose for schema enforcement and indexing.

### Engineering Philosophy
*   **Real-time First**: Collaboration isn't an add-on; it's central. Every status change or edit propagates via Socket.io.
*   **Zero-Framework Frontend**: Maximum control over performance and bundle size using modern ES6+, CSS Grid/Flexbox, and native DOM APIs.
*   **Security by Design**: JWT-based authentication, password hashing with bcrypt (12 rounds), and strict input validation via `express-validator`.
*   **Responsive Excellence**: A mobile-first approach with a dedicated bottom-nav for small screens and a 3-panel layout for wide monitors.

### Key Engineering Challenges
1.  **State Management without Frameworks**: Managing global app state (user info, task lists, theme) using a custom reactive store or event bus.
2.  **Conflict Resolution**: Handling race conditions when two users edit the same task simultaneously.
3.  **Real-time Reconciliation**: Ensuring the UI remains consistent after a socket reconnection or optimistic update failure.
4.  **Complex Drag-and-Drop**: Implementing smooth Kanban and list reordering using native HTML5 DnD or a lightweight utility.

---

## SECTION 2 — SYSTEM ARCHITECTURE PLAN

### Frontend Architecture
*   **Routing**: A client-side hash-based or History API router in `main.js` that maps URLs to view-render functions.
*   **Page Rendering**: Modular "View" components that return DOM elements or update an existing container.
*   **State Management**: A centralized `Store` class in `main.js` or a separate module that uses a simple Pub/Sub pattern to notify components of data changes.
*   **API Layer**: A central `api.js` using `fetch` with interceptors for injecting JWTs and handling 401 Unauthorized responses.
*   **Socket Management**: A singleton `socket.js` that manages the connection lifecycle and dispatches global events.
*   **Theme Management**: CSS Variables (`variables.css`) toggled by `data-theme` on the `<html>` element.

**Why Vanilla JS?** For this specific project, Vanilla JS ensures zero framework overhead, allowing for the "cinematic" performance and total control over animations and micro-interactions requested in the Design Doc.

### Backend Architecture
*   **Express Structure**: Modular route-controller-service pattern.
*   **Middleware Order**: Helmet -> CORS -> Rate Limiter -> Morgan -> JSON Parser -> Auth Middleware -> Routes -> Error Handler.
*   **Auth Flow**: Hybrid JWT/OAuth. OAuth uses `passport` with session-based temporary state for the callback, which then issues a long-lived JWT.
*   **Socket.io**: Integrated at the server level, sharing the HTTP port, with a dedicated `config/socket.js` for room management.

**Why this structure?** It ensures high performance, clear separation of concerns, and easy scalability (stateless API handles most traffic, socket server handles real-time).

### Database Architecture
*   **Schema**:
    *   `Users`: Primary focus on security (hashes, 2FA secrets) and preferences.
    *   `Tasks`: Highly indexed for the three main views (List, Board, Calendar).
*   **Indexing Strategy**: Compound indexes on `userId` + `status`/`dueDate`/`order` to ensure <200ms query performance even as task counts grow.

---

## SECTION 3 — FEATURE DEPENDENCY GRAPH

1.  **Foundation**: 
    *   Environment Configuration (.env)
    *   Database connection (Mongoose)
    *   CSS Variable System (Design Tokens)
2.  **Auth (Blocking)**:
    *   Registration/Login API -> JWT Utility -> `authMiddleware` -> Protected Routes.
3.  **App Shell**:
    *   Layout Grid -> Sidebar/Bottom Nav -> Theme Switcher.
4.  **Task Engine**:
    *   Task CRUD API -> List View Component -> Task Creation Modal.
5.  **Specialized Views (Dependent on Task Engine)**:
    *   Kanban Board (Drag-and-Drop)
    *   Calendar (Flatpickr integration)
    *   Dashboard (Chart.js integration)
6.  **Real-time Collaboration (Overlay)**:
    *   Socket.io Setup -> Room Management -> Presence Indicators -> Broadcast Logic.

---

## SECTION 4 — IMPLEMENTATION PHASES

### Phase 1: Core Foundation & Auth (Days 1-2)
*   **Goals**: Secure login/reg and DB connection.
*   **Deliverables**: Working Auth API, JWT persistence, registration/login pages.
*   **Validation**: User can register and get a token.

### Phase 2: App Shell & Responsive Layout (Day 3)
*   **Goals**: Establish the 3-panel layout and theme system.
*   **Deliverables**: Sidebar, Bottom Nav, Theme Toggler, Protected Route redirection.
*   **Validation**: Responsive layout works at all breakpoints; theme persists.

### Phase 3: Task CRUD & List View (Day 4)
*   **Goals**: Basic task management.
*   **Deliverables**: `/api/tasks` endpoints, Task Creation Modal, List View with filtering.
*   **Validation**: Create/Edit/Delete a task; list updates.

### Phase 4: Kanban & Drag-and-Drop (Day 5)
*   **Goals**: Visual workflow management.
*   **Deliverables**: Kanban Board, Drag-and-Drop reordering logic, status transitions.
*   **Validation**: Moving a card updates the DB status and order.

### Phase 5: Calendar & Dashboard (Day 6)
*   **Goals**: Visualization and analytics.
*   **Deliverables**: Full-page Calendar, Dashboard Stat Cards, Chart.js productivity graph.
*   **Validation**: Charts reflect real DB data; Calendar shows task deadlines.

### Phase 6: Real-time Collaboration (Day 7)
*   **Goals**: Multi-user sync.
*   **Deliverables**: Socket.io integration, presence indicators, live updates.
*   **Validation**: User A's changes appear on User B's screen instantly.

### Phase 7: Polish & Hardening (Day 8)
*   **Goals**: Security audit, accessibility, and performance.
*   **Deliverables**: 2FA toggle, password reset flow, loading states, accessibility audit fixes.

---

## SECTION 5 — FILE-BY-FILE IMPLEMENTATION PLAN

### Backend (`/server`)
1.  `server.js`: Entry point, registers global middleware and routes.
2.  `config/db.js`: Mongoose connection logic with retry.
3.  `models/User.js`: Schema with bcrypt pre-save hooks and secure `toJSON`.
4.  `routes/authRoutes.js`: Post endpoints for login/reg.
5.  `controllers/authController.js`: Logic for JWT issuance and validation.
6.  `middleware/authMiddleware.js`: The "Gatekeeper" for all `/api` routes (except auth).
7.  `routes/taskRoutes.js`: CRUD endpoints.
8.  `config/socket.js`: Socket.io event loop (join rooms, broadcast updates).

### Frontend (`/public`)
1.  `css/variables.css`: The source of truth for colors and spacing.
2.  `js/api.js`: Reusable fetch wrapper with token handling.
3.  `js/main.js`: Router and App State manager.
4.  `js/views/`: Sub-folders for each page (Dashboard, Tasks, Board).
5.  `js/socket.js`: Client-side listener for server broadcasts.
6.  `js/utils.js`: Toast notification system and date helpers.

---

## SECTION 6 — API CONTRACT STRATEGY

*   **Standard Response Format**: `{ "success": true, "data": { ... }, "message": "" }`
*   **Error Format**: `{ "success": false, "error": "Error message", "code": "AUTH_EXPIRED" }`
*   **Pagination**: `GET /api/tasks?page=1&limit=20`
*   **Real-time Payload**: Always include `updatedBy: { id, name }` to prevent reflecting own changes.

---

## SECTION 7 — REALTIME COLLABORATION STRATEGY

1.  **Connection**: Handshake requires a valid JWT.
2.  **Room Strategy**: `socket.join(\`user:\${userId}\`)` for global alerts; `socket.join(\`task:\${taskId}\`)` for granular edits.
3.  **Optimistic UI**: Update local DOM immediately, but add a "Syncing..." spinner; revert on socket error.
4.  **Conflict Handling**: Last-write-wins with a 300ms debounce on text fields to prevent server flood.
5.  **Presence**: Maintain an `activeUsers` map per task room on the server.

---

## SECTION 8 — UI SYSTEM STRATEGY

*   **Component Hierarchy**: `AppShell -> (Sidebar, MainContent, RightPanel)`.
*   **Modals**: Single global `<dialog>` or overlay div in `app.html` that is populated dynamically by `utils.js`.
*   **Animations**: Use `transition: all 0.2s ease` for most interactions; `@keyframes` for status pulsing and toasts.
*   **Drag-and-Drop**: `sortable.js` (if allowed) or a custom implementation of `dragstart`, `dragover`, and `drop`.

---

## SECTION 9 — SECURITY & PRODUCTION HARDENING

*   **JWT Security**: `httpOnly` cookies for the token to prevent XSS theft.
*   **Rate Limiting**: 100 requests per 15 minutes for auth endpoints.
*   **Validation**: Sanitization of all HTML inputs in task descriptions to prevent stored XSS.
*   **Environment**: Strict separation of `.env.development` and `.env.production`.

---

## SECTION 10 — TESTING STRATEGY

*   **API Testing**: Postman/Insomnia or Jest for endpoint validation.
*   **Socket Testing**: Multi-browser manual testing for real-time propagation.
*   **Responsive**: Chrome DevTools device simulation (iPhone 12, iPad Mini, Desktop).
*   **Edge Cases**: Disconnecting internet during an edit, expired token during a long session.

---

## SECTION 11 — IDENTIFY MISSING DETAILS

1.  **Password Reset**: PRD mentions it, but the Backend Doc doesn't specify an email provider (using Nodemailer/SendGrid placeholder for now).
2.  **OAuth Redirects**: Need to define the exact flow for local development vs production URLs.
3.  **Task Deletion**: Should it be a soft delete (archived) or hard delete? The docs suggest hard delete; I'll stick to that.
4.  **Team Projects**: The PRD mentions "individuals and teams," but the `tasks` schema currently only has `userId` (owner) and `assigneeId`. I'll need to ensure the `GET /api/tasks` includes tasks where the user is either the owner OR the assignee.

---

## SECTION 12 — FINAL EXECUTION STRATEGY

**Safest Order**:
1.  **Docker/Local DB** -> **Express Skeleton** -> **Auth Middleware**.
2.  **Frontend Auth Pages** -> **JWT Storage**.
3.  **Layout System** (CSS Variables & Grid).
4.  **Task CRUD** (The core data engine).
5.  **Socket.io** (The collaboration layer).
6.  **Advanced Views** (Kanban, Calendar, Dashboard).

**Highest Risk**: Real-time sync and Drag-and-Drop reordering. These will be implemented early in the "Task Engine" phase to ensure the architecture supports them.

**Avoiding Refactors**: By defining the CSS variables and the `api.js` fetch wrapper FIRST, we ensure all future components share the same design language and communication patterns.
