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

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://family-planner-tau.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

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
  date: string; // YYYY-MM-DD (start date)
  endDate?: string; // YYYY-MM-DD (end date, optional for multi-day events)
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
  isCompleted?: boolean; // whether task is marked as done
  createdBy?: string;
  createdAt?: string;
}

// Mock de miembros de la familia
const familyMembers: Record<string, Assignee> = {
  mama: { id: "mama", name: "Maria", color: "#f97316" },
  papa: { id: "papa", name: "Alvaro", color: "#22c55e" },
  familia: { id: "familia", name: "Familia", color: "#6366f1" },
};

// Helper function to get Central European Time offset (UTC+1 or UTC+2)
function getCETOffset(date: Date): number {
  // CET (Central European Time) rules:
  // - Winter: UTC+1 (60 minutes)
  // - Summer (DST): UTC+2 (120 minutes)
  // DST starts: Last Sunday of March at 2:00 AM
  // DST ends: Last Sunday of October at 3:00 AM

  const year = date.getFullYear();

  // Find last Sunday of March
  const marchLastDay = new Date(Date.UTC(year, 2, 31)); // March 31
  const marchLastSunday = new Date(marchLastDay);
  marchLastSunday.setUTCDate(31 - ((marchLastDay.getUTCDay() || 7) - 7));
  marchLastSunday.setUTCHours(1, 0, 0, 0); // 2:00 AM CET = 1:00 AM UTC

  // Find last Sunday of October
  const octoberLastDay = new Date(Date.UTC(year, 9, 31)); // October 31
  const octoberLastSunday = new Date(octoberLastDay);
  octoberLastSunday.setUTCDate(31 - ((octoberLastDay.getUTCDay() || 7) - 7));
  octoberLastSunday.setUTCHours(1, 0, 0, 0); // 3:00 AM CEST = 1:00 AM UTC

  // Check if date is in DST period
  const isDST = date >= marchLastSunday && date < octoberLastSunday;

  return isDST ? 120 : 60; // 120 minutes (UTC+2) in summer, 60 minutes (UTC+1) in winter
}

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

// Cron Job Endpoint - for external cron services to trigger notification checks
app.get("/api/cron/check-notifications", async (req, res) => {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return res.status(500).json({
      error: "CRON_SECRET not configured on server",
    });
  }

  const providedSecret = authHeader?.replace("Bearer ", "");

  if (providedSecret !== cronSecret) {
    return res.status(401).json({
      error: "Unauthorized - Invalid cron secret",
    });
  }

  try {
    const result = await checkAndSendNotifications();
    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      notificationsSent: result.sent,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check notifications",
    });
  }
});

