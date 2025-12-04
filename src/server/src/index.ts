//dotenv debe ir al principio de todos los archivos
import "dotenv/config";
import path from "path";
import cors from "cors";
import express from "express";
import { randomUUID } from "crypto";
import { pool } from "./db";
import jwt from "jsonwebtoken";
import { sendNotification } from "./services/pushService";



// Try explicit load if missing
if (!process.env.VAPID_PUBLIC_KEY) {
  const envPath = path.resolve(process.cwd(), ".env");
  require("dotenv").config({ path: envPath });
 
}

const app = express();

app.use(express.json());

// Tipos
type Priority = "LOW" | "MEDIUM" | "HIGH";
type Recurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM_WEEKLY";

interface Assignee {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  timeLabel?: string;
  assignees: Assignee[];
  priority: Priority;
  recurrence?: Recurrence;
  description?: string;
  seriesId?: string;
  daysOfWeek?: number[];
  durationWeeks?: number;
  notificationTime?: number; // minutes before event
  color?: string;
}

// Mock de miembros de la familia
const familyMembers: Record<string, Assignee> = {
  mama: { id: "mama", name: "Maria", color: "#f97316" },
  papa: { id: "papa", name: "Alvaro", color: "#22c55e" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

// Helpers de fechas
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://family-planner-tau.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Auth Middleware
const APP_SECRET_PASSWORD = process.env.APP_SECRET_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

if (!APP_SECRET_PASSWORD) {
  console.warn(
    "WARNING: APP_SECRET_PASSWORD is not set in environment variables."
  );
}

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Login Endpoint
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === APP_SECRET_PASSWORD) {
    const token = jwt.sign({ role: "family" }, JWT_SECRET, {
      expiresIn: "365d",
    });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Contraseña incorrecta" });
});

// GET Public VAPID Key
app.get("/api/vapid-public-key", (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST Subscribe to Push Notifications
app.post("/api/subscribe", async (req, res) => {
  const { subscription, familyMemberId } = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: "Invalid subscription" });
  }

  const householdId = "00000000-0000-0000-0000-000000000000"; // Default household

  try {
    await pool.query(
      `
      INSERT INTO push_subscriptions (id, household_id, family_member_id, endpoint, keys, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (endpoint) DO UPDATE
      SET family_member_id = EXCLUDED.family_member_id,
          last_used_at = now(),
          is_active = true
    `,
      [
        randomUUID(),
        householdId,
        familyMemberId || null,
        subscription.endpoint,
        JSON.stringify(subscription.keys),
        req.headers["user-agent"],
      ]
    );

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    console.error("Error subscribing:", err);
    res.status(500).json({ message: "Error subscribing" });
  }
});

