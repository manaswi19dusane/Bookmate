export interface BookResponse {
  id: string;
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  image_url?: string | null;
  purchased_date?: string | null;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  image_url?: string | null;
  purchased_date?: string | null;
}

// base URL 
const BASE_URL = "http://127.0.0.1:8000/api/books";

// Get all List books
export async function fetchBooks(): Promise<BookResponse[]> {
  const res = await fetch(BASE_URL);

  if (!res.ok) {
    throw new Error(`Failed to load books (${res.status})`);
  }

  return await res.json();
}

// Create a book
export async function createBook(
  payload: CreateBookRequest
): Promise<BookResponse> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create book (${res.status})`);
  }

  return await res.json();
}

// Get book by id
export async function fetchBook(id: string): Promise<BookResponse> {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error(`Book not found (${res.status})`);
  }

  return await res.json();
}
