import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../services/api";
import "../css/BookCard.css";

type BookCardProps = {
  book: Book;
  badge?: string;
  secondaryText?: string;
  actions?: ReactNode;
};

export default function BookCard({ book, badge, secondaryText, actions }: BookCardProps) {
  const navigate = useNavigate();

  return (
    <article className="book-card" onClick={() => navigate(`/book/${book.id}`)} role="button" tabIndex={0}>
      <div className="book-image-wrapper">
        {book.image_url ? (
          <img src={book.image_url} alt={book.title} />
        ) : (
          <div className="image-placeholder">{book.title.slice(0, 1)}</div>
        )}
      </div>

      <div className="book-info">
        <div className="book-card-topline">
          <p className="book-author">{book.author}</p>
          {badge && <span className="book-status owned">{badge}</span>}
        </div>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-meta">{secondaryText || book.language || "Language not set"}</p>
      </div>

      {actions ? (
        <div className="book-actions" onClick={(event) => event.stopPropagation()}>
          {actions}
        </div>
      ) : null}
    </article>
  );
}
