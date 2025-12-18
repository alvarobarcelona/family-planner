# Family Planner Application

## 📋 Overview

**Family Planner** is a comprehensive full-stack web application designed to help families manage their shared schedules, tasks, and notifications. It allows users to assign tasks to family members, repeat events (daily, weekly, monthly), and receive push notifications for upcoming activities.

## 🚀 Key Features

- **Dashboard**: View daily tasks and quick status updates.
- **Calendar**: Visual monthly/weekly view of all family activities.
- **Task Management**: Create, edit, and delete tasks with support for:
  - Recurring events (Daily, Weekly, Monthly, Custom).
  - Multi-day events.
  - Priority levels (High, Medium, Low).
  - Assignees (Individual family members or the whole family).
- **Push Notifications**: Real-time alerts for task reminders.
- **Role-based Views**: Filter tasks by family member.

## 🛠 Technology Stack

### Frontend (`src/app`)

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Routing**: [React Router DOM 7](https://reactrouter.com/)
- **State Management**: Custom React Concept (`TaskProvider` via `Context API`)
- **PWA Capabilities**: Service Workers for Push Notifications.

### Backend (`src/server`)

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM/Querying**: `pg` (node-postgres) with raw SQL queries.
- **Notifications**: `web-push` library.
- **Authentication**: JWT (JSON Web Tokens).

## 📂 Project Structure

```
family-planner/
├── src/
│   ├── app/                 # Frontend Application
│   │   ├── src/
│   │   │   ├── api/         # API Integration
│   │   │   ├── components/  # Reusable UI Components
│   │   │   ├── screens/     # Page Views (Home, Calendar, etc.)
│   │   │   ├── store/       # TaskContext & Global State
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── server/              # Backend Application
│       ├── src/
│       │   ├── index.ts     # Entry Point & API Routes
│       │   ├── db.ts        # Database Connection
│       │   └── services/    # Business Logic (e.g., Push Service)
│       └── package.json
│
├── docs/                    # Project Documentation
├── package.json             # Root scripts (Monorepo-style)
├── docker-compose.yml       # Docker configuration (if applicable)
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL Database
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd family-planner
   ```

2. **Install dependencies:**

   ```bash
   # From root
   npm install

   # Install App dependencies
   cd src/app
   npm install

   # Install Server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in `src/server/` and `src/app/` (if needed) with the following variables:

   **Server (`src/server/.env`):**

   ```env
   PORT=4000
   DATABASE_URL=postgres://user:password@localhost:5432/family_planner
   JWT_SECRET=your_jwt_secret
   APP_SECRET_PASSWORD=your_app_password
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_SUBJECT=mailto:your@email.com
   CRON_SECRET=your_cron_secret
   ```

4. **Run the Application:**

   You can run both client and server concurrently from the root:

   ```bash
   npm run dev
   ```

   - Frontend will theoretically run on `http://localhost:5173`
   - Backend will run on `http://localhost:4000`

## 📚 Documentation Index

- [Architecture & Design](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Database Schema](./DB_SCHEMA.md)
- [Frontend Guide](./FRONTEND.md)
