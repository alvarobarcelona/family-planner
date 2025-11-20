import cors from "cors";
import express from "express";

const app = express();

// NECESARIO para leer JSON en POST
app.use(express.json());

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

// GET tasks
app.get("/api/tasks", (req, res) => {
  res.json([]); 
});

// POST tasks
app.post("/api/tasks", (req, res) => {
  console.log("POST /api/tasks => body:", req.body);
  res.status(201).json({
    success: true,
    received: req.body,
  });
});

// DELETE tasks
app.delete("/api/tasks/:id", (req, res) => {
  console.log("DELETE /api/tasks/:id =>", req.params.id);
  res.status(200).json({ ok: true });
});

// Servidor
const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



/* config para testing backend en local

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

// Mock de miembros de la familia (más adelante: tabla en BBDD)
const familyMembers: Record<string, Assignee> = {
  mama: { id: "mama", name: "Mamá", color: "#f97316" },
  papa: { id: "papa", name: "Papá", color: "#22c55e" },
  hugo: { id: "hugo", name: "Hugo", color: "#3b82f6" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

// “BBDD” en memoria temporal (más adelante la pasamos a real)
let tasks: Task[] = [];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

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

// ---- ENDPOINTS ----

// miembros de la familia
app.get("/api/family-members", (_req, res) => {
  res.json(Object.values(familyMembers));
});

// todas las tareas
app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

// tareas de hoy
app.get("/api/tasks/today", (_req, res) => {
  const today = todayStr();
  const todayTasks = tasks.filter((t) => t.date === today);
  res.json(todayTasks);
});

// crear tarea (con recurrencia)
app.post("/api/tasks", (req, res) => {
  const { title, date, time, assigneeId, priority, recurrence, description } =
    req.body as {
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

  const base = {
    title: title.trim(),
    date,
    timeLabel: time || undefined,
    priority,
    assignees: [member],
    recurrence,
    description: description?.trim() || undefined,
  };

  const newTasks: Task[] = [];

  // tarea base
  newTasks.push({
    id: crypto.randomUUID?.() ?? Date.now().toString(),
    ...base,
  });

  // recurrencias igual que en el front
  if (recurrence === "DAILY") {
    for (let i = 1; i <= 6; i++) {
      newTasks.push({
        id: crypto.randomUUID?.() ?? `${Date.now()}-d${i}`,
        ...base,
        date: addDays(date, i),
      });
    }
  } else if (recurrence === "WEEKLY") {
    for (let i = 1; i <= 3; i++) {
      newTasks.push({
        id: crypto.randomUUID?.() ?? `${Date.now()}-w${i}`,
        ...base,
        date: addDays(date, i * 7),
      });
    }
  } else if (recurrence === "MONTHLY") {
    for (let i = 1; i <= 5; i++) {
      newTasks.push({
        id: crypto.randomUUID?.() ?? `${Date.now()}-m${i}`,
        ...base,
        date: addMonths(date, i),
      });
    }
  }

  tasks.push(...newTasks);

  res.status(201).json(newTasks);
});

// borrar tarea
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const prevLength = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);

  if (tasks.length === prevLength) {
    return res.status(404).json({ message: "Tarea no encontrada" });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
 */