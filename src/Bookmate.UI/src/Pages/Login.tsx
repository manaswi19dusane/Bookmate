import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError((err as Error).message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <p className="auth-eyebrow">Bookmate</p>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your books, library, and marketplace listings.</p>

        <label className="auth-label">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-label">
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-switch">
          Need an account? <Link to="/register">Create one</Link>
        </p>
        <p className="auth-switch">
          First time here? <Link to="/guide">Read the user guide</Link>
        </p>
      </form>
    </div>
  );
}
