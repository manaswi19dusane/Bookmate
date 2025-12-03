import { useState } from "react";
import BookCard from "../Componants/BookCard";
import { books } from "../Data/books";
import "../css/Home.css";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter books based on search term
  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Books Grid */}
      <div className="home">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((b) => <BookCard key={b.id} book={b} />)
        ) : (
          <p>No books found</p>
        )}
      </div>
    </div>
  );
}
