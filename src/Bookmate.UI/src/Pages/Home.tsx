import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookCard from "../Componants/BookCard";
import UpdateBook from "../Componants/updatebook";
import {
  booksApi,
  interactionsApi,
  libraryApi,
  preferencesApi,
  wishlistApi,
  type Book,
} from "../services/api";
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
  const [summary, setSummary] = useState({
    libraryCount: 0,
    preferenceCount: 0,
    interactionCount: 0,
  });
  const deferredQuery = useDeferredValue(searchQuery);

  async function loadBooks() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setBooks(await booksApi.listMine(token));
    } catch (err) {
      setError((err as Error).message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBooks();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    Promise.allSettled([
      libraryApi.list(token),
      preferencesApi.list(token),
      interactionsApi.list(token),
    ]).then(([libraryResult, preferenceResult, interactionResult]) => {
      setSummary({
        libraryCount: libraryResult.status === "fulfilled" ? libraryResult.value.length : 0,
        preferenceCount: preferenceResult.status === "fulfilled" ? preferenceResult.value.length : 0,
        interactionCount: interactionResult.status === "fulfilled" ? interactionResult.value.length : 0,
      });
    });
  }, [token]);

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
    if (!token) return;
    try {
      await booksApi.remove(bookId, token);
      setBooks((prev) => prev.filter((book) => book.id !== bookId));
    } catch (err) {
      setError((err as Error).message || "Unable to delete the book.");
    }
  }

  async function addToLibrary(bookId: string, status: "reading" | "wishlist") {
    if (!token) return;
    try {
      await libraryApi.add(token, bookId, status);
      setSummary((prev) => ({ ...prev, libraryCount: prev.libraryCount + 1 }));
    } catch (err) {
      setError((err as Error).message || "Unable to update your library.");
    }
  }

  async function addToWishlist(book: Book) {
    if (!token) return;
    try {
      await wishlistApi.create(token, {
        book_name: book.title,
        author: book.author,
        image: book.image_url || null,
      });
    } catch (err) {
      setError((err as Error).message || "Unable to update your wishlist.");
    }
  }

  const quickStartItems = [
    {
      title: "Add your first book",
      done: books.length > 0,
      description: "Build the catalog that powers search, library management, and recommendations.",
      actionLabel: "Add book",
      actionPath: "/add",
    },
    {
      title: "Save reading preferences",
      done: summary.preferenceCount > 0,
      description: "Store a favorite genre or author so the app can personalize suggestions.",
      actionLabel: "Open preferences",
      actionPath: "/preferences",
    },
    {
      title: "Track one activity",
      done: summary.interactionCount > 0,
      description: "Record a view, like, rating, or purchase to make the experience more useful.",
      actionLabel: "Open activity",
      actionPath: "/interactions",
    },
  ];

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
            <Link className="secondary-button" to="/guide">
              User guide
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <img src={bannerImage} alt="Bookmate banner" className="hero-image" />
        </div>
      </div>

      <div className="guide-grid">
        <div className="list-panel">
          <h2>Workspace snapshot</h2>
          <div className="stats-grid">
            <article className="stack-card stat-card">
              <strong>{books.length}</strong>
              <span>Books in catalog</span>
            </article>
            <article className="stack-card stat-card">
              <strong>{summary.libraryCount}</strong>
              <span>Books in your library</span>
            </article>
            <article className="stack-card stat-card">
              <strong>{summary.preferenceCount}</strong>
              <span>Saved preferences</span>
            </article>
            <article className="stack-card stat-card">
              <strong>{summary.interactionCount}</strong>
              <span>Tracked interactions</span>
            </article>
          </div>
        </div>

        <div className="list-panel">
          <h2>Quick start checklist</h2>
          <div className="stack-list">
            {quickStartItems.map((item) => (
              <article key={item.title} className="stack-card checklist-card">
                <div className="checklist-status">
                  <span className={item.done ? "status-pill done" : "status-pill"}>{item.done ? "Done" : "Next"}</span>
                  <strong>{item.title}</strong>
                </div>
                <p>{item.description}</p>
                <Link to={item.actionPath} className="secondary-button">
                  {item.actionLabel}
                </Link>
              </article>
            ))}
          </div>
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
          <div className="hero-actions centered-actions">
            <Link to="/add" className="primary-button">
              Add your first book
            </Link>
            <Link to="/guide" className="secondary-button">
              Read the guide
            </Link>
          </div>
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
                  <button className="icon-button" onClick={() => addToWishlist(book)}>Wishlist</button>
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
          onUpdated={(updatedBook) => {
            setBooks((prev) => prev.map((book) => (book.id === updatedBook.id ? updatedBook : book)));
            setSelectedBook(null);
          }}
        />
      ) : null}
    </section>
  );
}
