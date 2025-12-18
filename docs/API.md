# API Reference

**Base URL**: `/api`

All protected routes require header:
`Authorization: Bearer <token>`

## 🔐 Authentication

### Login

**POST** `/login`

- **Body**: `{ "password": "your_password" }`
- **Response**: `{ "token": "jwt_token_string" }`

### Get VAPID Key

**GET** `/vapid-public-key`

- **Response**: `{ "publicKey": "..." }`
- Used for registering the service worker for push notifications.

---

## 📋 Tasks

### Get All Tasks

**GET** `/tasks`

- **Description**: Returns all tasks in the database.
- **Response**: `Array<Task>`

```json
[
  {
    "id": "uuid",
    "title": "Buy Milk",
    "date": "2023-10-25",
    "priority": "HIGH",
    "assignees": [...],
    ...
  }
]
```

### Create Task(s)

**POST** `/tasks`

- **Description**: Creates one or more tasks. Handles recurrence logic (Daily, Weekly, Monthly) and Date Ranges automatically by generating multiple task records.
- **Body**:

```json
{
  "title": "Gym",
  "date": "2023-10-25",
  "time": "18:00",
  "assigneeId": "papa",
  "priority": "MEDIUM",
  "recurrence": "WEEKLY",
  "notificationTime": 30, // minutes
  "color": "#ff0000"
}
```

### Update Task

**PUT** `/tasks/:id`

- **Description**: Updates a single task or a series.
- **Query Params**:
  - `updateAll=true` (Optional): If present, updates all tasks sharing the same `seriesId`.
- **Body**: Same as Create Task input.

### Delete Task

**DELETE** `/tasks/:id`

- **Query Params**:
  - `deleteAll=true` (Optional): Deletes all tasks in the series.

### Toggle Completion

**PUT** `/tasks/:id` (Currently reuses Update logic or specific partial update)

- Frontend implementation manually toggles `isCompleted` and sends the full task object to the update endpoint.

---

## 🔔 Notifications & Subscriptions

### Subscribe to Push

**POST** `/subscribe`

- **Body**:

```json
{
  "subscription": { "endpoint": "...", "keys": {...} },
  "familyMemberIds": ["mama", "papa"]
}
```

### Unsubscribe

**POST** `/unsubscribe`

- **Body**: `{ "endpoint": "..." }`

### Trigger Notification Check (Cron)

**GET** `/cron/check-notifications`

- **Headers**: `Authorization: Bearer <CRON_SECRET>`
- **Description**: Manually triggers the notification check logic.
