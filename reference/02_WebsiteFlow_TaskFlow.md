# TaskFlow — Website Flow Document

---

## Overview

This document describes every step a user takes when interacting with TaskFlow — from first landing on the site to logging out. Each interaction, transition, decision point, and UI response is described in sequence.

---

## FLOW 1: New User — Registration & Onboarding

### Step 1: Landing Page
- User opens the TaskFlow URL in a browser
- They land on the **Marketing / Landing Page**
- Page displays: Hero headline ("Empower Your Workflow with Precision"), a "Get Started" CTA button, and three feature highlight cards: Seamless Integration, Advanced Security, Blazing Fast Performance
- Navigation bar at the top shows: Features, Pricing, Resources, Connect links

### Step 2: User Clicks "Get Started"
- User is redirected to the **Registration Page**

### Step 3: Registration Form
- User sees the Registration card with fields: Full Name, Email Address, Create Password
- User fills in all fields
- User clicks **Sign Up**
- Client validates: all fields non-empty, email format valid, password meets minimum length
- If validation fails → inline error messages appear below the relevant fields; user corrects and resubmits
- If validation passes → POST request sent to `/api/auth/register`
- Server hashes password with bcrypt, creates user document in MongoDB, returns a JWT token
- User is automatically logged in and redirected to the **Dashboard (Home)**

---

## FLOW 2: Returning User — Login

### Step 1: Landing Page
- User opens TaskFlow URL
- They click **Log In** in the navigation (or are redirected here if they try to access a protected route while logged out)

### Step 2: Login Form
- User sees Login card with: Email field, Password field (with show/hide toggle), Forgot Password link
- Social login options: **Continue with Google**, **Continue with GitHub**

### Step 3a: Email/Password Login
- User enters email and password, clicks **Log In**
- POST to `/api/auth/login`; server validates credentials, returns JWT
- JWT stored in httpOnly cookie (or secure localStorage)
- User redirected to **Dashboard**

### Step 3b: Social Login (Google / GitHub)
- User clicks **Continue with Google** or **Continue with GitHub**
- OAuth flow opens in same tab (redirect) or popup
- On success, server receives OAuth token, finds or creates user, issues JWT
- User redirected to **Dashboard**

### Step 3c: Forgot Password
- User clicks **Forgot Password?**
- Modal or dedicated page appears with an email input
- User enters email, clicks **Send Reset Link**
- Server sends password reset email with a time-limited token link
- User clicks link in email → arrives at Reset Password page with new password fields
- On success → redirected to Login page with a success toast

---

## FLOW 3: Authenticated Session — Dashboard

### On Every App Load (After Login)
- Browser sends JWT (cookie/header) with each request
- Server validates token; if expired → user redirected to Login
- If valid → app loads; user's data is fetched

### Dashboard Page
- Sidebar is visible on left with icons: Home, Projects, Tasks, Calendar, Analytics, Settings, Logout
- Main area shows:
  - Greeting: "Welcome back, [Name]. Here's your overview."
  - Four stat cards: Total Tasks, Completed, Pending, High Priority (fetched from API)
  - Weekly Productivity chart (area chart, Sun–Sat, tasks completed per day)
  - Recent Activity feed on the right panel listing latest task updates and comments with timestamps
  - **Quick Add Task** button (teal CTA) in top-right of right panel

---

## FLOW 4: Creating a Task

### Step 1: Open Add Task Modal
- User clicks **+ Quick Add Task** (dashboard) or the **+** icon in the Tasks page toolbar
- A modal overlay appears on top of the current page (background dims but stays visible)

### Step 2: Fill In Task Details
- User types Task Title (required)
- User types Description (optional)
- User selects Priority from dropdown: High / Medium / Low
- User selects Category from dropdown: Development / Design / Marketing / Composition / Others / Contact
- User picks a Due Date from the integrated date picker

### Step 3: Submit
- User clicks **Create Task**
- POST to `/api/tasks` with all fields
- Server saves task to MongoDB, associates it with the logged-in user's ID
- Modal closes; new task appears at the top of the task list / board immediately (optimistic UI or socket push)
- Toast notification: "Task created successfully"
- If user clicks **Cancel** → modal closes, no task is created

---

## FLOW 5: Viewing & Managing Tasks (List View)

### Step 1: Navigate to Tasks
- User clicks **Tasks** in the sidebar
- Tasks page loads, showing all tasks in a list

### Step 2: Search and Filter
- User types in the search bar → list filters in real-time by title/description
- User opens **Filter by Status** dropdown → selects Pending / In Progress / Completed → list filters
- User opens **Filter by Priority** → selects High / Medium / Low
- User opens **Sort By** → selects by Due Date, Priority, Created Date
- Filters are combinable; all filtering happens client-side (or via query params to API)

