import { useNavigate } from "react-router-dom";
import "../css/welcome.css";


export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <h1 className="title">📚 Welcome to Bookmate</h1>
        <p className="subtitle">Choose your book language</p>

        <div className="btn-group">
          <button className="lang-btn" onClick={() => navigate("/books/english")}>
            English Books
          </button>

          <button className="lang-btn" onClick={() => navigate("/books/marathi")}>
            Marathi / Hindi Books
          </button>
        </div>
      </div>
    </div>
  );
}
