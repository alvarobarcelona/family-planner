import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

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
