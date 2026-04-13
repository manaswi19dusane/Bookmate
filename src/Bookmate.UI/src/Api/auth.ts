const BASE_URL = "http://127.0.0.1:8000/api";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface UserPreference {
    id: string;
    genre: string;
    author: string;
    book_id?: string;
    created_at: string;
}

export interface UserInteraction {
  id: string;
  book_id: string;
  interaction_type: string;
  rating?: number | null;
  created_at: string;
}

function authHeaders(isJson = true) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data as T;
}

export async function registerUser(payload: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(response);
}

export async function loginUser(payload: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(response);
}

export async function fetchPreferences(): Promise<UserPreference[]> {
  const response = await fetch(`${BASE_URL}/users/preferences`, {
    method: "GET",
    headers: authHeaders(false),
  });
  return handleResponse<UserPreference[]>(response);
}

export async function createPreference(
  payload: Partial<Omit<UserPreference, "id" | "created_at">>
): Promise<UserPreference> {
  const response = await fetch(`${BASE_URL}/users/preferences`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<UserPreference>(response);
}

export async function fetchInteractions(): Promise<UserInteraction[]> {
  const response = await fetch(`${BASE_URL}/interactions`, {
    method: "GET",
    headers: authHeaders(false),
  });
  return handleResponse<UserInteraction[]>(response);
}

export async function createInteraction(
  payload: Omit<UserInteraction, "id" | "created_at">
): Promise<UserInteraction> {
  const response = await fetch(`${BASE_URL}/interactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<UserInteraction>(response);
}

export async function fetchAvailableBooks(): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/books/available`, {
    method: "GET",
    headers: authHeaders(false),
  });
  return handleResponse<any[]>(response);
}
