import type { Book } from "../Types/Book";
import "../css/BookCard.css";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { deleteBook } from "../Api/Books";



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

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem(`book_${book.id}_status`, status);
  }, [book.id, status]);

  const toggleWishlist = () => {
    setStatus((prev) => (prev === "Owned" ? "Wishlist" : "Owned"));
  };

  const handleDeleteBook = async () => {
    try {
  
      await deleteBook(book.id);
      onDelete(book.id);
      setShowConfirm(false);
    } catch (error) {
      console.error("Delete failed", error);
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
        <button className="icon-btn" onClick={() => onUpdate(book)}>✏️</button>
        <button className="icon-btn delete" onClick={() => setShowConfirm(true)}>🗑</button>
        <button className="icon-btn" onClick={toggleWishlist}>
          {status === "Owned" ? "❤️" : "🤍"}
        </button>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showConfirm &&
  ReactDOM.createPortal(
    <div className="confirm-modal">
      <div className="modal-content">
        <p>
          Are you sure you want to delete <strong>{book.title}</strong>?
        </p>

        <div className="modal-buttons">
          <button className="yes-btn" onClick={handleDeleteBook}>
          Yes
          </button>

          

          <button
            className="no-btn"
            onClick={() => setShowConfirm(false)}
          >
            No
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}

    </div>
  );
}