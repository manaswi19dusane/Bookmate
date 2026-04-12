const BASE_URL = "http://127.0.0.1:8000/api";

// ==================== TYPES ====================
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

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  published_year?: number;
  created_at: string;
}

export interface Recommendation {
  book_id: string;
  book: Book;
  score: number;
  reason?: string;
}

export interface LibraryItem {
  id: string;
  book_id: string;
  book: Book;
  status: string;
  location?: string;
  created_at: string;
}

export interface Institution {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
  created_at: string;
}

export interface MarketplaceItem {
  id: string;
  book_id: string;
  book: Book;
  price: number;
  condition: string;
  seller_id: string;
  created_at: string;
}

// ==================== HELPERS ====================
function authHeaders(isJson = true): Record<string, string> {
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
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data.detail || data.message || "Request failed");
  }
  
  return data as T;
}

// ==================== AUTH API ====================
export const authApi = {
  login: async (payload: AuthRequest): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(response);
  },

  register: async (payload: AuthRequest): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(response);
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

// ==================== PREFERENCES API ====================
export const preferencesApi = {
  getAll: async (): Promise<UserPreference[]> => {
    const response = await fetch(`${BASE_URL}/users/preferences`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<UserPreference[]>(response);
  },

  create: async (payload: Partial<Omit<UserPreference, "id" | "created_at">>): Promise<UserPreference> => {
    const response = await fetch(`${BASE_URL}/users/preferences`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<UserPreference>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/users/preferences/${id}`, {
      method: "DELETE",
      headers: authHeaders(false),
    });
    if (!response.ok) {
      throw new Error("Failed to delete preference");
    }
  }
};

// ==================== INTERACTIONS API ====================
export const interactionsApi = {
  getAll: async (): Promise<UserInteraction[]> => {
    const response = await fetch(`${BASE_URL}/interactions`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<UserInteraction[]>(response);
  },

  create: async (payload: Omit<UserInteraction, "id" | "created_at">): Promise<UserInteraction> => {
    const response = await fetch(`${BASE_URL}/interactions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<UserInteraction>(response);
  }
};

// ==================== RECOMMENDATIONS API ====================
export const recommendationsApi = {
  getForUser: async (userId: string): Promise<Recommendation[]> => {
    const response = await fetch(`${BASE_URL}/recommendations/${userId}`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<Recommendation[]>(response);
  }
};

// ==================== LIBRARY API ====================
export const libraryApi = {
  getAll: async (): Promise<LibraryItem[]> => {
    const response = await fetch(`${BASE_URL}/library`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<LibraryItem[]>(response);
  },

  create: async (payload: Omit<LibraryItem, "id" | "created_at" | "book">): Promise<LibraryItem> => {
    const response = await fetch(`${BASE_URL}/library`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<LibraryItem>(response);
  },

  update: async (id: string, payload: Partial<LibraryItem>): Promise<LibraryItem> => {
    const response = await fetch(`${BASE_URL}/library/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<LibraryItem>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/library/${id}`, {
      method: "DELETE",
      headers: authHeaders(false),
    });
    if (!response.ok) {
      throw new Error("Failed to delete library item");
    }
  }
};

// ==================== INSTITUTION API ====================
export const institutionApi = {
  getAll: async (): Promise<Institution[]> => {
    const response = await fetch(`${BASE_URL}/institution`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<Institution[]>(response);
  },

  create: async (payload: Omit<Institution, "id" | "created_at">): Promise<Institution> => {
    const response = await fetch(`${BASE_URL}/institution`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Institution>(response);
  }
};

// ==================== MARKETPLACE API ====================
export const marketplaceApi = {
  getAll: async (): Promise<MarketplaceItem[]> => {
    const response = await fetch(`${BASE_URL}/marketplace`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<MarketplaceItem[]>(response);
  },

  create: async (payload: Omit<MarketplaceItem, "id" | "created_at" | "book">): Promise<MarketplaceItem> => {
    const response = await fetch(`${BASE_URL}/marketplace`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<MarketplaceItem>(response);
  }
};

// ==================== BOOKS API ====================
export const booksApi = {
  getAll: async (): Promise<Book[]> => {
    const response = await fetch(`${BASE_URL}/books`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<Book[]>(response);
  },

  getAvailable: async (): Promise<Book[]> => {
    const response = await fetch(`${BASE_URL}/books/available`, {
      method: "GET",
      headers: authHeaders(false),
    });
    return handleResponse<Book[]>(response);
  }
};

export default {
  auth: authApi,
  preferences: preferencesApi,
  interactions: interactionsApi,
  recommendations: recommendationsApi,
  library: libraryApi,
  institution: institutionApi,
  marketplace: marketplaceApi,
  books: booksApi
};