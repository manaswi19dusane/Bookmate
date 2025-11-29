import type { Book } from "../Types/Book";
import "../css/BookCard.css";

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  return (
    <div className="card">
      <h2>{book.title}</h2>
      <p className="author">Author: {book.author}</p>

      <span className={`status ${book.status === "Owned" ? "owned" : "wishlist"}`}>
        {book.status}
      </span>

      <button className="btn">Add to Wishlist</button>
    </div>
  );
}
