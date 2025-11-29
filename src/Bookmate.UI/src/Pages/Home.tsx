import BookCard from "../Componants/BookCard";
import { books } from "../Data/books";
import "../css/Home.css";

export default function Home() {
  return (
    <div className="home2">
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}
