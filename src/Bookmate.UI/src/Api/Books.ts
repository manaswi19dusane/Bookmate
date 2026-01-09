const BASE_URL = "http://localhost:3000/books";

/* ✅ CREATE */
export async function createBook(book: any) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });

  if (!res.ok) throw new Error("Failed to create book");
  return res.json();
}

/* ✅ READ */
export async function getBooks() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

/* ✅ UPDATE STATUS */
export async function updateBookStatus(
  id: number,
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
export async function deleteBook(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete book");
}
