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
  removeTask: (id: string) => Promise<void>;
}

// Fecha de hoy
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Mock de miembros de la familia (frontend)
const familyMembersMap: Record<string, Assignee> = {
  mama: { id: "mama", name: "Maria", color: "#f97316" },
  papa: { id: "papa", name: "Alvaro", color: "#22c55e" },
  hugo: { id: "hugo", name: "Hugo", color: "#3b82f6" },
  familia: { id: "familia", name: "Todos", color: "#6366f1" },
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Cargar tareas desde la API al montar
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
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
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Crear tarea(s) vía backend (incluye recurrencias)
  const addTask = async (input: CreateTaskInput) => {
    const member = familyMembersMap[input.assigneeId];
    if (!member) {
      console.warn("Miembro de familia no válido:", input.assigneeId);
      return;
    }

    try {
      const created = await createTasks(input);
      // El backend ya devuelve TODAS las tareas generadas (base + recurrencias)
      setTasks((prev) => [...prev, ...created]);
    } catch (err) {
      console.error("Error creando tarea(s)", err);
      throw err;
    }
  };

  // Borrar tarea vía backend
  const removeTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error borrando tarea", err);
      throw err;
    }
  };

  // Tareas de hoy
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

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useTaskStore(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskStore debe usarse dentro de <TaskProvider>");
  }
  return ctx;
}

/* 
 //  MODO LOCAL (para tests)
 //  código con localStorage, initialTasks, addDays, addMonths, etc.)

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
*/
