import type { Task, Priority, Recurrence } from "../store/useTaskStore";

export interface CreateTaskDto {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  assigneeId: string;
  priority: Priority;
  recurrence: Recurrence;
  description?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";


function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(buildUrl("/api/tasks"));
  if (!res.ok) {
    throw new Error("Error al cargar tareas");
  }
  return res.json();
}

export async function createTasks(payload: CreateTaskDto): Promise<Task[]> {
  const res = await fetch(buildUrl("/api/tasks"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al crear tarea(s)");
  }

  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(buildUrl(`/api/tasks/${id}`), {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 404) {
    throw new Error("Error al borrar tarea");
  }
}