// Init DB
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          uuid PRIMARY KEY,
      title       text        NOT NULL,
      date        date        NOT NULL,
      time_label  text,
      priority    text        NOT NULL,
      recurrence  text,
      description text,
      assignees   jsonb       NOT NULL,
      series_id   text,
      days_of_week integer[],
      duration_weeks integer
    );
  `);

  // Add notification_time column if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS notification_time integer;
    `);
  } catch (err) {
    console.log(
      "Column notification_time might already exist or error adding it:",
      err
    );
  }

  // Add color column if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS color text;
    `);
  } catch (err) {
    console.log("Column color might already exist or error adding it:", err);
  }

  // Add notification_sent column if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS notification_sent boolean DEFAULT false;
    `);
  } catch (err) {
    console.log(
      "Column notification_sent might already exist or error adding it:",
      err
    );
  }
  // 1. Households
  await pool.query(`
    CREATE TABLE IF NOT EXISTS households (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  // 2. Family Members
  await pool.query(`
    CREATE TABLE IF NOT EXISTS family_members (
      id text PRIMARY KEY,
      household_id uuid NOT NULL REFERENCES households(id),
      name text NOT NULL,
      color text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  // 3. Push Subscriptions
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id uuid PRIMARY KEY,
      household_id uuid NOT NULL REFERENCES households(id),
      family_member_id text REFERENCES family_members(id),
      endpoint text UNIQUE NOT NULL,
      keys jsonb NOT NULL,
      user_agent text,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_used_at timestamptz,
      is_active boolean NOT NULL DEFAULT true
    );
  `);

  // Seed Data
  const householdId = "00000000-0000-0000-0000-000000000000"; // Fixed ID for simplicity

  // Check if household exists
  const householdRes = await pool.query(
    "SELECT id FROM households WHERE id = $1",
    [householdId]
  );
  if (householdRes.rowCount === 0) {
    await pool.query("INSERT INTO households (id, name) VALUES ($1, $2)", [
      householdId,
      "Familia Barcelona",
    ]);
   
  }

  // Seed Members
  const members = [
    { id: "mama", name: "Maria", color: "#f97316" },
    { id: "papa", name: "Alvaro", color: "#22c55e" },
    { id: "familia", name: "Todos", color: "#6366f1" },
  ];

  for (const m of members) {
    const memberRes = await pool.query(
      "SELECT id FROM family_members WHERE id = $1",
      [m.id]
    );
    if (memberRes.rowCount === 0) {
      await pool.query(
        "INSERT INTO family_members (id, household_id, name, color) VALUES ($1, $2, $3, $4)",
        [m.id, householdId, m.name, m.color]
      );
      
    }
  }
}

initDb()
  .then(() => {
    const PORT = process.env.PORT ?? 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Start Scheduler
  
      setInterval(async () => {
        try {
          const now = new Date();
          const todayStr = now.toISOString().slice(0, 10);

          const result = await pool.query(
            `
            SELECT * FROM tasks 
            WHERE date >= $1 
            AND notification_time IS NOT NULL 
            AND time_label IS NOT NULL
            AND (notification_sent IS NULL OR notification_sent = false)
          `,
            [todayStr]
          );

          for (const task of result.rows) {
            const [hours, minutes] = task.time_label.split(":").map(Number);

            // Construct target date in local time
            // We assume task.date is a Date object (midnight) or string YYYY-MM-DD
            let dateStr = "";
            if (task.date instanceof Date) {
              // Adjust for timezone offset issues if pg returns UTC midnight
              // Better to use the string representation from DB if possible, but pg parses it.
              // Let's format it manually to YYYY-MM-DD
              const y = task.date.getFullYear();
              const m = String(task.date.getMonth() + 1).padStart(2, "0");
              const d = String(task.date.getDate()).padStart(2, "0");
              dateStr = `${y}-${m}-${d}`;
            } else {
              dateStr = task.date;
            }

            const targetDate = new Date(`${dateStr}T${task.time_label}:00`);

            // Subtract notification time
            const notifyTime = new Date(
              targetDate.getTime() - task.notification_time * 60000
            );

            const diff = now.getTime() - notifyTime.getTime();

            // Check if within last 60 seconds
            if (diff >= 0 && diff < 60000) {
              console.log(`Sending notification for task: ${task.title}`);

              const householdId = "00000000-0000-0000-0000-000000000000";
              const assignees = task.assignees;
              const assigneeIds = assignees.map((a: any) => a.id);

              const subsRes = await pool.query(
                `
                SELECT * FROM push_subscriptions 
                WHERE household_id = $1 
                AND (family_member_id = ANY($2) OR family_member_id IS NULL)
              `,
                [householdId, assigneeIds]
              );

              for (const sub of subsRes.rows) {
                const payload = {
                  title: `Recordatorio: ${task.title}`,
                  body: `Comienza en ${task.notification_time} minutos`,
                  url: "/",
                  icon: "/icon-192x192.png",
                };

                // Construct subscription object expected by web-push
                const pushSub = {
                  endpoint: sub.endpoint,
                  keys: sub.keys,
                };

                await sendNotification(pushSub, payload);
              }

              await pool.query(
                "UPDATE tasks SET notification_sent = true WHERE id = $1",
                [task.id]
              );
            }
          }
        } catch (err) {
          console.error("Scheduler error:", err);
        }
      }, 60000); // Check every minute
    });
  })
  .catch((err) => {
    console.error("Error inicializando la BBDD", err);
    process.exit(1);
  });

// GET todas las tareas
app.get("/api/tasks", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, date, time_label, priority, recurrence, description, assignees, series_id, days_of_week, duration_weeks, notification_time, color
      FROM tasks
      ORDER BY date, time_label NULLS FIRST, title;
    `);

    const rows = result.rows as any[];

    const tasks: Task[] = rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      date: row.date as string, // "YYYY-MM-DD"
      timeLabel: (row.time_label ?? undefined) as string | undefined,
      priority: row.priority as Priority,
      recurrence: (row.recurrence ?? undefined) as Recurrence | undefined,
      description: (row.description ?? undefined) as string | undefined,
      assignees: row.assignees as Assignee[],
      seriesId: (row.series_id ?? undefined) as string | undefined,
      daysOfWeek: (row.days_of_week ?? undefined) as number[] | undefined,
      durationWeeks: (row.duration_weeks ?? undefined) as number | undefined,
      notificationTime: (row.notification_time ?? undefined) as
        | number
        | undefined,
      color: (row.color ?? undefined) as string | undefined,
    }));

    res.json(tasks);
  } catch (err) {
    console.error("Error en GET /api/tasks", err);
    res.status(500).json({ message: "Error interno" });
  }
});

