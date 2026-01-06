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
      {book.image_url && (
        <img src={book.image_url} alt={book.title} className="book-image" />
      )}

      <h2>{book.title}</h2>
      <p>by {book.author}</p>
      <p>Language: {book.language}</p>

      <span className={`book-status ${status.toLowerCase()}`}>
        {status}
      </span>

      <button className="book-btn" onClick={toggleWishlist}>
        {status === "Owned" ? "Move to Wishlist" : "Mark as Owned"}
      </button>

      <button className="book-btn update-btn" onClick={updateBook}>
        Update
      </button>

      <button className="book-btn delete-btn" onClick={deleteBook}>
        Delete
      </button>
    </div>
  );
}
