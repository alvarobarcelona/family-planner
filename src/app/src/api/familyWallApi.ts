import { Note } from "../store/useFamilyWallStore";

const rawBaseUrl = import.meta.env.VITE_API_URL ?? "";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(buildUrl("/api/family-wall"), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function createNote(
  note: Omit<Note, "id" | "createdAt">
): Promise<Note> {
  const res = await fetch(buildUrl("/api/family-wall"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

export async function deleteNoteApi(id: string): Promise<void> {
  const res = await fetch(buildUrl(`/api/family-wall/${id}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete note");
}

export async function updateNoteApi(
  id: string,
  content: string
): Promise<void> {
  const res = await fetch(buildUrl(`/api/family-wall/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to update note");
}