// POST crear tarea(s)
app.post("/api/tasks", authMiddleware, async (req, res) => {
  const {
    title,
    date,
    time,
    assigneeId,
    priority,
    recurrence,
    description,
    daysOfWeek,
    durationWeeks,
    notificationTime,
    color,
  } = req.body as {
    title?: string;
    date?: string;
    time?: string;
    assigneeId?: string;
    priority?: Priority;
    recurrence?: Recurrence;
    description?: string;
    daysOfWeek?: number[];
    durationWeeks?: number;
    seriesId?: string;
    notificationTime?: number;
    color?: string;
  };

  if (!title || !date || !assigneeId || !priority || !recurrence) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const member = familyMembers[assigneeId];
  if (!member) {
    return res.status(400).json({ message: "Miembro de familia no válido" });
  }

  const base: Omit<Task, "id"> = {
    title: title.trim(),
    date,
    timeLabel: time || undefined,
    priority,
    assignees: [member],
    recurrence,
    description: description?.trim() || undefined,
    seriesId: recurrence !== "NONE" ? randomUUID() : undefined,
    daysOfWeek,
    durationWeeks,
    notificationTime,
    color,
  };

  const tasksToAdd: Task[] = [];

  if (
    recurrence === "CUSTOM_WEEKLY" &&
    Array.isArray(daysOfWeek) &&
    daysOfWeek.length
  ) {
    const weeks = durationWeeks && durationWeeks > 0 ? durationWeeks : 4;

    for (let week = 0; week < weeks; week++) {
      for (const weekday of daysOfWeek) {
        const jsTarget = weekday === 7 ? 0 : weekday;

        const baseDate = new Date(date);
        baseDate.setHours(12, 0, 0, 0);
        baseDate.setDate(baseDate.getDate() + week * 7);

        const diff = (jsTarget - baseDate.getDay() + 7) % 7;
        baseDate.setDate(baseDate.getDate() + diff);

        const taskDate = baseDate.toISOString().slice(0, 10);

        tasksToAdd.push({
          ...base,
          id: randomUUID(),
          date: taskDate,
        });
      }
    }
  } else {
    const baseTask: Task = {
      ...base,
      id: randomUUID(),
    };
    tasksToAdd.push(baseTask);

    if (recurrence === "DAILY") {
      for (let i = 1; i <= 6; i++) {
        tasksToAdd.push({
          ...base,
          id: randomUUID(),
          date: addDays(date, i),
        });
      }
    } else if (recurrence === "WEEKLY") {
      for (let i = 1; i <= 3; i++) {
        tasksToAdd.push({
          ...base,
          id: randomUUID(),
          date: addDays(date, i * 7),
        });
      }
    } else if (recurrence === "MONTHLY") {
      for (let i = 1; i <= 11; i++) {
        tasksToAdd.push({
          ...base,
          id: randomUUID(),
          date: addMonths(date, i),
        });
      }
    }
  }

  try {
    const insertPromises = tasksToAdd.map((t) =>
      pool.query(
        `
        INSERT INTO tasks (id, title, date, time_label, priority, recurrence, description, assignees, series_id, days_of_week, duration_weeks, notification_time, color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
        [
          t.id,
          t.title,
          t.date,
          t.timeLabel ?? null,
          t.priority,
          t.recurrence ?? null,
          t.description ?? null,
          JSON.stringify(t.assignees),
          t.seriesId ?? null,
          t.daysOfWeek ?? null,
          t.durationWeeks ?? null,
          t.notificationTime ?? null,
          t.color ?? null,
        ]
      )
    );

    await Promise.all(insertPromises);

    res.status(201).json(tasksToAdd);
  } catch (err) {
    console.error("Error en POST /api/tasks", err);
    res.status(500).json({ message: "Error interno" });
  }
});

// PUT actualizar tarea
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { updateAll } = req.query;
  const {
    title,
    date,
    time,
    assigneeId,
    priority,
    recurrence,
    description,
    daysOfWeek,
    durationWeeks,
    notificationTime,
    color,
  } = req.body as {
    title?: string;
    date?: string;
    time?: string;
    assigneeId?: string;
    priority?: Priority;
    recurrence?: Recurrence;
    description?: string;
    daysOfWeek?: number[];
    durationWeeks?: number;
    notificationTime?: number;
    color?: string;
  };

  if (!title || !date || !assigneeId || !priority) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const member = familyMembers[assigneeId];
  if (!member) {
    return res.status(400).json({ message: "Miembro de familia no válido" });
  }

  try {
    // SERIES UPDATE
    if (updateAll === "true") {
      const taskRes = await pool.query(
        "SELECT series_id FROM tasks WHERE id = $1",
        [id]
      );
      if ((taskRes.rowCount ?? 0) > 0 && taskRes.rows[0].series_id) {
        const seriesId = taskRes.rows[0].series_id;

        // 1. Delete old series
        await pool.query("DELETE FROM tasks WHERE series_id = $1", [seriesId]);

        // 2. Generate new tasks
        // Reuse logic from POST (simplified for now by duplicating, ideally refactor to helper)
        const base: Omit<Task, "id"> = {
          title: title.trim(),
          date,
          timeLabel: time || undefined,
          priority,
          assignees: [member],
          recurrence,
          description: description?.trim() || undefined,
          seriesId, // Keep same series ID
          daysOfWeek,
          durationWeeks,
          notificationTime,
          color,
        };

        const tasksToAdd: Task[] = [];

        if (
          recurrence === "CUSTOM_WEEKLY" &&
          Array.isArray(daysOfWeek) &&
          daysOfWeek.length
        ) {
          const weeks = durationWeeks && durationWeeks > 0 ? durationWeeks : 4;
          for (let week = 0; week < weeks; week++) {
            for (const weekday of daysOfWeek) {
              const jsTarget = weekday === 7 ? 0 : weekday;
              const baseDate = new Date(date);
              baseDate.setHours(12, 0, 0, 0);
              baseDate.setDate(baseDate.getDate() + week * 7);
              const diff = (jsTarget - baseDate.getDay() + 7) % 7;
              baseDate.setDate(baseDate.getDate() + diff);
              const taskDate = baseDate.toISOString().slice(0, 10);
              tasksToAdd.push({ ...base, id: randomUUID(), date: taskDate });
            }
          }
        } else {
          // Normal recurrence logic
          const baseTask: Task = { ...base, id: randomUUID() };
          tasksToAdd.push(baseTask);
          if (recurrence === "DAILY") {
            for (let i = 1; i <= 6; i++) {
              tasksToAdd.push({
                ...base,
                id: randomUUID(),
                date: addDays(date, i),
              });
            }
          } else if (recurrence === "WEEKLY") {
            for (let i = 1; i <= 3; i++) {
              tasksToAdd.push({
                ...base,
                id: randomUUID(),
                date: addDays(date, 7 * i),
              });
            }
          } else if (recurrence === "MONTHLY") {
            for (let i = 1; i <= 11; i++) {
              tasksToAdd.push({
                ...base,
                id: randomUUID(),
                date: addMonths(date, i),
              });
            }
          }
        }

        // Insert all
        const insertPromises = tasksToAdd.map((t) =>
          pool.query(
            `INSERT INTO tasks (id, title, date, time_label, priority, recurrence, description, assignees, series_id, days_of_week, duration_weeks, notification_time, color)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              t.id,
              t.title,
              t.date,
              t.timeLabel ?? null,
              t.priority,
              t.recurrence ?? null,
              t.description ?? null,
              JSON.stringify(t.assignees),
              t.seriesId ?? null,
              t.daysOfWeek ?? null,
              t.durationWeeks ?? null,
              t.notificationTime ?? null,
              t.color ?? null,
            ]
          )
        );
        await Promise.all(insertPromises);

        // Return the first task or all? Let's return the first one to satisfy the client expecting a single task,
        // or we could return the list. The client currently expects a single Task return for update.
        // But since we refreshed the list in the client, it might not matter much what we return as long as it's valid.
        return res.json(tasksToAdd[0]);
      }
    }

    // SINGLE UPDATE
    const result = await pool.query(
      `
      UPDATE tasks
      SET title = $1, date = $2, time_label = $3, priority = $4, recurrence = $5, description = $6, assignees = $7, days_of_week = $8, duration_weeks = $9, notification_time = $10, color = $11
      WHERE id = $12
      RETURNING *
    `,
      [
        title.trim(),
        date,
        time || null,
        priority,
        recurrence || null,
        description?.trim() || null,
        JSON.stringify([member]),
        daysOfWeek ?? null,
        durationWeeks || null,
        notificationTime || null,
        color || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const row = result.rows[0];
    const updatedTask: Task = {
      id: row.id,
      title: row.title,
      date: row.date, // YYYY-MM-DD
      timeLabel: row.time_label ?? undefined,
      priority: row.priority as Priority,
      recurrence: row.recurrence ?? undefined,
      description: row.description ?? undefined,
      assignees: row.assignees as Assignee[],
      seriesId: row.series_id ?? undefined,
      daysOfWeek: row.days_of_week ?? undefined,
      durationWeeks: row.duration_weeks ?? undefined,
      notificationTime: row.notification_time ?? undefined,
      color: row.color ?? undefined,
    };

    res.json(updatedTask);
  } catch (err) {
    console.error("Error en PUT /api/tasks/:id", err);
    res.status(500).json({ message: "Error interno" });
  }
});

// DELETE
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { deleteAll } = req.query;

  try {
    if (deleteAll === "true") {
      // Get series_id first
      const taskRes = await pool.query(
        "SELECT series_id FROM tasks WHERE id = $1",
        [id]
      );
      if ((taskRes.rowCount ?? 0) > 0 && taskRes.rows[0].series_id) {
        const seriesId = taskRes.rows[0].series_id;
        await pool.query("DELETE FROM tasks WHERE series_id = $1", [seriesId]);
        return res.status(200).json({ ok: true });
      }
    }

    const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error en DELETE /api/tasks/:id", err);
    res.status(500).json({ message: "Error interno" });
  }
});
