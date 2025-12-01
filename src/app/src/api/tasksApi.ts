import type { Task, Priority, Recurrence } from "../store/useTaskStore";

export interface CreateTaskDto {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  assigneeId: string;
  priority: Priority;
  recurrence: Recurrence;
  description?: string;
  daysOfWeek?: number[];
  durationWeeks?: number;
  seriesId?: string;
  notificationTime?: number;
  color?: string;
}

const rawBaseUrl = import.meta.env.VITE_API_URL ?? "";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");


function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(password: string): Promise<void> {
  const res = await fetch(buildUrl("/api/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  localStorage.setItem("auth_token", data.token);
}

export function logout() {
  localStorage.removeItem("auth_token");
  window.location.reload();
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(buildUrl("/api/tasks"), {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    throw new Error("Error al cargar tareas");
  }
  return res.json();
}

export async function createTasks(payload: CreateTaskDto): Promise<Task[]> {
  console.log('🔵 Sending POST to:', buildUrl("/api/tasks"));
  console.log('🔵 Payload:', payload);
  
  const res = await fetch(buildUrl("/api/tasks"), {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  console.log('🔵 Response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ API Error:', res.status, errorText);
    throw new Error(`Error al crear tarea(s): ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  console.log('✅ Created tasks:', data);
  return data;
}

export async function deleteTask(id: string, deleteAll?: boolean): Promise<void> {
  const query = deleteAll ? "?deleteAll=true" : "";
  const res = await fetch(buildUrl(`/api/tasks/${id}${query}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error("Error al borrar tarea");
  }
}

export async function updateTask(id: string, payload: CreateTaskDto, updateAll?: boolean): Promise<Task> {
  const query = updateAll ? "?updateAll=true" : "";
  const res = await fetch(buildUrl(`/api/tasks/${id}${query}`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar tarea");
  }

  return res.json();
}
