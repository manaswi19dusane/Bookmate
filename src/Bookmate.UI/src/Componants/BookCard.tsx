import type { Book } from "../Types/Book";
import "../css/BookCard.css";
import { useState, useEffect } from "react";

interface Props {
  book: Book;
  onDelete: (id: string) => void;  
  onUpdate: (book: Book) => void;
}

export default function BookCard({ book, onDelete, onUpdate }: Props) {
  const [status, setStatus] = useState<"Owned" | "Wishlist">(() => {
    const saved = localStorage.getItem(`book_${book.id}_status`);
    return saved === "Owned" || saved === "Wishlist" ? saved : "Wishlist";
  });

  useEffect(() => {
    localStorage.setItem(`book_${book.id}_status`, status);
  }, [book.id, status]);

  const toggleWishlist = () => {
    setStatus((prev) => (prev === "Owned" ? "Wishlist" : "Owned"));
  };

  const deleteBook = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:8000/books/${book.id}`, {
        method: "DELETE",
      });

      onDelete(book.id); 
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const updateBook = async () => {
    const newTitle = window.prompt("Enter new title", book.title);
    if (!newTitle) return;

    const newAuthor = window.prompt("Enter new author", book.author);
    if (!newAuthor) return;

    const updatedBook: Book = {
      ...book,
      title: newTitle,
      author: newAuthor,
    };

    try {
      await fetch(`http://localhost:8000/books/${book.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBook),
      });

      onUpdate(updatedBook);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
  <div className="book-card">

    {/* BOOK IMAGE */}
    <div className="book-image-wrapper">
      {book.image_url ? (
        <img src={book.image_url} alt={book.title} />
      ) : (
        <div className="image-placeholder">No Image</div>
      )}
    </div>

    {/* BOOK INFO */}
    <div className="book-info">
      <h3 className="book-title">{book.title}</h3>
      <p className="book-author">{book.author}</p>

      <span className={`book-status ${status.toLowerCase()}`}>
        {status}
      </span>
    </div>

    {/* ACTIONS */}
    <div className="book-actions">
      <button className="icon-btn" onClick={updateBook}>✏️</button>
      <button className="icon-btn delete" onClick={deleteBook}>🗑</button>
      <button className="icon-btn" onClick={toggleWishlist}>
        {status === "Owned" ? "❤️" : "🤍"}
      </button>
    </div>
  </div>
);
}
