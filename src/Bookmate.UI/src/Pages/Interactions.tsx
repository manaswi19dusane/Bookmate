import { useEffect, useState } from "react";
import { createInteraction, fetchInteractions, UserInteraction } from "../Api/auth";

export default function Interactions() {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [bookId, setBookId] = useState("");
  const [interactionType, setInteractionType] = useState("view");
  const [rating, setRating] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInteractions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInteractions();
      setInteractions(data);
    } catch (err) {
      setError((err as Error).message || "Could not load interactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInteractions();
  }, []);

  const handleAddInteraction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const payload = {
      book_id: bookId,
      interaction_type: interactionType,
      rating: rating === "" ? undefined : Number(rating),
    };

    try {
      const interaction = await createInteraction(payload);
      setInteractions((prev) => [interaction, ...prev]);
      setBookId("");
      setInteractionType("view");
      setRating("");
    } catch (err) {
      setError((err as Error).message || "Could not create interaction");
    }
  };

  return (
    <div className="interactions-page">
      <div className="interactions-header">
        <h2>Interactions</h2>
      </div>

      <form className="interaction-form" onSubmit={handleAddInteraction}>
        <input
          placeholder="Book ID"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          required
        />
        <select
          value={interactionType}
          onChange={(e) => setInteractionType(e.target.value)}
        >
          <option value="view">View</option>
          <option value="like">Like</option>
          <option value="rating">Rating</option>
        </select>
        <input
          type="number"
          placeholder="Rating (optional)"
          value={rating}
          onChange={(e) => {
            const value = e.target.value;
            setRating(value === "" ? "" : Number(value));
          }}
          min={1}
          max={5}
        />
        <button type="submit">Add Interaction</button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading interactions...</p>
      ) : interactions.length === 0 ? (
        <p>No interactions yet.</p>
      ) : (
        <div className="interactions-list">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="interaction-item">
              <strong>{interaction.interaction_type}</strong>
              <span>{interaction.book_id}</span>
              <span>Rating: {interaction.rating ?? "N/A"}</span>
              <small>{new Date(interaction.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}