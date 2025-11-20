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

// Mock de miembros de la familia (frontend)
// TODO: más adelante podemos cargarlos desde /api/family-members
const familyMembersMap: Record<string, Assignee> = {
  mama: { id: "mama", name: "Mamá", color: "#f97316" },
  papa: { id: "papa", name: "Papá", color: "#22c55e" },
  hugo: { id: "hugo", name: "Hugo", color: "#3b82f6" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

// 🔴 BLOQUE SOLO PARA TEST LOCAL / DEMO (sin backend)
//     Lo dejamos comentado, por si quieres volver a usarlo luego.
/*
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Pediatra Hugo',
    date: todayStr(),
    timeLabel: '09:30',
    priority: 'HIGH',
    assignees: [familyMembersMap.mama, familyMembersMap.hugo],
    recurrence: 'NONE',
    description: 'Revisión rutinaria de los ojos',
  },
  {
    id: '2',
    title: 'Reunión en Kita',
    date: todayStr(),
    timeLabel: '16:00',
    priority: 'MEDIUM',
    assignees: [familyMembersMap.papa],
    recurrence: 'NONE',
    description: 'Revisión rutinaria de los ojos',
  },
  {
    id: '3',
    title: 'Compra semanal',
    date: todayStr(),
    priority: 'LOW',
    assignees: [familyMembersMap.familia],
    recurrence: 'NONE',
    description: 'Revisión rutinaria de los ojos',
  },
];

const STORAGE_KEY = 'family-planner-tasks';
*/

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

// 🔴 Helper de recurrencia SOLO usado en versión local (lo dejamos comentado)
/*
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
*/

export function TaskProvider({ children }: { children: ReactNode }) {
  // 🔴 Versión SOLO LOCAL (sin backend, con localStorage)
  /*
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return initialTasks;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialTasks;
      const parsed = JSON.parse(raw) as Task[];
      if (!Array.isArray(parsed)) return initialTasks;
      return parsed;
    } catch {
      return initialTasks;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // podríamos loguear el error, pero no rompemos la app
    }
  }, [tasks]);
  */

  // ✅ Versión BACKEND: estado simple, se llena desde la API
  const [tasks, setTasks] = useState<Task[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // Cargar tareas desde el backend al montar
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

  // 🔴 Versión LOCAL de addTask (con generación de recurrencias en frontend)
  /*
  const addTask = (input: CreateTaskInput) => {
    const member = familyMembersMap[input.assigneeId];
    if (!member) return;

    const base: Omit<Task, 'id'> = {
      title: input.title.trim(),
      date: input.date,
      timeLabel: input.time || undefined,
      priority: input.priority,
      assignees: [member],
      recurrence: input.recurrence,
      description: input.description?.trim() || undefined,
    };

    const tasksToAdd: Task[] = [];

    tasksToAdd.push({
      ...base,
      id: crypto.randomUUID?.() ?? Date.now().toString(),
    });

    if (input.recurrence === 'DAILY') {
      for (let i = 1; i <= 6; i++) {
        tasksToAdd.push({
          ...base,
          id: crypto.randomUUID?.() ?? `${Date.now()}-d${i}`,
          date: addDays(input.date, i),
        });
      }
    } else if (input.recurrence === 'WEEKLY') {
      for (let i = 1; i <= 3; i++) {
        tasksToAdd.push({
          ...base,
          id: crypto.randomUUID?.() ?? `${Date.now()}-w${i}`,
          date: addDays(input.date, i * 7),
        });
      }
    } else if (input.recurrence === 'MONTHLY') {
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
  */

  //  Versión BACKEND de addTask: manda los datos al servidor,
  //    el backend se encarga de generar las recurrencias y devuelve
  //    el array de tareas creadas.
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

        // created es un array de Task que viene del backend
        setTasks((prev) => [...prev, ...created]);
      } catch (err) {
        console.error("Error al crear tarea(s)", err);
        // aquí podrías poner un estado de error global o un toast
      }
    })();
  };

  //  Versión LOCAL de removeTask
  /*
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };
  */

  // ✅ Versión BACKEND de removeTask
  const removeTask = (id: string) => {
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
