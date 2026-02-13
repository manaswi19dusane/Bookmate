import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Book } from "../Types/Book";

export default function BookDetail() {

  const { id } = useParams();

  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/books/" + id)
      .then(res => res.json())
      .then(data => setBook(data));
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <div>
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      <p>{book.description}</p>

      {book.image_url && (
        <img src={book.image_url} width="200" />
      )}
    </div>
  );
}
