import { useState, useEffect } from "react";
import { recommendationsApi, authApi, Recommendation } from "../services/api";
import BookCard from "../Componants/BookCard.tsx";
import "../css/BookCard.css";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");
      
      const user = authApi.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const data = await recommendationsApi.getForUser(user.id);
      setRecommendations(data);
    } catch (err) {
      setError((err as Error).message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Recommendations</h2>
        <div className="loading">Loading recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h2>Recommendations</h2>
        <div className="error">{error}</div>
        <button onClick={fetchRecommendations} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Your Book Recommendations</h2>
      
      {recommendations.length === 0 ? (
        <div className="empty-state">
          <p>No recommendations available yet.</p>
          <p>Add more preferences and interactions to get personalized recommendations.</p>
        </div>
      ) : (
        <div className="books-grid">
          {recommendations.map((rec) => (
            <div key={rec.book_id} className="recommendation-card">
              <BookCard book={rec.book} />
              <div className="recommendation-score">
                <span className="score-label">Match Score:</span>
                <span className="score-value">{Math.round(rec.score * 100)}%</span>
              </div>
              {rec.reason && (
                <p className="recommendation-reason">{rec.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}