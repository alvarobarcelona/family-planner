import cors from "cors";
import express from "express";
import { randomUUID } from "crypto";
import { pool } from "./db";

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
  "https://family-planner-tau.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

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
      assignees   jsonb       NOT NULL
    );
  `);
}

initDb()
  .then(() => {
    const PORT = process.env.PORT ?? 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error inicializando la BBDD", err);
    process.exit(1);
  });

// GET todas las tareas
app.get("/api/tasks", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, date, time_label, priority, recurrence, description, assignees
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
    }));

    res.json(tasks);
  } catch (err) {
    console.error("Error en GET /api/tasks", err);
    res.status(500).json({ message: "Error interno" });
  }
});

// POST crear tarea(s)
app.post("/api/tasks", async (req, res) => {
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
  };

  const tasksToAdd: Task[] = [];

  if (recurrence === "CUSTOM_WEEKLY" && Array.isArray(daysOfWeek) && daysOfWeek.length) {
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
        INSERT INTO tasks (id, title, date, time_label, priority, recurrence, description, assignees)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

// DELETE
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
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
