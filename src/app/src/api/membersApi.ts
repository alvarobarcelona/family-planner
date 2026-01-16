import { Assignee } from "../store/useTaskStore";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const getHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getMembers = async (): Promise<Assignee[]> => {
  const res = await fetch(`${API_URL}/api/members`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
};

export const createMember = async (
  name: string,
  color: string
): Promise<Assignee> => {
  const res = await fetch(`${API_URL}/api/members`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error("Failed to create member");
  return res.json();
};

export const updateMember = async (
  id: string,
  name: string,
  color: string
): Promise<Assignee> => {
  const res = await fetch(`${API_URL}/api/members/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error("Failed to update member");
  return res.json();
};

export const deleteMember = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/members/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to delete member");
  }
};
