import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// API Imports
import { getTasks, createTasks, deleteTask, updateTask as apiUpdateTask } from "../api/tasksApi";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useLocal = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Recurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM_WEEKLY";

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
  seriesId?: string;
  daysOfWeek?: number[];
  durationWeeks?: number;
}

export interface CreateTaskInput {
  title: string;
  date: string;
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
  addTask: (input: CreateTaskInput) => Promise<void>;
  familyMembers: Assignee[];
  removeTask: (id: string, deleteAll?: boolean) => Promise<void>;
  updateTask: (id: string, input: CreateTaskInput, updateAll?: boolean) => Promise<void>;
}

function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// -----------------------------------------
//  MOCK DE FAMILIA
// -----------------------------------------

const familyMembersMap: Record<string, Assignee> = {
  mama: { id: "mama", name: "Maria", color: "#f97316" },
  papa: { id: "papa", name: "Alvaro", color: "#22c55e" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

/* ============================================
   MODO LOCAL — SOLO PARA TESTING
   (Descomentado cuando VITE_USE_LOCAL_STORAGE=true)
   ============================================ */

/*
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

function generateSeriesTasks(
  input: CreateTaskInput,
  member: Assignee,
  existingSeriesId?: string
): Task[] {
  const seriesId =
    existingSeriesId ??
    (input.recurrence !== "NONE"
      ? crypto.randomUUID?.() ?? Date.now().toString()
      : undefined);

  const base: Omit<Task, "id"> = {
    title: input.title.trim(),
    date: input.date,
    timeLabel: input.time || undefined,
    assignees: [member],
    priority: input.priority,
    recurrence: input.recurrence,
    description: input.description?.trim(),
    seriesId,
    daysOfWeek: input.daysOfWeek,
    durationWeeks: input.durationWeeks,
  };

  const tasksToAdd: Task[] = [];

  if (
    input.recurrence === "CUSTOM_WEEKLY" &&
    Array.isArray(input.daysOfWeek) &&
    input.daysOfWeek.length > 0
  ) {
    const weeks =
      input.durationWeeks && input.durationWeeks > 0 ? input.durationWeeks : 4;

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

  return tasksToAdd;
}
*/

/* ============================================
   FIN MODO LOCAL
   ============================================ */

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      /* MODO LOCAL COMENTADO - Descomentar si VITE_USE_LOCAL_STORAGE=true
      if (useLocal) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setTasks(parsed);
              return;
            }
          }
          setTasks(initialTasks);
        } catch {
          setTasks(initialTasks);
        }
      } else {
      */
        // Carga desde API
        setIsLoading(true);
        setError(null);
        try {
          const data = await getTasks();
          if (!isMounted) return;
          setTasks(data);
        } catch (err) {
          console.error("Error cargando tareas", err);
          if (isMounted) setError("No se han podido cargar las tareas");
        } finally {
          if (isMounted) setIsLoading(false);
        }
      /* } */
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  /* MODO LOCAL COMENTADO - Descomentar si VITE_USE_LOCAL_STORAGE=true
  useEffect(() => {
    if (!useLocal) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // empty
    }
  }, [tasks]);
  */

  const addTask = async (input: CreateTaskInput) => {
    const member = familyMembersMap[input.assigneeId];
    if (!member) return;

    /* MODO LOCAL COMENTADO - Descomentar si VITE_USE_LOCAL_STORAGE=true
    if (useLocal) {
      const tasksToAdd = generateSeriesTasks(input, member);
      setTasks((prev) => [...prev, ...tasksToAdd]);
    } else {
    */
      try {
        const created = await createTasks(input);
        setTasks((prev) => [...prev, ...created]);
      } catch (err) {
        console.error("Error creando tarea(s)", err);
        throw err;
      }
    /* } */
  };

  const removeTask = async (id: string, deleteAll?: boolean) => {
    /* MODO LOCAL COMENTADO - Descomentar si VITE_USE_LOCAL_STORAGE=true
    if (useLocal) {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        if (deleteAll && target.seriesId) {
          return prev.filter((t) => t.seriesId !== target.seriesId);
        }
        return prev.filter((t) => t.id !== id);
      });
    } else {
    */
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
    /* } */
  };

  const updateTask = async (id: string, input: CreateTaskInput, updateAll?: boolean) => {
    const member = familyMembersMap[input.assigneeId];
    if (!member) return;

    /* MODO LOCAL COMENTADO - Descomentar si VITE_USE_LOCAL_STORAGE=true
    if (useLocal) {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;

        if (updateAll && target.seriesId) {
          const filtered = prev.filter((t) => t.seriesId !== target.seriesId);
          const newTasks = generateSeriesTasks(input, member, target.seriesId);
          return [...filtered, ...newTasks];
        }

        const updatedFields = {
          title: input.title.trim(),
          timeLabel: input.time || undefined,
          assignees: [member],
          priority: input.priority,
          recurrence: input.recurrence,
          description: input.description?.trim(),
          daysOfWeek: input.daysOfWeek,
          durationWeeks: input.durationWeeks,
        };

        return prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            ...updatedFields,
            date: input.date,
          };
        });
      });
    } else {
    */
      try {
        const result = await apiUpdateTask(id, input, updateAll);
        
        if (updateAll) {
          const allTasks = await getTasks();
          setTasks(allTasks);
        } else {
          setTasks((prev) => prev.map((t) => (t.id === id ? (result as Task) : t)));
        }
      } catch (err) {
        console.error("Error actualizando tarea", err);
        throw err;
      }
    /* } */
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
