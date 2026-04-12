import type { Book } from "../Types/Book";
import "../css/BookCard.css";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { deleteBook } from "../Api/Books";
import { useNavigate } from "react-router-dom";



interface Props {
  book?: Book;
  bookId?: string;
  showActions?: boolean;
  onDelete?: (id: string) => void;  
  onUpdate?: (book: any) => void;
}

export default function BookCard({ book, bookId, showActions = true, onDelete, onUpdate }: Props) {
  const bookData = book || { 
    id: bookId || '', 
    title: 'Loading...', 
    author: '' 
  };
  const navigate = useNavigate();
  const [status, setStatus] = useState<"Owned" | "Wishlist">(() => {
    const saved = localStorage.getItem(`book_${bookData.id}_status`);
    return saved === "Owned" || saved === "Wishlist" ? saved : "Wishlist";
  });

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem(`book_${bookData.id}_status`, status);
  }, [bookData.id, status]);

  const toggleWishlist = () => {
    setStatus((prev) => (prev === "Owned" ? "Wishlist" : "Owned"));
  };

  const handleDeleteBook = async () => {
    try {
      await deleteBook(bookData.id);
      onDelete?.(bookData.id);
      setShowConfirm(false);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };


  return (
   <div className="book-card" onClick={() => navigate("/book/" + bookData.id)}>

      {/* BOOK IMAGE */}
      <div className="book-image-wrapper">
        {bookData.image_url ? (
          <img src={bookData.image_url} alt={bookData.title} />
        ) : (
          <div className="image-placeholder">No Image</div>
        )}
      </div>

      {/* BOOK INFO */}
      <div className="book-info">
        <h3 className="book-title">{bookData.title}</h3>
        <p className="book-author">{bookData.author}</p>
        <span className={`book-status ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      {/* ACTIONS */}
      {showActions !== false && (
        <div className="book-actions">
          {onUpdate && book && <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onUpdate(book); }}>✏️</button>}
          {onDelete && <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}>🗑</button>}
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}>
            {status === "Owned" ? "❤️" : "🤍"}
          </button>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showConfirm &&
  ReactDOM.createPortal(
    <div className="confirm-modal">
      <div className="modal-content">
        <p>
          Are you sure you want to delete <strong>{bookData.title}</strong>?
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