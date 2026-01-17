import type { Task, Priority, Recurrence } from "../store/useTaskStore";

export interface CreateTaskDto {
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
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
  createdBy?: string;
  createdAt?: string;
}

// If VITE_API_URL is set (e.g. for specific dev), use it.
// Otherwise, default to relative path "" which goes to the same domain (Vercel proxy or Vite proxy)
const rawBaseUrl = import.meta.env.VITE_API_URL ?? "";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

console.log("Current API_BASE_URL (empty means relative):", API_BASE_URL);

function buildUrl(path: string) {
  // If API_BASE_URL is empty, this returns "/api/foo", which is relative to current domain
  // This triggers the Proxy in both Dev (vite) and Prod (vercel)
  return `${API_BASE_URL}${path}`;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(name: string, password: string): Promise<void> {
  const res = await fetch(buildUrl("/api/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
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
    const text = await res.text();
    throw new Error(
      `Error loading tasks: ${res.status} ${text.substring(0, 100)}`,
    );
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    // This is often the Vercel 404 HTML page if proxy fails
    throw new Error(
      `Invalid API response (not JSON). Received: ${text.substring(0, 150)}...`,
    );
  }

  return res.json();
}

export async function createTasks(payload: CreateTaskDto): Promise<Task[]> {
  console.log("Sending POST to:", buildUrl("/api/tasks"));
  console.log(" Payload:", payload);

  const res = await fetch(buildUrl("/api/tasks"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  console.log(" Response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();

    throw new Error(`Error al crear tarea(s): ${res.status} - ${errorText}`);
  }

  const data = await res.json();

  return data;
}

export async function deleteTask(
  id: string,
  deleteAll?: boolean,
): Promise<void> {
  const query = deleteAll ? "?deleteAll=true" : "";
  const res = await fetch(buildUrl(`/api/tasks/${id}${query}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error("Error al borrar tarea");
  }
}

export async function updateTask(
  id: string,
  payload: CreateTaskDto,
  updateAll?: boolean,
): Promise<Task> {
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
