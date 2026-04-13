const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const API_ROOT = (viteEnv?.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export interface User {
  id: string;
  email: string;
  created_at: string;
  role: string;
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
  user_id?: string | null;
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
  user_id?: string | null;
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

export interface AdminOverview {
  users: number;
  admins: number;
  books: number;
  library_items: number;
  preferences: number;
  interactions: number;
  institutions: number;
  corporate_clubs: number;
  community_groups: number;
  marketplace_items: number;
  active_marketplace_items: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  role: string;
  created_at: string;
  preference_count: number;
  interaction_count: number;
  library_count: number;
}

export interface AdminLibrarySummary {
  id: string;
  user_id: string;
  user_email?: string | null;
  book_id: string;
  book_title?: string | null;
  status: string;
  added_at: string;
  progress?: number | null;
  notes?: string | null;
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
  update(institutionId: string, payload: Partial<InstitutionPayload>) {
    return request<Institution>(`/institutions/${institutionId}`, {
      method: "PUT",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  remove(institutionId: string) {
    return request<void>(`/institutions/${institutionId}`, {
      method: "DELETE",
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
  update(clubId: string, payload: Partial<CorporateClubPayload>) {
    return request<CorporateClub>(`/corporate-clubs/${clubId}`, {
      method: "PUT",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  remove(clubId: string) {
    return request<void>(`/corporate-clubs/${clubId}`, {
      method: "DELETE",
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
  update(groupId: string, payload: Partial<CommunityGroupPayload>) {
    return request<CommunityGroup>(`/community-groups/${groupId}`, {
      method: "PUT",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  remove(groupId: string) {
    return request<void>(`/community-groups/${groupId}`, {
      method: "DELETE",
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
  update(marketplaceId: string, payload: Partial<MarketplacePayload> & { is_available?: boolean }) {
    return request<MarketplaceItem>(`/marketplaces/${marketplaceId}`, {
      method: "PUT",
      headers: buildHeaders(null, true),
      body: JSON.stringify(payload),
    });
  },
  remove(marketplaceId: string) {
    return request<void>(`/marketplaces/${marketplaceId}`, {
      method: "DELETE",
    });
  },
};

export const adminApi = {
  overview(token: string) {
    return request<AdminOverview>("/api/admin/overview", {
      headers: buildHeaders(token, false),
    });
  },
  listUsers(token: string, search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<AdminUserSummary[]>(`/api/admin/users${query}`, {
      headers: buildHeaders(token, false),
    });
  },
  updateUserRole(token: string, userId: string, role: string) {
    return request<User>(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: buildHeaders(token, true),
      body: JSON.stringify({ role }),
    });
  },
  deleteUser(token: string, userId: string) {
    return request<void>(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: buildHeaders(token, false),
    });
  },
  listBooks(token: string) {
    return request<Book[]>("/api/admin/books", {
      headers: buildHeaders(token, false),
    });
  },
  listLibraries(token: string) {
    return request<AdminLibrarySummary[]>("/api/admin/libraries", {
      headers: buildHeaders(token, false),
    });
  },
  deleteLibraryItem(token: string, libraryId: string) {
    return request<void>(`/api/admin/libraries/${libraryId}`, {
      method: "DELETE",
      headers: buildHeaders(token, false),
    });
  },
  listPreferences(token: string) {
    return request<UserPreference[]>("/api/admin/preferences", {
      headers: buildHeaders(token, false),
    });
  },
  listInteractions(token: string) {
    return request<UserInteraction[]>("/api/admin/interactions", {
      headers: buildHeaders(token, false),
    });
  },
  listInstitutions(token: string) {
    return request<Institution[]>("/api/admin/institutions", {
      headers: buildHeaders(token, false),
    });
  },
  listCorporateClubs(token: string) {
    return request<CorporateClub[]>("/api/admin/corporate-clubs", {
      headers: buildHeaders(token, false),
    });
  },
  listCommunityGroups(token: string) {
    return request<CommunityGroup[]>("/api/admin/community-groups", {
      headers: buildHeaders(token, false),
    });
  },
  listMarketplaces(token: string) {
    return request<MarketplaceItem[]>("/api/admin/marketplaces", {
      headers: buildHeaders(token, false),
    });
  },
};

export function getApiRoot() {
  return API_ROOT;
}