// POST Subscribe to Push Notifications
app.post("/api/subscribe", async (req, res) => {
  const { subscription, familyMemberId, familyMemberIds } = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: "Invalid subscription" });
  }

  const householdId = "00000000-0000-0000-0000-000000000000"; // Default household

  // Normalize familyMemberIds
  let finalFamilyMemberIds: string[] = [];
  if (Array.isArray(familyMemberIds)) {
    finalFamilyMemberIds = familyMemberIds;
  } else if (familyMemberId) {
    finalFamilyMemberIds = [familyMemberId];
  }

  try {
    await pool.query(
      `
      INSERT INTO push_subscriptions (id, household_id, family_member_id, family_member_ids, endpoint, keys, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (endpoint) DO UPDATE
      SET family_member_ids = EXCLUDED.family_member_ids,
          family_member_id = EXCLUDED.family_member_id, -- Keep updating legacy column for now
          last_used_at = now(),
          is_active = true
    `,
      [
        randomUUID(),
        householdId,
        finalFamilyMemberIds.length > 0 ? finalFamilyMemberIds[0] : null, // Legacy support: pick first one
        finalFamilyMemberIds,
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

// POST Unsubscribe from Push Notifications
app.post("/api/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ message: "Endpoint required" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM push_subscriptions WHERE endpoint = $1",
      [endpoint]
    );

    if (result.rowCount === 0) {
      // It's okay if it didn't exist, we achieved the goal: it's not there anymore.
      // But maybe we want to know? mostly irrelevent for client.
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (err) {
    console.error("Error unsubscribing:", err);
    res.status(500).json({ message: "Error unsubscribing" });
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

  // Add end_date column if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS end_date date;
    `);
  } catch (err) {
    console.log("Column end_date might already exist or error adding it:", err);
  }

  // Add is_completed column if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false;
    `);
  } catch (err) {
    console.log(
      "Column is_completed might already exist or error adding it:",
      err
    );
  }

  // Add created_by column
  try {
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS created_by text;
    `);
  } catch (err) {
    console.log(
      "Column created_by might already exist or error adding it:",
      err
    );
  }

  // Add created_at column
  try {
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
    `);
  } catch (err) {
    console.log(
      "Column created_at might already exist or error adding it:",
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

  // Add family_member_ids column if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE push_subscriptions 
      ADD COLUMN IF NOT EXISTS family_member_ids text[];
    `);

    // Migration: If we have family_member_id but empty family_member_ids, copy it over.
    await pool.query(`
        UPDATE push_subscriptions
        SET family_member_ids = ARRAY[family_member_id]
        WHERE family_member_ids IS NULL AND family_member_id IS NOT NULL;
    `);
  } catch (err) {
    console.log("Error adding family_member_ids or migrating:", err);
  }

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

// Notification Checker Function (used by scheduler and cron job)
async function checkAndSendNotifications(): Promise<{
  sent: number;
  errors: number;
}> {
  let sentCount = 0;
  let errorCount = 0;

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

      // Construct target date in Europe/Madrid timezone
      let dateStr = "";
      if (task.date instanceof Date) {
        const y = task.date.getFullYear();
        const m = String(task.date.getMonth() + 1).padStart(2, "0");
        const d = String(task.date.getDate()).padStart(2, "0");
        dateStr = `${y}-${m}-${d}`;
      } else {
        dateStr = task.date;
      }

      // Create date in Europe/Madrid timezone (CET/CEST)
      // Parse the date components
      const [year, month, day] = dateStr.split("-").map(Number);

      // Create a date in UTC, then adjust for CET timezone
      const utcDate = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0)
      );

      // Get the correct timezone offset (60 or 120 minutes) based on DST
      const cetOffsetMinutes = getCETOffset(utcDate);
      const targetDate = new Date(utcDate.getTime() - cetOffsetMinutes * 60000);

      // Subtract notification time
      const notifyTime = new Date(
        targetDate.getTime() - task.notification_time * 60000
      );

      const diff = now.getTime() - notifyTime.getTime();

      // Check if within last 30 seconds (matching scheduler interval)
      if (diff >= 0 && diff < 30000) {
        console.log(`Sending notification for task: ${task.title}`);

        const householdId = "00000000-0000-0000-0000-000000000000";
        const assignees = task.assignees;
        const assigneeIds = assignees.map((a: any) => a.id);

        /**
         * Logic update: check if any of the assigneeIds are present in the subscription's family_member_ids
         * using the Postgres overlap operator '&&' or checking if 'family_member_ids' contains any of the assigneeIds.
         *
         * Also fallback for older records: OR family_member_id = ANY($2)
         */
        const subsRes = await pool.query(
          `
          SELECT * FROM push_subscriptions 
          WHERE household_id = $1 
          AND is_active = true
          AND (
            family_member_ids && $2::text[] 
            OR 
            family_member_id = ANY($2::text[])
          );
        `,
          [householdId, assigneeIds]
        );

        for (const sub of subsRes.rows) {
          const payload = {
            title: `Evento: ${task.title}`,
            body: `Comienza en ${task.notification_time} minutos`,
            url: "/",
            icon: "/icon-192x192.png",
          };

          // Construct subscription object expected by web-push
          const pushSub = {
            endpoint: sub.endpoint,
            keys: sub.keys,
          };

          const success = await sendNotification(pushSub, payload);
          if (success) {
            sentCount++;
            // Update last_used_at to track when subscription was last used
            await pool.query(
              "UPDATE push_subscriptions SET last_used_at = now() WHERE endpoint = $1",
              [sub.endpoint]
            );
          } else {
            errorCount++;
          }
        }

        await pool.query(
          "UPDATE tasks SET notification_sent = true WHERE id = $1",
          [task.id]
        );
      }
    }
  } catch (err) {
    console.error("Notification check error:", err);
    errorCount++;
  }

  return { sent: sentCount, errors: errorCount };
}

initDb()
  .then(() => {
    const PORT = process.env.PORT ?? 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Start Scheduler

      // Start Scheduler (backup for when cron jobs work)
      setInterval(async () => {
        await checkAndSendNotifications();
      }, 30000); // Check every 30 seconds
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
      SELECT id, title, date, end_date, time_label, priority, recurrence, description, assignees, series_id, days_of_week, duration_weeks, notification_time, color, is_completed, created_by, created_at
      FROM tasks
      ORDER BY date, time_label NULLS FIRST, title;
    `);

    const rows = result.rows as any[];

    const tasks: Task[] = rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      date: row.date as string, // "YYYY-MM-DD"
      endDate: (row.end_date ?? undefined) as string | undefined,
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
      isCompleted: (row.is_completed ?? undefined) as boolean | undefined,
      createdBy: (row.created_by ?? undefined) as string | undefined,
      createdAt: (row.created_at ?? undefined) as string | undefined,
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
    endDate,
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
    endDate?: string;
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
    createdBy?: string;
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
    endDate,
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
    createdBy: req.body.createdBy,
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
  } else if (
    (!recurrence || recurrence === "NONE") &&
    endDate &&
    endDate > date
  ) {
    // RANGO DE FECHAS -> Convertir a serie diaria
    const start = new Date(date);
    const end = new Date(endDate);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Generate a new Series ID if not already present
    const rangeSeriesId = base.seriesId || randomUUID();

    for (let i = 0; i <= diffDays; i++) {
      tasksToAdd.push({
        ...base,
        id: randomUUID(),
        date: addDays(date, i),
        endDate: undefined,
        seriesId: rangeSeriesId,
        recurrence: "NONE",
      });
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
        INSERT INTO tasks (id, title, date, end_date, time_label, priority, recurrence, description, assignees, series_id, days_of_week, duration_weeks, notification_time, color, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `,
        [
          t.id,
          t.title,
          t.date,
          t.endDate ?? null,
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
          t.createdBy ?? null,
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
    endDate,
    time,
    assigneeId,
    priority,
    recurrence,
    description,
    daysOfWeek,
    durationWeeks,
    notificationTime,
    color,
    isCompleted,
  } = req.body as {
    title?: string;
    date?: string;
    endDate?: string;
    time?: string;
    assigneeId?: string;
    priority?: Priority;
    recurrence?: Recurrence;
    description?: string;
    daysOfWeek?: number[];
    durationWeeks?: number;
    notificationTime?: number;
    color?: string;
    isCompleted?: boolean;
  };

  if (!title || !date || !assigneeId || !priority) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const member = familyMembers[assigneeId];
  if (!member) {
    return res.status(400).json({ message: "Miembro de familia no válido" });
  }

  try {
    console.log("PUT /api/tasks/:id - Received isCompleted:", isCompleted);
    console.log("PUT /api/tasks/:id - Full body:", req.body);

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
        const base: Omit<Task, "id"> = {
          title: title.trim(),
          date,
          endDate,
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
        } else if (
          (!recurrence || recurrence === "NONE") &&
          endDate &&
          endDate > date
        ) {
          // RANGO DE FECHAS -> Convertir a serie diaria
          const start = new Date(date);
          const end = new Date(endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Reuse existing seriesId if available
          const rangeSeriesId = base.seriesId || randomUUID();

          for (let i = 0; i <= diffDays; i++) {
            tasksToAdd.push({
              ...base,
              id: randomUUID(),
              date: addDays(date, i),
              endDate: undefined,
              seriesId: rangeSeriesId,
              recurrence: "NONE",
            });
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
            `INSERT INTO tasks (id, title, date, end_date, time_label, priority, recurrence, description, assignees, series_id, days_of_week, duration_weeks, notification_time, color)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              t.id,
              t.title,
              t.date,
              t.endDate ?? null,
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

        return res.json(tasksToAdd[0]);
      }
    }

    // SINGLE UPDATE
    const result = await pool.query(
      `
      UPDATE tasks
      SET title = $1, date = $2, end_date = $3, time_label = $4, priority = $5, recurrence = $6, description = $7, assignees = $8, days_of_week = $9, duration_weeks = $10, notification_time = $11, color = $12, is_completed = $13
      WHERE id = $14
      RETURNING *
    `,
      [
        title.trim(),
        date,
        endDate || null,
        time || null,
        priority,
        recurrence || null,
        description?.trim() || null,
        JSON.stringify([member]),
        daysOfWeek ?? null,
        durationWeeks || null,
        notificationTime || null,
        color || null,
        isCompleted ?? null,
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
      endDate: row.end_date ?? undefined,
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
      isCompleted: row.is_completed ?? undefined,
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
