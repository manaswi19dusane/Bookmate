import type { Book } from "../Types/Book";
import "../css/BookCard.css";
import { useState, useEffect } from "react";

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  const [status, setStatus] = useState<"Owned" | "Wishlist">(() => {
    const saved = localStorage.getItem(`book_${book.id}_status`);
    if (saved === "Owned" || saved === "Wishlist") {
      return saved;
    }
    // return book.status;
    return "Wishlist"; 
  });

  useEffect(() => {
    localStorage.setItem(`book_${book.id}_status`, status);
  }, [book.id, status]);

  const toggleWishlist = () => {
    setStatus((prev) => (prev === "Owned" ? "Wishlist" : "Owned"));
  };

  return (
    <div className="book-card">
      {book.image_url && (
        <img src={book.image_url} alt={book.title} className="book-image" />
      )}
      <h2 className="book-title">{book.title}</h2>
      <p className="book-author">by {book.author}</p>
      <p className="book-language">Language: {book.language}</p>
      <p className="book-published-date">Published: {book.published_date}</p>
      <p className="book-purchased-date">Purchased: {book.purchased_date}</p>

      <span
        className={`book-status ${
          status === "Owned" ? "owned" : "wishlist"
        }`}
      >
        {status}
      </span>

      <button className="book-btn" onClick={toggleWishlist}>
        {status === "Owned" ? "Move to Wishlist" : "Mark as Owned"}
      </button>
    </div>
  );
}
