const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const API_ROOT = (viteEnv?.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

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
  description?: string | null;
  isbn?: string | null;
  source?: string | null;
  purchased_date?: string | null;
  owner_id?: string | null;
}

export interface BookPayload {
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  image_url?: string | null;
  description?: string | null;
  isbn?: string | null;
  source?: string | null;
  purchased_date?: string | null;
}

export interface GoogleBook {
  external_id: string;
  title: string;
  authors: string[];
  thumbnail?: string | null;
  description?: string | null;
  published_date?: string | null;
  language?: string | null;
  isbn?: string | null;
  categories: string[];
}

export interface RankedGoogleBook extends GoogleBook {
  match_score: number;
  recommendation_reason: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  book_name: string;
  author: string;
  image?: string | null;
  created_at: string;
}

export interface WishlistPayload {
  book_name: string;
  author: string;
  image?: string | null;
}

export interface LendingPayload {
  friend_name: string;
  friend_email: string;
  due_date: string;
}

export interface LendingRecord {
  id: string;
  book_id: string;
  book_name: string;
  owner_id: string;
  friend_name: string;
  friend_email: string;
  lend_date: string;
  due_date: string;
  status: "active" | "overdue" | "returned";
  reminder_stage?: string | null;
  returned_at?: string | null;
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
  listMine(token: string) {
    return request<Book[]>("/api/books/mine", {
      headers: buildHeaders(token, false),
    });
  },
  get(bookId: string) {
    return request<Book>(`/api/books/${bookId}`);
  },
  create(payload: BookPayload, token?: string | null) {
    return request<Book>("/api/books", {
      method: "POST",
      headers: buildHeaders(token, true),
      body: JSON.stringify(payload),
    });
  },
  update(bookId: string, payload: BookPayload, token?: string | null) {
    return request<Book>(`/api/books/${bookId}`, {
      method: "PUT",
      headers: buildHeaders(token, true),
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
  remove(bookId: string, token?: string | null) {
    return request<void>(`/api/books/${bookId}`, {
      method: "DELETE",
      headers: buildHeaders(token, false),
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

export const lendingsApi = {
  list(token: string) {
    return request<LendingRecord[]>("/api/lendings/", {
      headers: buildHeaders(token, false),
    });
  },
  lend(token: string, bookId: string, payload: LendingPayload) {
    return request<LendingRecord>(`/api/lendings/${bookId}`, {
      method: "POST",
      headers: buildHeaders(token, true),
      body: JSON.stringify(payload),
    });
  },
  markReturned(token: string, lendingId: string) {
    return request<LendingRecord>(`/api/lendings/${lendingId}/return`, {
      method: "PATCH",
      headers: buildHeaders(token, false),
    });
  },
  runReminders(token: string) {
    return request<{ sent: number }>("/api/lendings/reminders/run", {
      method: "POST",
      headers: buildHeaders(token, false),
    });
  },
};

export const discoverApi = {
  search(params: { query?: string; category?: string }) {
    const search = new URLSearchParams();
    if (params.query?.trim()) {
      search.set("query", params.query.trim());
    }
    if (params.category?.trim()) {
      search.set("category", params.category.trim());
    }
    const query = search.toString();
    return request<GoogleBook[]>(`/api/discover/books${query ? `?${query}` : ""}`);
  },
  lookupIsbn(barcode: string) {
    return request<GoogleBook>(`/api/discover/isbn/${encodeURIComponent(barcode)}`);
  },
};

export const wishlistApi = {
  list(token: string) {
    return request<WishlistItem[]>("/api/wishlist/", {
      headers: buildHeaders(token, false),
    });
  },
  create(token: string, payload: WishlistPayload) {
    return request<WishlistItem>("/api/wishlist/", {
      method: "POST",
      headers: buildHeaders(token, true),
      body: JSON.stringify(payload),
    });
  },
  remove(token: string, wishlistId: string) {
    return request<void>(`/api/wishlist/${wishlistId}`, {
      method: "DELETE",
      headers: buildHeaders(token, false),
    });
  },
};

export function getApiRoot() {
  return API_ROOT;
}
