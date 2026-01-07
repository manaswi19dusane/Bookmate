import { useEffect, useState } from "react";
import BookCard from "../Componants/BookCard";
import { fetchBooks } from "../Api/Books";
import type { BookResponse } from "../Api/Books";
import "../css/Home.css";

interface HomeProps {
  language: string;
}

export default function Home({ language }: HomeProps) {
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch (err) {
        console.error("Failed to load books", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 🔍 Language filter only (search moved to Navbar)
  const filteredBooks = books.filter(
    (b) => b.language?.toLowerCase() === language.toLowerCase()
  );

  // 🗑 Delete handler
  const handleDelete = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  // ✏ Update handler (placeholder)
  const handleUpdate = () => {
    console.log("Update clicked");
  };

return (
  <div className="home-page">

    {/* 🔵 BANNER */}
    <div className="hero-banner">
      <div className="hero-left">
        <h2>Manage Your Books Smartly</h2>
        <button className="add-book-btn">Add New Book</button>
      </div>

      <div className="hero-right">
        <img
          src="/banner-girl.png"
          alt="Reading"
        />
      </div>
    </div>

    {/* ⚪ FILTER BAR */}
    <div className="filter-bar">
      <div className="filter-item">
        <label>Language:</label>
        <select>
          <option>English</option>
          <option>Marathi</option>
        </select>
      </div>

      <div className="filter-item">
        <label>Status:</label>
        <select>
          <option>All</option>
          <option>Read</option>
          <option>Unread</option>
        </select>
      </div>

      <div className="filter-item">
        <label>Sort By:</label>
        <select>
          <option>Name</option>
          <option>Date</option>
        </select>
      </div>
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