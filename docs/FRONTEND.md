# Frontend Documentation

## 📂 Directory Structure (`src/app/src`)

- **`api/`**: Contains `tasksApi.ts`. Wrapper functions around `fetch` to communicate with the backend. Handles token attachment.
- **`screens/`**: High-level Page Components.
  - `LoginScreen.tsx`: Entry point for authentication.
  - `HomeScreen.tsx`: "Hoy" (Today) view. List of tasks for specific day.
  - `VisualCalendarScreen.tsx` / `CalendarScreen.tsx`: Monthly/Weekly grid views.
  - `NewTaskScreen.tsx`: Form to create new tasks.
  - `EditTaskScreen.tsx`: Form to edit existing tasks.
- **`store/`**: Contains `useTaskStore.tsx`.
- **`App.tsx`**: Main Router definition and Navigation Bar layout.

## 🧩 Key Components & Concepts

### Task Context (`useTaskStore`)

The application uses a centered state management approach via React Context.

- **State**: `tasks` (Array of all tasks).
- **Actions**: `addTask`, `removeTask`, `updateTask`, `toggleTaskCompletion`.
- **Logic**:
  - **Normalization**: Ensures dates are always valid `YYYY-MM-DD` strings.
  - **Filtering**: `tasksToday` derivation for the Home screen.
  - **Optimistic Updates**: Context updates local state immediately for responsiveness, then syncs with API (or re-fetches).

### Navigation

Used `react-router-dom` with `NavLink` for the bottom tabs:

- `/`: Home (Today's tasks)
- `/calendar`: Visual Calendar
- `/new`: Create Task

### Styling

- **Tailwind CSS 4**: Utility-first CSS.
- **Color Coding**: Tasks are color-coded based on the assignee (e.g., Mom = Orange, Dad = Green).

## 📱 Mobile Considerations

- **Touch Targets**: Buttons and list items are sized for touch execution.
- **PWA**: The app is designed to be installable on mobile devices (manifest, service worker).
- **Safe Areas**: Padding added to accommodate mobile notches and home indicators.
