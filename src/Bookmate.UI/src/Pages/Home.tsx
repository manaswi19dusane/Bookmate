import { useEffect, useState } from "react";
import UpdateBook from "../Componants/updatebook";
import BookCard from "../Componants/BookCard";
import { fetchBooks, deleteBook } from "../Api/Books";
import type { BookResponse } from "../Api/Books";
import "../css/Home.css";
import bannerImage from "../assets/Images/BannerImage.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [sortBy, setSortBy] = useState(""); // new state for sorting

  const [selectedBook, setSelectedBook] = useState<BookResponse | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const navigate = useNavigate();

  /* ---------- LOAD BOOKS ---------- */
  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  /* ---------- FILTER ---------- */
  const filteredBooks =
    selectedLanguage === "All"
      ? books
      : books.filter(
          (b) =>
            b.language &&
            b.language.toLowerCase() === selectedLanguage.toLowerCase()
        );

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete book", err);
    }
  };

  /* ---------- UPDATE ---------- */
  const handleUpdate = (book: BookResponse) => {
    setSelectedBook(book);
    setShowDrawer(true);
  };

  return (
    <div className="home-page">
      {/* 🔵 BANNER */}
      <div className="hero-banner">
        <div className="hero-left">
          <h2>Manage Your Books Smartly</h2>
          <p>Track, organize and discover books easily</p>
          <button className="add-book-btn" onClick={() => navigate("/add")}>
            + Add New Book
          </button>
        </div>

        <div className="hero-right">
          <img src={bannerImage} alt="Reading" className="hero-image" />
        </div>
      </div>

      {/* ⚪ FILTER BAR */}
      {/* ⚪ FILTER BAR */}
<div className="home-filters">
  {/* Language Select */}
  <select
    value={selectedLanguage}
    onChange={(e) => setSelectedLanguage(e.target.value)}
  >
    <option value="All">Language</option>
    <option value="English">English</option>
    <option value="Marathi">Marathi</option>
  </select>

  {/* Sort By Select */}
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
  >
    <option value="" disabled>
      Sort By
    </option>
    <option value="name">Name</option>
    <option value="date">Date</option>
  </select>
</div>


      {/* 📚 BOOK GRID */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* 🧩 UPDATE DRAWER */}
      {showDrawer && selectedBook && (
        <UpdateBook
          book={selectedBook}
          onClose={() => setShowDrawer(false)}
          onUpdated={loadBooks}
        />
      )}
    </div>
  );
}
<option value="All" disabled>
  Language
</option>
