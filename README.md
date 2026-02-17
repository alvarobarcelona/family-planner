# Family Planner

A comprehensive family organization tool designed to help families manage their daily lives, from calendars and events to shopping lists and meal planning.

## Features

- **Dashboard**: At-a-glance view of today's events, meal plan, and recent updates.
- **Calendar & Agenda**: Manage family events with shared views (Monthly, Weekly, Agenda).
- **Task Management**: Assign tasks to family members with recurrent options.
- **Shopping List**: Shared shopping list with favorites and categories.
- **Family Wall**: Digital sticky notes for family messages.
- **Notifications**: Push notifications for events and tasks.
- **Multi-user Support**: distinct profiles for each family member (e.g., Mom, Dad, Kids).

## Screenshots

|                                  Login & Home                                  |                            Calendar & Agenda                             |
| :----------------------------------------------------------------------------: | :----------------------------------------------------------------------: |
|    <img src="./screenshots/LoginPlanner.JPG" width="400" /> <br> **Login**     | <img src="./screenshots/Calendar.JPG" width="400" /> <br> **Month View** |
| <img src="./screenshots/Home_today.JPG" width="400" /> <br> **Home Dashboard** | <img src="./screenshots/Agenda.jpg" width="400" /> <br> **Agenda View**  |

|                               Planning & Shopping                                |                                  Events                                  |
| :------------------------------------------------------------------------------: | :----------------------------------------------------------------------: |
|   <img src="./screenshots/Weekly_plan.JPG" width="400" /> <br> **Weekly Plan**   | <img src="./screenshots/New_event.JPG" width="400" /> <br> **New Event** |
| <img src="./screenshots/Shopping_list.JPG" width="400" /> <br> **Shopping List** |                                                                          |

## Tech Stack

**Frontend:**

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS v4](https://tailwindcss.com/)

**Backend:**

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Web-Push](https://www.npmjs.com/package/web-push) (for notifications)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd family-planner
   ```

2. **Setup the Server:**

   ```bash
   cd src/server
   npm install
   ```

   Create a `.env` file in `src/server` with the following variables:

   ```env
   PORT=4000
   DATABASE_URL=postgres://user:password@localhost:5432/family_planner
   JWT_SECRET=your_jwt_secret
   APP_SECRET_PASSWORD=your_app_password
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_EMAIL=mailto:your@email.com
   ```

3. **Setup the Client:**
   ```bash
   cd ../app
   npm install
   ```

### Running the Application

To run both frontend and backend concurrently (from root):

```bash
npm run dev
```

Or run them individually:

**Server:**

```bash
cd src/server
npm run dev
```

**Client:**

```bash
cd src/app
npm run dev
```

## Docker

The project includes a `docker-compose.yml` for containerized deployment.

```bash
docker-compose up -d
```
