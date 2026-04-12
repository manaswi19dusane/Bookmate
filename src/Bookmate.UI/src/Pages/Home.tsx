import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../Componants/BookCard";
import UpdateBook from "../Componants/updatebook";
import { booksApi, libraryApi, type Book } from "../services/api";
import { useAuth } from "../context/AuthContext";
import bannerImage from "../assets/Images/BannerImage.png";

interface HomeProps {
  searchQuery?: string;
}

export default function Home({ searchQuery = "" }: HomeProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const deferredQuery = useDeferredValue(searchQuery);

  async function loadBooks() {
    setLoading(true);
    setError("");
    try {
      setBooks(await booksApi.list());
    } catch (err) {
      setError((err as Error).message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const query = deferredQuery.trim().toLowerCase();
    return books.filter((book) => {
      const languageMatch =
        selectedLanguage === "All" || book.language.toLowerCase() === selectedLanguage.toLowerCase();
      const queryMatch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);
      return languageMatch && queryMatch;
    });
  }, [books, deferredQuery, selectedLanguage]);

  async function handleDelete(bookId: string) {
    try {
      await booksApi.remove(bookId);
      setBooks((prev) => prev.filter((book) => book.id !== bookId));
    } catch (err) {
      setError((err as Error).message || "Unable to delete the book.");
    }
  }

  async function addToLibrary(bookId: string, status: "reading" | "wishlist") {
    if (!token) return;
    try {
      await libraryApi.add(token, bookId, status);
    } catch (err) {
      setError((err as Error).message || "Unable to update your library.");
    }
  }

  return (
    <section className="page-shell">
      <div className="hero-banner">
        <div className="hero-left">
          <p className="page-eyebrow">Your personal reading hub</p>
          <h1>Manage your shelf, reading activity, and listings from one workspace.</h1>
          <p>
            Browse books from the live backend, update details, add them to your library,
            and jump into marketplace or preference flows without leaving the app.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate("/add")}>
              Add new book
            </button>
            <button className="secondary-button" onClick={() => navigate("/library")}>
              Open library
            </button>
          </div>
        </div>
        <div className="hero-right">
          <img src={bannerImage} alt="Bookmate banner" className="hero-image" />
        </div>
      </div>

      <div className="toolbar">
        <div>
          <p className="toolbar-label">Language</p>
          <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)}>
            <option value="All">All</option>
            <option value="English">English</option>
            <option value="Marathi">Marathi</option>
          </select>
        </div>
        <div className="toolbar-meta">
          <p className="toolbar-label">Visible books</p>
          <strong>{filteredBooks.length}</strong>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="page-status">Loading books...</p>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-panel">
          <h3>No books match this view</h3>
          <p>Try a different search or add your first book to get started.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              secondaryText={book.published_date ? `Published ${book.published_date}` : book.language}
              actions={
                <>
                  <button className="icon-button" onClick={() => setSelectedBook(book)}>Edit</button>
                  <button className="icon-button" onClick={() => addToLibrary(book.id, "reading")}>Read</button>
                  <button className="icon-button" onClick={() => addToLibrary(book.id, "wishlist")}>Wishlist</button>
                  <button className="icon-button danger" onClick={() => handleDelete(book.id)}>Delete</button>
                </>
              }
            />
          ))}
        </div>
      )}

      {selectedBook ? (
        <UpdateBook
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdated={() => {
            setSelectedBook(null);
            void loadBooks();
          }}
        />
      ) : null}
    </section>
  );
}
