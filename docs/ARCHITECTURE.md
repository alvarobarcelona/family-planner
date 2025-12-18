# System Architecture

## 🏗 High-Level Design

The **Family Planner** follows a classic **Client-Server** architecture. The frontend is a Single Page Application (SPA) built with React, which communicates with a Node.js/Express backend via a RESTful API. The backend manages data persistence in a PostgreSQL database and handles asynchronous background tasks (notifications) via Cron jobs.

```mermaid
graph TD
    User[User Device] -->|HTTPS| CDM[CDN / Static Host]
    User -->|API Calls (JSON)| API[Node.js Express Server]

    subgraph "Frontend (PWA)"
        CDM -->|Serves| ReactApp[React App]
        ReactApp -->|Push Subscription| API
    end

    subgraph "Backend"
        API -->|Read/Write| DB[(PostgreSQL)]
        API -->|Trigger| Push[Web Push Service]
        Cron[Cron Job / Scheduler] -->|Trigger Checks| API
    end

    subgraph "External Services"
        Push -->|Send Notification| FCM[Firebase/Apple Push Service]
        FCM -->|Deliver| User
    end
```

## 🔄 Core Workflows

### 1. Authentication

- **Mechanism**: Weak password-based protection (Family Password).
- **Flow**:
  1. User enters the family shared password.
  2. Server validates against `APP_SECRET_PASSWORD`.
  3. Server issues a long-lived `JWT` (1 year).
  4. Client stores JWT in `localStorage` (`auth_token`).
  5. All subsequent requests include `Authorization: Bearer <token>`.

### 2. Task Synchronization

- **Fetch**: On load, the `TaskProvider` fetches all tasks from `GET /api/tasks`.
- **Create/Update**: Actions (Add, Edit, Delete) are sent to the API.
- **Optimistic UI**: The frontend updates the local store immediately (sometimes) or waits for the server response to ensure consistency.

### 3. Notification System

The notification system is a critical component designed to remind users of tasks.

- **Storage**: Subscription endpoints (browser push tokens) are stored in the `push_subscriptions` table.
- **Triggering**:
  - **Internal Scheduler**: A `setInterval` runs every 30 seconds on the server to check for tasks starting soon.
  - **External Cron**: An endpoint `GET /api/cron/check-notifications` exists to be called by external services (like cron-job.org) for reliability in serverless environments.
- **Logic**:
  1. Find tasks with `notification_time` set, where `notification_sent` is false.
  2. Calculate the trigger time (Start Time - Notification Time).
  3. If current time matches trigger time (within a window), send push notification.
  4. Notifications are routed to specific family members based on assignment, or all if generic.
  5. Mark task as `notification_sent = true`.

## 🌐 Timezone Handling

- **Storage**: Dates are stored as `YYYY-MM-DD` string in DB. Time is stored as string `HH:mm`.
- **Calculation**: creating a Date object requires careful handling of Timezones, specifically targeting **CET/CEST (Europe/Madrid)** rules in `getCETOffset` function to ensure notifications go out at the correct local time regardless of where the server is hosted (e.g., UTC server).

## 🔒 Security

- **CORS**: Configured to allow specific origins (localhost, Vercel deployment).
- **Environment Variables**: Sensitive keys (JWT, VAPID keys, DB credentials) are managed via `.env`.
