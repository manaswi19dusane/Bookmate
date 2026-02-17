const BASE_URL = "http://127.0.0.1:8000/api/books";

/* ---------- TYPES ---------- */

export interface BookResponse {
  id: string;
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  image_url?: string | null;
  purchased_date?: string | null;
  status?: "Owned" | "Wishlist";   
  description?: string;  
}

export interface CreateBookRequest {
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  image_url?: string | null;
  purchased_date?: string | null;
}

/* ---------- CREATE ---------- */
export async function createBook(
  payload: CreateBookRequest
): Promise<BookResponse> {
  const Book_response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!Book_response.ok) {
    throw new Error(`Failed to create book (${Book_response.status})`);
  }

  return await Book_response.json();

}

export async function updateBook(payload: Updatebookrequest):Promise<BookResponse>{
    const Book_response=await fetch(`${BASE_URL}/${payload.id}`,{


      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
    });
    if(!Book_response.ok){
      throw new Error(`Failed to update book (${Book_response.status})`);


    }
    return await Book_response.json();
  
}

/* ---------- READ ALL ---------- */
export async function fetchBooks(): Promise<BookResponse[]> {
  const Book_response = await fetch(BASE_URL);

  if (!Book_response.ok) {
    throw new Error("Failed to fetch books");
  }

  return await Book_response.json();
}

/* ---------- READ BY ID ---------- */
export async function fetchBook(id: string): Promise<BookResponse> {
  const Book_response = await fetch(`${BASE_URL}/${id}`);

  if (!Book_response.ok) {
    throw new Error(`Book not found (${Book_response.status})`);
  }

  return await Book_response.json();

}


/* ---------- UPDATE STATUS ---------- */
export async function updateBookStatus(
  id: string,
  status: "wishlist" | "owned"
) {
  const Book_response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!Book_response.ok) {
    throw new Error("Failed to update book status");
  }
}

/* ---------- DELETE ---------- */
export async function deleteBook(id: string) {
  const Book_response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!Book_response.ok) {
    throw new Error("Failed to delete book");
  }
}

/*Updatebookrequest*/

export interface Updatebookrequest{
  id:string;
  title:string;
  author:string;
  language:string;
  published_date?:string|null;
  image_url?:string|null;
  purchased_date?:string|null;
  status?: "Owned" | "Wishlist";
  description?: string;
}



