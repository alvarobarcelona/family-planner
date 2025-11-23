import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// 🚫 No usamos API en MODO LOCAL
// import { getTasks, createTasks, deleteTask } from "../api/tasksApi";

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Recurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

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
  date: string;
  time?: string;
  assigneeId: string;
  priority: Priority;
  recurrence: Recurrence;
  description?: string;
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

// -----------------------------------------
//  MOCK DE FAMILIA
// -----------------------------------------

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
    title: "Pediatra Hugo",
    date: todayStr(),
    timeLabel: "09:30",
    priority: "HIGH",
    assignees: [familyMembersMap.mama, familyMembersMap.hugo],
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
    description: "Revisión rutinaria de los ojos",
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

// -----------------------------------------
//  HELPERS LOCAL — RECURRENCIA
// -----------------------------------------

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

// -----------------------------------------
//  PROVIDER — TODO LOCAL
// -----------------------------------------

export function TaskProvider({ children }: { children: ReactNode }) {
  // Carga desde localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return initialTasks;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialTasks;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  // Guarda en localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* empty */
    }
  }, [tasks]);

  // -----------------------------------------
  //  ADD TASK LOCAL (con recurrencias)
  // -----------------------------------------

  const addTask = (input: CreateTaskInput) => {
    const member = familyMembersMap[input.assigneeId];
    if (!member) return;

    const base: Omit<Task, "id"> = {
      title: input.title.trim(),
      date: input.date,
      timeLabel: input.time,
      assignees: [member],
      priority: input.priority,
      recurrence: input.recurrence,
      description: input.description?.trim(),
    };

    const tasksToAdd: Task[] = [];

    // tarea original
    tasksToAdd.push({
      ...base,
      id: crypto.randomUUID?.() ?? Date.now().toString(),
    });

    
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

    setTasks((prev) => [...prev, ...tasksToAdd]);
  };

  // -----------------------------------------
  //  REMOVE TASK LOCAL
  // -----------------------------------------

  const removeTask = (id: string) => {
    const ok = window.confirm("¿Seguro que deseas borrar esta tarea?");
    if (!ok) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // -----------------------------------------
  //  TAREAS DE HOY
  // -----------------------------------------

  const tasksToday = useMemo(
    () => tasks.filter((t) => t.date === todayStr()),
    [tasks]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        tasksToday,
        addTask,
        familyMembers: Object.values(familyMembersMap),
        removeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

//  Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useTaskStore(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx)
    throw new Error("useTaskStore debe usarse dentro de <TaskProvider>");
  return ctx;
}
