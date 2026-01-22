import { useEffect, useState } from "react";
import BookCard from "../Componants/BookCard";
import { fetchBooks, deleteBook } from "../Api/Books";
import type { BookResponse } from "../Api/Books";
import "../css/Home.css";
import bannerImage from "../assets/Images/BannerImage.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
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
      await deleteBook(id); // backend delete
      setBooks((prev) => prev.filter((b) => b.id !== id)); // UI update
    } catch (err) {
      console.error("Failed to delete book", err);
    }
  };

  /* ---------- UPDATE (PLACEHOLDER) ---------- */
  const handleUpdate = () => {
    console.log("Update clicked");
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
      <div className="home-filters">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="All">All</option>
          <option value="English">English</option>
          <option value="Marathi">Marathi</option>
        </select>

        <select>
          <option>Status</option>
          <option>Owned</option>
          <option>Wishlist</option>
        </select>

        <select>
          <option>Sort By</option>
          <option>Name</option>
          <option>Date</option>
        </select>
      </div>

      {/* 📚 BOOK GRID */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="book-grid">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))
          ) : (
            <p>No books found</p>
          )}
        </div>
      )}
    </div>
  );
}
