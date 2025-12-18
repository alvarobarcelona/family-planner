# Database Schema

The application uses **PostgreSQL**. The schema is initialized automatically in `src/server/src/index.ts` (`initDb` function).

## Tables

### 1. `households`

Grouping entity for family members.
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | TEXT | E.g., "Familia Barcelona" |
| `created_at` | TIMESTAMPTZ | Default `now()` |

### 2. `family_members`

Individual users who can be assigned tasks.
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | PK (e.g., "mama", "papa") |
| `household_id` | UUID | FK -> `households.id` |
| `name` | TEXT | Display name |
| `color` | TEXT | Hex color code |
| `created_at` | TIMESTAMPTZ | Default `now()` |

### 3. `tasks`

The core entity. Recurring tasks are stored as _individual rows_ for easier querying, linked by `series_id`.
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `title` | TEXT | Task name |
| `date` | DATE | Date of the event (YYYY-MM-DD) |
| `end_date` | DATE | (Optional) For multi-day ranges |
| `time_label` | TEXT | Time string (HH:mm) |
| `priority` | TEXT | 'LOW', 'MEDIUM', 'HIGH' |
| `recurrence` | TEXT | 'NONE', 'DAILY', 'WEEKLY', etc. |
| `description` | TEXT | Optional details |
| `assignees` | JSONB | Snapshot of assigned members |
| `series_id` | TEXT | Links recurring tasks together |
| `days_of_week` | INTEGER[] | For Custom Weekly recurrence |
| `duration_weeks`| INTEGER | For Custom Weekly recurrence |
| `notification_time` | INTEGER | Minutes before event to notify |
| `notification_sent` | BOOLEAN | `true` if push sent |
| `is_completed` | BOOLEAN | `true` if done |
| `created_by` | TEXT | Name of creator |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### 4. `push_subscriptions`

Stores browser Web Push endpoints.
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `household_id` | UUID | FK -> `households.id` |
| `family_member_ids` | TEXT[] | Array of member IDs this device subscribes to |
| `endpoint` | TEXT | Unique push URL |
| `keys` | JSONB | Auth/P256dh keys |
| `user_agent` | TEXT | Device info |
| `is_active` | BOOLEAN | |
| `last_used_at` | TIMESTAMPTZ | Last time a notif was sent |
