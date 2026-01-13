export interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  completed: boolean;
  created_at?: string;
}

export interface FavoriteItem {
  id: number;
  name: string;
  category: string;
  usage_count: number;
  last_quantity: number;
}

export interface CreateItemDto {
  name: string;
  category: string;
  quantity?: number;
}

export interface UpdateItemDto {
  name?: string;
  category?: string;
  quantity?: number;
  completed?: boolean;
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

export async function getShoppingItems(): Promise<ShoppingItem[]> {
  const res = await fetch(buildUrl("/api/shopping"), {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch shopping items");
  return res.json();
}

export async function addShoppingItem(
  payload: CreateItemDto
): Promise<ShoppingItem> {
  const res = await fetch(buildUrl("/api/shopping"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add item");
  return res.json();
}

export async function updateShoppingItem(
  id: number,
  payload: UpdateItemDto
): Promise<ShoppingItem> {
  const res = await fetch(buildUrl(`/api/shopping/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
}

export async function deleteShoppingItem(id: number): Promise<void> {
  const res = await fetch(buildUrl(`/api/shopping/${id}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error("Failed to delete item");
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const res = await fetch(buildUrl("/api/shopping/favorites"), {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function deleteFavorite(id: number): Promise<void> {
  const res = await fetch(buildUrl(`/api/shopping/favorites/${id}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error("Failed to delete favorite");
}
