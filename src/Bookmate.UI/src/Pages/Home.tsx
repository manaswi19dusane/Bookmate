import { useEffect, useState } from "react";
import BookCard from "../Componants/BookCard";
import { fetchBooks } from "../Api/Books"; 
import type { BookResponse } from "../Api/Books";
import "../css/Home.css";

interface HomeProps {
  language: string;
}

export default function Home({ language }: HomeProps) {
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredBooks = books.filter(
    (b) =>
      b.language?.toLowerCase() === language.toLowerCase() &&
      b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="home">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((b) => <BookCard key={b.id} book={b} />)
          ) : (
            <p>No books found</p>
          )}
        </div>
      )}
    </div>
  );
}
