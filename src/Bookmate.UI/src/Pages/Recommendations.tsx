import { useEffect, useMemo, useState } from "react";
import BookCard from "../Componants/BookCard";
import { booksApi, interactionsApi, preferencesApi, type Book, type UserInteraction, type UserPreference } from "../services/api";
import { useAuth } from "../context/AuthContext";

type Recommendation = {
  book: Book;
  reason: string;
  score: number;
};

export default function Recommendations() {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([booksApi.listAvailable(token), preferencesApi.list(token), interactionsApi.list(token)])
      .then(([availableBooks, loadedPreferences, loadedInteractions]) => {
        setBooks(availableBooks);
        setPreferences(loadedPreferences);
        setInteractions(loadedInteractions);
      })
      .catch((err) => setError((err as Error).message || "Unable to build recommendations."))
      .finally(() => setLoading(false));
  }, [token]);

  const recommendations = useMemo<Recommendation[]>(() => {
    const preferenceAuthors = new Set(preferences.map((preference) => preference.author.toLowerCase()));
    const interactedBookIds = new Set(interactions.map((interaction) => interaction.book_id));

    return books
      .filter((book) => !interactedBookIds.has(book.id))
      .map((book) => {
        const authorMatch = preferenceAuthors.has(book.author.toLowerCase());
        const score = authorMatch ? 0.9 : 0.6;
        return {
          book,
          score,
          reason: authorMatch
            ? `Matches one of your preferred authors: ${book.author}`
            : `Available to explore based on your current reading activity.`,
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
  }, [books, interactions, preferences]);

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Discover</p>
        <h1>Recommendations</h1>
        <p>This view combines existing backend data from available books, preferences, and interactions.</p>
      </div>

      {loading ? (
        <p className="page-status">Building recommendations...</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : recommendations.length === 0 ? (
        <div className="empty-panel">
          <h3>No recommendations yet</h3>
          <p>Add preferences and interactions to help the UI rank books for you.</p>
        </div>
      ) : (
        <div className="card-grid">
          {recommendations.map((recommendation) => (
            <BookCard
              key={recommendation.book.id}
              book={recommendation.book}
              badge={`${Math.round(recommendation.score * 100)}% match`}
              secondaryText={recommendation.reason}
            />
          ))}
        </div>
      )}
    </section>
  );
}
