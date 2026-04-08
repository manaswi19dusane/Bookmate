import { useEffect, useState } from "react";
import { createPreference, fetchPreferences, UserPreference } from "../Api/auth";

export default function Preferences() {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [genre, setGenre] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPreferences = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPreferences();
      setPreferences(data);
    } catch (err) {
      setError((err as Error).message || "Could not load preferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleAddPreference = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const preference = await createPreference({ genre, author });
      setPreferences((prev) => [preference, ...prev]);
      setGenre("");
      setAuthor("");
    } catch (err) {
      setError((err as Error).message || "Could not create preference");
    }
  };

  return (
    <div className="preferences-page">
      <div className="preferences-header">
        <h2>Preferences</h2>
      </div>

      <form className="preference-form" onSubmit={handleAddPreference}>
        <input
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
        />
        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <button type="submit">Add Preference</button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading preferences...</p>
      ) : preferences.length === 0 ? (
        <p>No preferences yet.</p>
      ) : (
        <div className="preferences-list">
          {preferences.map((preference) => (
            <div key={preference.id} className="preference-item">
              <strong>{preference.genre}</strong>
              <span>{preference.author}</span>
              <small>{new Date(preference.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}