### Step 3: Interact with a Task Row
- Each task row shows: Title, Priority badge (colored), Due Date, Status badge
- **Click task row** → Task Detail view or edit modal opens
- User edits any field → PATCH to `/api/tasks/:id` → changes saved; row updates
- User toggles Status badge → status cycles or dropdown appears; PATCH request updates status
- User drags a task row up or down → reorder is saved via PATCH with updated order index

### Step 4: Delete a Task
- User hovers task row → delete icon (trash) appears
- User clicks delete icon → confirmation dialog: "Delete this task?"
- User confirms → DELETE to `/api/tasks/:id` → task removed from list with animation
- Toast: "Task deleted"

---

## FLOW 6: Kanban Board View

### Step 1: Navigate to Board
- User clicks the **Board** icon in the sidebar
- Kanban board loads with three columns: Pending, In Progress, Completed

### Step 2: View Cards
- Each card shows: assignee avatar, task title, brief description, progress bar (%), priority badge
- Cards are grouped by their current status column

### Step 3: Move a Card
- User clicks and holds a card, drags it to a different column
- On drop: PATCH to `/api/tasks/:id` with new status
- Column updates immediately; all connected users see the card move in real time (Socket.io broadcast)

### Step 4: Open Card Detail
- User clicks (not drags) a card → Task Detail modal opens with all editable fields
- User edits and saves → PATCH request; modal closes; card updates

---

## FLOW 7: Calendar View

### Step 1: Navigate to Calendar
- User clicks **Calendar** icon in the sidebar
- Monthly calendar for the current month loads
- Tasks appear as color-coded bars on their due dates

### Step 2: Browse
- User clicks **<** or **>** to navigate between months
- User clicks **Today** to jump back to the current date

### Step 3: Click a Date
- User clicks on a date cell → a popover or side panel lists all tasks due on that date
- User clicks a task in the popover → Task Detail modal opens

### Step 4: Reschedule by Drag
- User drags a task bar from one date cell to another
- On drop: PATCH to `/api/tasks/:id` with new due date
- Calendar re-renders the task on the new date; toast: "Task rescheduled"

---

## FLOW 8: Real-Time Collaboration

### Scenario: Two users have the same task open
- User A edits the Description field in the Task Detail modal
- As User A types, the updated description streams (debounced) via Socket.io to the server
- Server broadcasts the change to all clients subscribed to that task's room
- User B sees the description update live with a ripple/glow animation and a toast: "Task updated by User A"
- Both users see each other's cursor/presence indicator labeled with their name badge

---

## FLOW 9: Settings & Profile

### Step 1: Navigate to Settings
- User clicks **Settings** (gear icon) in the sidebar
- Settings page loads with three panels: Profile Customization, Preferences, Security

### Step 2: Profile Customization
- User clicks avatar to upload a new profile photo
- User edits Full Name, Username, Email, Bio fields
- User clicks **Save** → PATCH to `/api/users/profile`; toast: "Profile updated"

### Step 3: Notification Preferences
- User toggles: Email Alerts, Push Notifications, In-App Messages ON or OFF
- Each toggle auto-saves on change → PATCH to `/api/users/preferences`

### Step 4: Theme Settings
- User toggles **Dark Mode** → UI theme switches instantly; preference saved to server
- User toggles **Auto-Sync System** → theme follows OS setting
- User toggles **High Contrast** → accessibility mode enabled

### Step 5: Security
- User types current password, new password, confirm new password
- User clicks **Change Password** → PATCH to `/api/auth/change-password`; JWT invalidated; user re-authenticated
- User clicks **Enable Two-Factor Authentication** → guided 2FA setup flow (QR code, confirm code)

---

## FLOW 10: Mobile Experience

### On Phone/Tablet
- Sidebar collapses; bottom navigation bar appears with: Home, Tasks, Timeline, Settings icons
- User taps **Tasks** at the bottom → Tasks list loads
- User swipes left on a task row → action buttons appear: Edit (pencil), Delete (red trash), Complete (check)
- User taps **Edit** → Task Detail modal opens (full-screen on mobile)
- User taps **Delete** → confirmation; task deleted
- User taps **Complete** → status flips to Completed; row updates

---

## FLOW 11: Logout

- User clicks the **Logout** icon at the bottom of the sidebar (or bottom nav on mobile)
- Confirmation: "Are you sure you want to log out?" (optional dialog or direct action)
- Client clears JWT (removes cookie / clears localStorage)
- Socket.io connection is disconnected
- User redirected to the **Landing Page**
- Any protected route attempt now redirects back to Login

---

## Page Inventory

| Page / View | Route | Auth Required |
|---|---|---|
| Landing / Marketing Page | `/` | No |
| Registration | `/register` | No |
| Login | `/login` | No |
| Password Reset Request | `/forgot-password` | No |
| Password Reset | `/reset-password/:token` | No |
| Dashboard (Home) | `/dashboard` | Yes |
| Tasks (List View) | `/tasks` | Yes |
| Kanban Board | `/board` | Yes |
| Calendar | `/calendar` | Yes |
| Settings | `/settings` | Yes |
