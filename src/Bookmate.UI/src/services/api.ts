import { API_ROOT } from "../config";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  image_url?: string | null;
  purchased_date?: string | null;
}

export interface BookPayload {
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  image_url?: string | null;
  purchased_date?: string | null;
}

export interface UserPreference {
  id: string;
  genre: string;
  author: string;
  book_id?: string | null;
  created_at: string;
}

export interface UserPreferencePayload {
  genre: string;
  author: string;
  book_id?: string | null;
}

export interface UserInteraction {
  id: string;
  book_id: string;
  interaction_type: string;
  rating?: number | null;
  created_at: string;
}

export interface UserInteractionPayload {
  book_id: string;
  interaction_type: string;
  rating?: number | null;
}

export interface LibraryItem {
  id: string;
  book_id: string;
  added_at: string;
  status: string;
  progress?: number | null;
  notes?: string | null;
}

export interface Institution {
  id: string;
  name: string;
  type: string;
  address?: string | null;
  website?: string | null;
  contact_email?: string | null;
  created_at: string;
  is_verified: boolean;
}

export interface InstitutionPayload {
  name: string;
  type: string;
  address?: string | null;
  website?: string | null;
  contact_email?: string | null;
  is_verified?: boolean;
}

export interface CorporateClub {
  id: string;
  name: string;
  organization_name: string;
  admin_user_id: string;
  description?: string | null;
  max_members?: number | null;
  created_at: string;
  is_active: boolean;
}

export interface CorporateClubPayload {
  name: string;
  organization_name: string;
  admin_user_id: string;
  description?: string | null;
  max_members?: number | null;
  is_active?: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  creator_user_id: string;
  topic: string;
  description?: string | null;
  created_at: string;
  is_public: boolean;
}

export interface CommunityGroupPayload {
  name: string;
  creator_user_id: string;
  topic: string;
  description?: string | null;
  is_public?: boolean;
}

export interface MarketplaceItem {
  id: string;
  book_id: string;
  seller_user_id: string;
  price: number;
  condition: string;
  description?: string | null;
  listed_at: string;
  is_available: boolean;
  buyer_user_id?: string | null;
  sold_at?: string | null;
}

export interface MarketplacePayload {
  book_id: string;
  seller_user_id: string;
  price: number;
  condition: string;
  description?: string | null;
}

function buildHeaders(token?: string | null, includeJson = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return data as T;
}

