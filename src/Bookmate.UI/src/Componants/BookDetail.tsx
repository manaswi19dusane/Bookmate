import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Book } from "../Types/Book";
import { fetchBook } from "../Api/Books";  

export default function BookDetail() {

  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchBook(id)          
      .then(data => setBook(data))
      .catch(err => console.error(err));

  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <div>
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      

      {book.image_url && (
        <img src={book.image_url} width="200" />
      )}
    </div>
  );
}
