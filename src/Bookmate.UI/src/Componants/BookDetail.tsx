import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { booksApi, type Book } from "../services/api";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Book not found.");
      setLoading(false);
      return;
    }

    booksApi
      .get(id)
      .then(setBook)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-shell"><p className="page-status">Loading book details...</p></div>;
  if (error || !book) return <div className="page-shell"><p className="form-error">{error || "Book not found."}</p></div>;

  return (
    <section className="page-shell detail-page">
      <div className="detail-card">
        <div className="detail-cover">
          {book.image_url ? <img src={book.image_url} alt={book.title} /> : <div className="image-placeholder">{book.title[0]}</div>}
        </div>
        <div className="detail-body">
          <p className="page-eyebrow">Book detail</p>
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          <dl className="detail-grid">
            <div>
              <dt>Language</dt>
              <dd>{book.language || "Not provided"}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{book.published_date || "Not provided"}</dd>
            </div>
            <div>
              <dt>Purchased</dt>
              <dd>{book.purchased_date || "Not provided"}</dd>
            </div>
            <div>
              <dt>ID</dt>
              <dd>{book.id}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{book.isbn || "Not provided"}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{book.source || "Manual"}</dd>
            </div>
          </dl>
          {book.description ? (
            <div>
              <h3>Description</h3>
              <p className="detail-author">{book.description}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
