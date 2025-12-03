import { useState } from "react";
import "../css/AddBook.css";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  return (
    <div className="add-container">
      <form className="add-form">
        <h2>Add New Book</h2>

        <input
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <button>Add Book</button>
      </form>
    </div>
  );
}
