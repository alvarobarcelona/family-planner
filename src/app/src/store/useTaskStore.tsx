import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { getTasks, createTasks, deleteTask } from "../api/tasksApi";

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Recurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY"| 'CUSTOM_WEEKLY';

export interface Assignee {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  timeLabel?: string;
  assignees: Assignee[];
  priority: Priority;
  recurrence?: Recurrence;
  description?: string;
}

export interface CreateTaskInput {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  assigneeId: string;
  priority: Priority;
  recurrence: Recurrence;
  description?: string;
  daysOfWeek?: number[];
  durationWeeks?: number;
}

interface TaskContextValue {
  tasks: Task[];
  tasksToday: Task[];
  addTask: (input: CreateTaskInput) => void;
  familyMembers: Assignee[];
  removeTask: (id: string) => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Miembros de la familia usados en el frontend
const familyMembersMap: Record<string, Assignee> = {
  mama: { id: "mama", name: "Maria", color: "#f97316" },
  papa: { id: "papa", name: "Alvaro", color: "#22c55e" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

// -----------------------------------------
//  MODO LOCAL — TAREAS INICIALES
// -----------------------------------------

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Pediatra Ariadna",
    date: todayStr(),
    timeLabel: "09:30",
    priority: "HIGH",
    assignees: [familyMembersMap.mama],
    recurrence: "NONE",
    description: "Revisión rutinaria de los ojos",
  },
  {
    id: "2",
    title: "Reunión en Kita",
    date: todayStr(),
    timeLabel: "16:00",
    priority: "MEDIUM",
    assignees: [familyMembersMap.papa],
    recurrence: "NONE",
    description: "Laternefest",
  },
  {
    id: "3",
    title: "Compra semanal",
    date: todayStr(),
    priority: "LOW",
    assignees: [familyMembersMap.familia],
    recurrence: "NONE",
    description: "Revisión rutinaria de los ojos",
  },
];

const STORAGE_KEY = "family-planner-tasks";

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  // Estado: se llena desde la API
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError("No se han podido cargar las tareas");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  
  const addTask = (input: CreateTaskInput) => {
  const member = familyMembersMap[input.assigneeId];
  if (!member) return;

  const base: Omit<Task, "id"> = {
    title: input.title.trim(),
    date: input.date,
    timeLabel: input.time || undefined,
    assignees: [member],
    priority: input.priority,
    recurrence: input.recurrence,
    description: input.description?.trim(),
  };

  const tasksToAdd: Task[] = [];

  // ---- CASO CUSTOM_WEEKLY (días concretos) ----
  if (
    input.recurrence === "CUSTOM_WEEKLY" &&
    Array.isArray(input.daysOfWeek) &&
    input.daysOfWeek.length > 0
  ) {
    const weeks =
      input.durationWeeks && input.durationWeeks > 0
        ? input.durationWeeks
        : 4; // por defecto 4 semanas

    for (let week = 0; week < weeks; week++) {
      for (const weekday of input.daysOfWeek) {
        const jsTarget = weekday === 7 ? 0 : weekday;

        const baseDate = new Date(input.date);
        baseDate.setHours(12, 0, 0, 0);
        baseDate.setDate(baseDate.getDate() + week * 7);

        const diff = (jsTarget - baseDate.getDay() + 7) % 7;
        baseDate.setDate(baseDate.getDate() + diff);

        const taskDate = baseDate.toISOString().slice(0, 10);

        tasksToAdd.push({
          ...base,
          id: crypto.randomUUID?.() ?? `${Date.now()}-cw-${week}-${weekday}`,
          date: taskDate,
        });
      }
    }
  } else {
    // ---- CASOS NORMALES (NONE / DAILY / WEEKLY / MONTHLY) ----

    // tarea original
    const baseTask: Task = {
      ...base,
      id: crypto.randomUUID?.() ?? Date.now().toString(),
    };
    tasksToAdd.push(baseTask);

    if (input.recurrence === "DAILY") {
      for (let i = 1; i <= 6; i++) {
        tasksToAdd.push({
          ...base,
          id: crypto.randomUUID?.() ?? `${Date.now()}-d${i}`,
          date: addDays(input.date, i),
        });
      }
    }

    if (input.recurrence === "WEEKLY") {
      for (let i = 1; i <= 3; i++) {
        tasksToAdd.push({
          ...base,
          id: crypto.randomUUID?.() ?? `${Date.now()}-w${i}`,
          date: addDays(input.date, 7 * i),
        });
      }
    }

    if (input.recurrence === "MONTHLY") {
      for (let i = 1; i <= 11; i++) {
        tasksToAdd.push({
          ...base,
          id: crypto.randomUUID?.() ?? `${Date.now()}-m${i}`,
          date: addMonths(input.date, i),
        });
      }
    }
  }

  setTasks((prev) => [...prev, ...tasksToAdd]);
};


  // Borrar tarea con confirmación + backend
  const removeTask = (id: string) => {
    const ok = window.confirm("¿Seguro que deseas borrar esta tarea?");
    if (!ok) return;

    (async () => {
      try {
        await deleteTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch (err) {
        console.error("Error al borrar tarea", err);
      }
    })();
  };

  const tasksToday = useMemo(
    () => tasks.filter((t) => t.date === todayStr()),
    [tasks]
  );

  const value: TaskContextValue = {
    tasks,
    tasksToday,
    addTask,
    familyMembers: Object.values(familyMembersMap),
    removeTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTaskStore(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskStore debe usarse dentro de <TaskProvider>");
  }
  return ctx;
}
