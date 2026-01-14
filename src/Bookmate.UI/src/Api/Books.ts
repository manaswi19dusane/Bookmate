const BASE_URL = "http://127.0.0.1:8000/api/books";
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
/* ✅ CREATE */
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

/* ✅ READ */
export async function fetchBooks(): Promise<BookResponse[]>  {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

// Get book by id
export async function fetchBook(id: string): Promise<BookResponse> {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error(`Book not found (${res.status})`);
  }

  return await res.json();
}

/* ✅ UPDATE STATUS */
export async function updateBookStatus(
  id: string,
  status: "wishlist" | "owned"
) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update book status");
}

/* ✅ DELETE */
export async function deleteBook(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete book");
}
