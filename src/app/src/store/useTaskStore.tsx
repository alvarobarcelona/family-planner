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
  date: string; // YYYY-MM-DD
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

// Miembros de la familia usados en el frontend
const familyMembersMap: Record<string, Assignee> = {
  mama: { id: "mama", name: "Maria", color: "#f97316" },
  papa: { id: "papa", name: "Alvaro", color: "#22c55e" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

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
    (async () => {
      try {
        const created = await createTasks({
          title: input.title.trim(),
          date: input.date,
          time: input.time,
          assigneeId: input.assigneeId,
          priority: input.priority,
          recurrence: input.recurrence,
          description: input.description?.trim() || undefined,
        });

        // `created` es un array de Task que viene del backend
        setTasks((prev) => [...prev, ...created]);
      } catch (err) {
        console.error("Error al crear tarea(s)", err);
        
      }
    })();
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
