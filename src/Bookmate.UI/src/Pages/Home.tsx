import { useEffect, useState } from "react";
import BookCard from "../Componants/BookCard";
import { fetchBooks, deleteBook } from "../Api/Books";

import type { BookResponse } from "../Api/Books";
import "../css/Home.css";
import bannerImage from "../assets/Images/BannerImage.png";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  language: string;
}

export default function Home({ language }: HomeProps) {
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  const handleDelete = async (id: string) => {
  try {
    await deleteBook(id); // ✅ NOW USED
    setBooks((prev) => prev.filter((b) => b.id !== id));
  } catch (err) {
    console.error("Failed to delete book", err);
  }
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
          <p>Track, organize and discover books easily</p>
          <button className="add-book-btn" onClick={() => navigate("/add")}>+ Add New Book</button>
        </div>

        <div className="hero-right">
          <img
            src={bannerImage}
            alt="Reading"
            className="hero-image"
          />
        </div>
      </div>

      {/* ⚪ FILTER BAR */}
      <div className="home-filters">
        <select>
          <option>Language</option>
          <option>English</option>
          <option>Marathi</option>
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