import cors from "cors";
import express from "express";

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

// ---- RUTAS ----

// GET todas las tareas
app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

// POST crear tarea(s) con recurrencia
app.post("/api/tasks", (req, res) => {
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

  // Validación básica
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

  // Generar repeticiones igual que en el front
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

  // Guardar en "BBDD" en memoria
  tasks.push(...tasksToAdd);

  // devolver las tareas creadas
  return res.status(201).json(tasksToAdd);
});

// DELETE tarea por id
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const prevLength = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);

  if (tasks.length === prevLength) {
    return res.status(404).json({ message: "Tarea no encontrada" });
  }

  return res.status(200).json({ ok: true });
});

// Servidor
const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
