import cors from "cors";
import express from "express";
import { pool } from "./db";

const app = express();

app.use(express.json());

// Tipos compartidos con el frontend
type Priority = "LOW" | "MEDIUM" | "HIGH";
type Recurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

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
  mama: { id: "mama", name: "Mamá", color: "#f97316" },
  papa: { id: "papa", name: "Papá", color: "#22c55e" },
  hugo: { id: "hugo", name: "Hugo", color: "#3b82f6" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

// "BBDD" en memoria
let tasks: Task[] = [];

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

// CORS: permitir frontend local + Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "https://family-planner-tau.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

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




// ---- RUTAS ----

// GET todas las tareas
app.get("/api/tasks", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, date, time_label, priority, recurrence, description, assignees
      FROM tasks
      ORDER BY date, time_label NULLS FIRST, title;
    `);

    const rows = result.rows;

    const tasks: Task[] = rows.map((row): {
      id: any; title: any; date: any; // YYYY-MM-DD
      timeLabel: any; priority: any; recurrence: any; description: any; assignees: any;
    } => ({
      id: row.id,
      title: row.title,
      date: row.date.toISOString().slice(0, 10), // YYYY-MM-DD
      timeLabel: row.time_label ?? undefined,
      priority: row.priority,
      recurrence: row.recurrence ?? undefined,
      description: row.description ?? undefined,
      assignees: row.assignees, // jsonb → array de { id, name, color }
    }));

    res.json(tasks);
  } catch (err) {
    console.error("Error en GET /api/tasks", err);
    res.status(500).json({ message: "Error interno" });
  }
});


// POST crear tarea(s) con recurrencia
app.post("/api/tasks", async (req, res) => {
  const {
    title,
    date,
    time,
    assigneeId,
    priority,
    recurrence,
    description,
  } = req.body as {
    title?: string;
    date?: string;
    time?: string;
    assigneeId?: string;
    priority?: Priority;
    recurrence?: Recurrence;
    description?: string;
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

  // tarea base
  tasksToAdd.push({
    ...base,
    id: crypto.randomUUID?.() ?? Date.now().toString(),
  });

  if (recurrence === "DAILY") {
    for (let i = 1; i <= 6; i++) {
      tasksToAdd.push({
        ...base,
        id: crypto.randomUUID?.() ?? `${Date.now()}-d${i}`,
        date: addDays(date, i),
      });
    }
  } else if (recurrence === "WEEKLY") {
    for (let i = 1; i <= 3; i++) {
      tasksToAdd.push({
        ...base,
        id: crypto.randomUUID?.() ?? `${Date.now()}-w${i}`,
        date: addDays(date, i * 7),
      });
    }
  } else if (recurrence === "MONTHLY") {
    for (let i = 1; i <= 11; i++) {
      tasksToAdd.push({
        ...base,
        id: crypto.randomUUID?.() ?? `${Date.now()}-m${i}`,
        date: addMonths(date, i),
      });
    }
  }

  try {
    // Insertar todas las tareas en DB
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


// DELETE tarea por id
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


// Servidor
/* const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); */
