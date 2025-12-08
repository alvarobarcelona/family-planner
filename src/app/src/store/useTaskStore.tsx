import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// API Imports
import { getTasks, createTasks, deleteTask, updateTask as apiUpdateTask } from "../api/tasksApi";


export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Recurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM_WEEKLY";

export interface Assignee {
  id: string;
  name: string;
  color: string;
}
export interface CreatedBy {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (start date)
  endDate?: string; // YYYY-MM-DD (end date for multi-day events)
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

export interface CreateTaskInput {
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  assigneeId: string;
  priority: Priority;
  recurrence: Recurrence;
  description?: string;
  daysOfWeek?: number[];
  durationWeeks?: number;
  notificationTime?: number;
  color?: string;
  createdBy: string;
}

interface TaskContextValue {
  tasks: Task[];
  tasksToday: Task[];
  addTask: (input: CreateTaskInput) => Promise<void>;
  familyMembers: Assignee[];
  removeTask: (id: string, deleteAll?: boolean) => Promise<void>;
  updateTask: (id: string, input: CreateTaskInput, updateAll?: boolean) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshTasks: () => Promise<void>;
  createdBy: CreatedBy[];
}

function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  // Take only the first 10 characters (YYYY-MM-DD)
  return dateStr.slice(0, 10);
}

// -----------------------------------------
//  MOCK DE FAMILIA
// -----------------------------------------

const familyMembersMap: Record<string, Assignee> = {
  mama: { id: "mama", name: "Maria", color: "#f97316" },
  papa: { id: "papa", name: "Alvaro", color: "#22c55e" },
  familia: { id: "familia", name: "Familia", color: "#6366f1" },
};

//Mock de createdBy
const createdByMap: Record<string, CreatedBy> = {
  default: { id: "default", name: "Sin Asignar" },
  mama: { id: "mama", name: "Maria" },
  papa: { id: "papa", name: "Alvaro" },
  familia: { id: "familia", name: "Familia" },
};


const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Function to load tasks - defined with useCallback to be exposed
  const load = useCallback(async () => {
    // Carga desde API
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      // Normalize dates
      const normalized = data.map(t => ({ ...t, date: normalizeDate(t.date) }));
      setTasks(normalized);
    } catch (err) {
      console.error("Error cargando tareas", err);
      setError("No se han podido cargar las tareas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    load();
  }, [load]);

  const addTask = async (input: CreateTaskInput) => {
    const member = familyMembersMap[input.assigneeId];
    if (!member) return;
    const createdByObj = createdByMap[input.createdBy];

    try {
      const created = await createTasks({
        ...input,
        createdBy: createdByObj?.name || input.createdBy
      });
      const normalized = created.map(t => ({ ...t, date: normalizeDate(t.date) }));
      setTasks((prev) => [...prev, ...normalized]);
    } catch (err) {
      console.error("Error creando tarea(s)", err);
      throw err;
    }
  };

  const removeTask = async (id: string, deleteAll?: boolean) => {
    try {
      await deleteTask(id, deleteAll);
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        if (deleteAll && target.seriesId) {
          return prev.filter((t) => t.seriesId !== target.seriesId);
        }
        return prev.filter((t) => t.id !== id);
      });
    } catch (err) {
      console.error("Error borrando tarea", err);
      throw err;
    }
  };

  const updateTask = async (id: string, input: CreateTaskInput, updateAll?: boolean) => {
    const member = familyMembersMap[input.assigneeId];
    if (!member) return;

    // createdBy validation removed to allow names
    // const createdBy = createdByMap[input.createdBy];
    // if (!createdBy) return;

    try {
      const result = await apiUpdateTask(id, input, updateAll);

      if (updateAll) {
        const allTasks = await getTasks();
        const normalized = allTasks.map(t => ({ ...t, date: normalizeDate(t.date) }));
        setTasks(normalized);
      } else {
        setTasks((prev) => prev.map((t) => {
          if (t.id === id) {
            const updated = result as Task;
            return { ...updated, date: normalizeDate(updated.date) };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error("Error actualizando tarea", err);
      throw err;
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      // Manually call the API with isCompleted toggled
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: task.title,
          date: task.date,
          endDate: task.endDate,
          time: task.timeLabel,
          assigneeId: task.assignees[0]?.id || "familia",
          priority: task.priority,
          recurrence: task.recurrence || "NONE",
          description: task.description,
          daysOfWeek: task.daysOfWeek,
          durationWeeks: task.durationWeeks,
          notificationTime: task.notificationTime,
          color: task.color,
          isCompleted: !task.isCompleted,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle completion");
      }

      // Update local state
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            return { ...t, isCompleted: !t.isCompleted };
          }
          return t;
        })
      );
    } catch (err) {
      console.error("Error toggling task completion", err);
      throw err;
    }
  };

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
        updateTask,
        toggleTaskCompletion,
        isLoading,
        refreshTasks: load, // Expose load as refreshTasks
        createdBy: Object.values(createdByMap),
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTaskStore(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx)
    throw new Error("useTaskStore debe usarse dentro de <TaskProvider>");
  return ctx;
}