export const authApi = {
  login(payload: AuthPayload) {
    return request<AuthResponse>("/api/users/login", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  register(payload: AuthPayload) {
    return request<AuthResponse>("/api/users/register", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
};

export const booksApi = {
  list() {
    return request<Book[]>("/api/books");
  },
  get(bookId: string) {
    return request<Book>(`/api/books/${bookId}`);
  },
  create(payload: BookPayload) {
    return request<Book>("/api/books", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  update(bookId: string, payload: BookPayload) {
    return request<Book>(`/api/books/${bookId}`, {
      method: "PUT",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  patch(bookId: string, payload: Partial<BookPayload>) {
    return request<Book>(`/api/books/${bookId}`, {
      method: "PATCH",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  remove(bookId: string) {
    return request<void>(`/api/books/${bookId}`, {
      method: "DELETE",
    });
  },
  listAvailable(token: string) {
    return request<Book[]>("/api/books/available", {
      headers: buildHeaders(token, false),
    });
  },
};

export const preferencesApi = {
  list(token: string) {
    return request<UserPreference[]>("/api/users/preferences", {
      headers: buildHeaders(token, false),
    });
  },
  create(token: string, payload: UserPreferencePayload) {
    return request<UserPreference>("/api/users/preferences", {
      method: "POST",
      headers: buildHeaders(token, true),
      body: JSON.stringify(payload),
    });
  },
};

export const interactionsApi = {
  list(token: string) {
    return request<UserInteraction[]>("/api/interactions", {
      headers: buildHeaders(token, false),
    });
  },
  create(token: string, payload: UserInteractionPayload) {
    return request<UserInteraction>("/api/interactions", {
      method: "POST",
      headers: buildHeaders(token, true),
      body: JSON.stringify(payload),
    });
  },
};

export const libraryApi = {
  list(token: string, status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<LibraryItem[]>(`/api/library/${query}`, {
      headers: buildHeaders(token, false),
    });
  },
  add(token: string, bookId: string, status: string) {
    const query = `?book_id=${encodeURIComponent(bookId)}&status=${encodeURIComponent(status)}`;
    return request<LibraryItem>(`/api/library/${query}`, {
      method: "POST",
      headers: buildHeaders(token, false),
    });
  },
  updateStatus(token: string, libraryId: string, status: string) {
    return request<{ id: string; status: string }>(
      `/api/library/${libraryId}/status?status=${encodeURIComponent(status)}`,
      {
        method: "PATCH",
        headers: buildHeaders(token, false),
      }
    );
  },
  remove(token: string, libraryId: string) {
    return request<{ success: boolean }>(`/api/library/${libraryId}`, {
      method: "DELETE",
      headers: buildHeaders(token, false),
    });
  },
};

export const aiApi = {
  send(message: string) {
    return request<{ reply: string }>("/api/ai/chat", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify({ message }),
    });
  },
};

export const institutionsApi = {
  list(page = 1, limit = 20) {
    return request<Institution[]>(`/institutions?page=${page}&limit=${limit}`);
  },
  create(payload: InstitutionPayload) {
    return request<Institution>("/institutions", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
};

export const corporateClubsApi = {
  list(page = 1, limit = 20) {
    return request<CorporateClub[]>(`/corporate-clubs?page=${page}&limit=${limit}`);
  },
  create(payload: CorporateClubPayload) {
    return request<CorporateClub>("/corporate-clubs", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
};

export const communityGroupsApi = {
  list(page = 1, limit = 20) {
    return request<CommunityGroup[]>(`/community-groups?page=${page}&limit=${limit}`);
  },
  create(payload: CommunityGroupPayload) {
    return request<CommunityGroup>("/community-groups", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
};

export const marketplaceApi = {
  list(page = 1, limit = 20) {
    return request<MarketplaceItem[]>(`/marketplaces?page=${page}&limit=${limit}`);
  },
  create(payload: MarketplacePayload) {
    return request<MarketplaceItem>("/marketplaces", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
};

export function getApiRoot() {
  return API_ROOT;
}

// ── Google Books ─────────────────────────────────────────────
export interface GoogleBook {
  google_id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  published_date: string;
  categories: string[];
  isbn: string;
  amazon_url: string;
}

export const googleBooksApi = {
  search(q: string, category?: string) {
    const params = new URLSearchParams({ q });
    if (category) params.append("category", category);
    return request<GoogleBook[]>(`/api/google-books/search?${params}`);
  },
  getByIsbn(isbn: string) {
    return request<GoogleBook>(`/api/google-books/isbn/${isbn}`);
  },
};

// ── Lendings ─────────────────────────────────────────────────
export interface Lending {
  id: string;
  book_id: string;
  friend_name: string;
  friend_email: string;
  due_date: string;
  status: string;
  lent_at: string;
}

export interface LendingPayload {
  book_id: string;
  friend_name: string;
  friend_email: string;
  due_date: string;
}

export const lendingsApi = {
  list() {
    return request<Lending[]>("/api/lendings/");
  },
  create(payload: LendingPayload) {
    return request<Lending>("/api/lendings/", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  markReturned(lendingId: string) {
    return request<Lending>(`/api/lendings/${lendingId}/return`, {
      method: "PATCH",
      headers: buildHeaders(null, false),
    });
  },
  getBookStatus(bookId: string) {
    return request<{ lent: boolean; lending?: Lending }>(`/api/lendings/book/${bookId}/status`);
  },
};

// ── Wishlist (dedicated table) ────────────────────────────────
export interface WishlistItem {
  id: string;
  book_name: string;
  author: string;
  image?: string | null;
  description?: string | null;
  google_id?: string | null;
  amazon_url?: string | null;
  added_at: string;
}

export interface WishlistPayload {
  book_name: string;
  author: string;
  image?: string | null;
  description?: string | null;
  google_id?: string | null;
  amazon_url?: string | null;
}

export const wishlistApi = {
  list() {
    return request<WishlistItem[]>("/api/wishlist/");
  },
  add(payload: WishlistPayload) {
    return request<WishlistItem>("/api/wishlist/", {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  remove(itemId: string) {
    return request<void>(`/api/wishlist/${itemId}`, { method: "DELETE" });
  },
};
