import { Link } from "react-router-dom";
import { getApiRoot } from "../services/api";

const quickStartSteps = [
  {
    title: "Create your account",
    description: "Register with your email, then sign in to unlock your personal reading workspace.",
    actionLabel: "Open register",
    actionPath: "/register",
  },
  {
    title: "Add your first book",
    description: "Create at least one book entry so it can be used across your library, activity, and recommendations.",
    actionLabel: "Add a book",
    actionPath: "/add",
  },
  {
    title: "Set your reading preferences",
    description: "Save favorite authors or genres so recommendations can feel more relevant from the start.",
    actionLabel: "Set preferences",
    actionPath: "/preferences",
  },
  {
    title: "Track activity",
    description: "Record views, ratings, likes, or purchases to build a more useful reading history.",
    actionLabel: "Open activity",
    actionPath: "/interactions",
  },
];

const featureGroups = [
  {
    title: "Personal reading flow",
    items: [
      "Home helps you browse books, search by title or author, and quickly add items to your library or wishlist.",
      "Library keeps your reading, completed, and wishlist items organized in one place.",
      "Preferences and Activity work together to improve recommendations.",
    ],
  },
  {
    title: "Discovery and support",
    items: [
      "Recommendations ranks books using your saved preferences and recorded interactions.",
      "AI Chat can help with book ideas and general reading support.",
      "Marketplace, Institution, Club, and Community pages support broader group and exchange scenarios.",
    ],
  },
];

export default function UserGuide() {
  const apiRoot = getApiRoot();

  return (
    <section className="page-shell">
      <div className="hero-banner">
        <div className="hero-left">
          <p className="page-eyebrow">Guide</p>
          <h1>Start using Bookmate in minutes.</h1>
          <p>
            This guide is designed for a first-time user. Follow the quick start steps below
            and you can move from signup to recommendations without needing outside help.
          </p>
          <div className="hero-actions">
            <Link to="/add" className="primary-button">
              Add first book
            </Link>
            <a href={`${apiRoot}/docs`} className="secondary-button" target="_blank" rel="noreferrer">
              Open API docs
            </a>
          </div>
        </div>
        <div className="hero-right">
          <div className="guide-highlight">
            <strong>Best first workflow</strong>
            <p>Register → Add a book → Add to library → Save preferences → Track activity → View recommendations</p>
          </div>
        </div>
      </div>

      <div className="guide-grid">
        <div className="list-panel">
          <h2>Quick start</h2>
          <div className="stack-list">
            {quickStartSteps.map((step, index) => (
              <article key={step.title} className="stack-card guide-step">
                <span className="guide-step-number">0{index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
                <Link to={step.actionPath} className="secondary-button">
                  {step.actionLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="list-panel">
          <h2>How each area helps</h2>
          <div className="stack-list">
            {featureGroups.map((group) => (
              <article key={group.title} className="stack-card guide-block">
                <strong>{group.title}</strong>
                <ul className="guide-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="guide-grid">
        <div className="list-panel">
          <h2>Before you share this with users</h2>
          <div className="stack-list">
            <article className="stack-card">
              <strong>Backend must be running</strong>
              <p>
                Start the API on <code>{apiRoot}</code> so login, books, library, and
                recommendations all work properly.
              </p>
            </article>
            <article className="stack-card">
              <strong>Frontend must point to the correct API</strong>
              <p>
                If your backend is hosted elsewhere, set <code>VITE_API_URL</code> in the UI
                environment before launching the app.
              </p>
            </article>
            <article className="stack-card">
              <strong>Seed or add initial books</strong>
              <p>
                Recommendations and library features feel much better when the catalog already has
                a few books to choose from.
              </p>
            </article>
          </div>
        </div>

        <div className="list-panel">
          <h2>Useful links</h2>
          <div className="stack-list">
            <article className="stack-card">
              <strong>Frontend app</strong>
              <p>Use the main app for day-to-day actions like adding books or managing a library.</p>
              <Link to="/" className="secondary-button">
                Open dashboard
              </Link>
            </article>
            <article className="stack-card">
              <strong>Backend API docs</strong>
              <p>FastAPI documentation is useful for testing endpoints and understanding request shapes.</p>
              <a href={`${apiRoot}/docs`} className="secondary-button" target="_blank" rel="noreferrer">
                Open Swagger docs
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
