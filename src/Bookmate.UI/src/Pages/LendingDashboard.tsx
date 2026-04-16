import { useEffect, useMemo, useState } from "react";
import { booksApi, lendingsApi, type Book, type LendingRecord } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../css/lending.css";

type LendingFormState = {
  friend_name: string;
  friend_email: string;
  due_date: string;
};

const initialForm: LendingFormState = {
  friend_name: "",
  friend_email: "",
  due_date: "",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function LendingDashboard() {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [lendings, setLendings] = useState<LendingRecord[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [form, setForm] = useState<LendingFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [ownedBooks, lendingRecords] = await Promise.all([
        booksApi.listMine(token),
        lendingsApi.list(token),
      ]);
      setBooks(ownedBooks);
      setLendings(lendingRecords);
    } catch (err) {
      setError((err as Error).message || "Unable to load your lending dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [token]);

  const activeLendings = useMemo(
    () => lendings.filter((lending) => lending.status === "active" || lending.status === "overdue"),
    [lendings]
  );

  const activeLendingByBook = useMemo(
    () => new Map(activeLendings.map((lending) => [lending.book_id, lending])),
    [activeLendings]
  );

  const selectedPreview = useMemo(() => {
    if (!selectedBook) return null;
    return activeLendingByBook.get(selectedBook.id) || null;
  }, [activeLendingByBook, selectedBook]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedBook) return;

    setSaving(true);
    setError("");
    setMessage("");
    try {
      await lendingsApi.lend(token, selectedBook.id, form);
      setMessage("Book lent successfully. A borrower confirmation email was attempted immediately.");
      setSelectedBook(null);
      setForm(initialForm);
      await loadDashboard();
    } catch (err) {
      setError((err as Error).message || "Unable to lend this book.");
    } finally {
      setSaving(false);
    }
  }

  async function markReturned(lendingId: string) {
    if (!token) return;
    setError("");
    setMessage("");
    try {
      await lendingsApi.markReturned(token, lendingId);
      setMessage("Book marked as returned.");
      await loadDashboard();
    } catch (err) {
      setError((err as Error).message || "Unable to mark the book as returned.");
    }
  }

  async function runRemindersNow() {
    if (!token) return;
    setError("");
    setMessage("");
    try {
      const result = await lendingsApi.runReminders(token);
      setMessage(`Reminder run completed. ${result.sent} email(s) were queued for sending.`);
      await loadDashboard();
    } catch (err) {
      setError((err as Error).message || "Unable to run reminders right now.");
    }
  }

  return (
    <section className="page-shell lending-page">
      <div className="section-heading">
        <p className="page-eyebrow">Owner dashboard</p>
        <h1>Book Lending Tracker</h1>
        <p>Manage your own books, lend them by email, and keep an eye on active and overdue returns.</p>
      </div>

      <div className="lending-summary-grid">
        <article className="stack-card lending-summary-card">
          <strong>{books.length}</strong>
          <span>Owned books</span>
        </article>
        <article className="stack-card lending-summary-card">
          <strong>{activeLendings.length}</strong>
          <span>Currently lent out</span>
        </article>
        <article className="stack-card lending-summary-card">
          <strong>{lendings.filter((item) => item.status === "overdue").length}</strong>
          <span>Overdue reminders</span>
        </article>
      </div>

      {message ? <p className="page-status">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="lending-layout">
        <section className="list-panel lending-books-panel">
          <div className="panel-heading">
            <div>
              <p className="page-eyebrow">Feature 1</p>
              <h2>Owner Book Dashboard</h2>
            </div>
          </div>

          {loading ? (
            <p className="page-status">Loading your books...</p>
          ) : books.length === 0 ? (
            <div className="empty-panel">
              <h3>No owned books yet</h3>
              <p>Add books from the main dashboard first. New books are now saved with your user id as owner.</p>
            </div>
          ) : (
            <div className="owner-book-stack">
              {books.map((book) => {
                const lending = activeLendingByBook.get(book.id);
                const status = lending ? "Lent Out" : "Available";
                return (
                  <article key={book.id} className="owner-book-card">
                    <div className="owner-book-cover">
                      {book.image_url ? (
                        <img src={book.image_url} alt={book.title} />
                      ) : (
                        <div className="owner-cover-placeholder">{book.title.slice(0, 1)}</div>
                      )}
                    </div>

                    <div className="owner-book-body">
                      <div className="owner-book-top">
                        <div>
                          <h3>{book.title}</h3>
                          <p>{book.author}</p>
                        </div>
                        <span className={lending ? "lending-status lent" : "lending-status available"}>
                          {status}
                        </span>
                      </div>

                      {lending ? (
                        <p className="owner-book-meta">
                          With {lending.friend_name} until {formatDate(lending.due_date)}
                        </p>
                      ) : (
                        <p className="owner-book-meta">Ready to lend whenever you choose.</p>
                      )}
                    </div>

                    <div className="owner-book-actions">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={Boolean(lending)}
                        onClick={() => {
                          setSelectedBook(book);
                          setForm(initialForm);
                        }}
                      >
                        {lending ? "Already Lent" : "Lend Book"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="lending-side-column">
          <section className="form-card">
            <div className="panel-heading">
              <div>
                <p className="page-eyebrow">Feature 2</p>
                <h2>Lend Book Flow</h2>
              </div>
            </div>

            {selectedBook ? (
              <form className="lending-form" onSubmit={handleSubmit}>
                <div className="lending-book-preview">
                  <strong>{selectedBook.title}</strong>
                  <span>{selectedBook.author}</span>
                </div>

                <label>
                  Friend's name
                  <input
                    value={form.friend_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, friend_name: event.target.value }))}
                    placeholder="Emma"
                    required
                  />
                </label>

                <label>
                  Friend's email
                  <input
                    type="email"
                    value={form.friend_email}
                    onChange={(event) => setForm((prev) => ({ ...prev, friend_email: event.target.value }))}
                    placeholder="emma@example.com"
                    required
                  />
                </label>

                <label>
                  Return deadline
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(event) => setForm((prev) => ({ ...prev, due_date: event.target.value }))}
                    required
                  />
                </label>

                <div className="form-actions">
                  <button type="button" className="secondary-button" onClick={() => setSelectedBook(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-button" disabled={saving}>
                    {saving ? "Saving..." : "Confirm lending"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="empty-panel compact-empty">
                <h3>Select a book first</h3>
                <p>Choose any available book from your dashboard to open the lending form.</p>
              </div>
            )}
          </section>

          <section className="list-panel reminder-preview-panel">
            <div className="panel-heading">
              <div>
                <p className="page-eyebrow">Feature 4</p>
                <h2>Email reminder preview</h2>
              </div>
            </div>

            <div className="reminder-preview-card">
              <p className="reminder-subject">Subject: Book Return Reminder</p>
              <p>Hello {selectedPreview?.friend_name || "[Friend Name]"},</p>
              <p>
                You have borrowed the book {selectedPreview?.book_name || "[Book Name]"}.
                Please return it by {selectedPreview ? formatDate(selectedPreview.due_date) : "[Due Date]"}.
              </p>
              <p>Thank you!</p>
            </div>
          </section>
        </aside>
      </div>

      <section className="list-panel">
          <div className="panel-heading">
            <div>
              <p className="page-eyebrow">Feature 3</p>
              <h2>Lent Books Section</h2>
            </div>
            <button type="button" className="secondary-button" onClick={() => void runRemindersNow()}>
              Send Reminders Now
            </button>
          </div>

        {loading ? (
          <p className="page-status">Loading lent books...</p>
        ) : lendings.length === 0 ? (
          <div className="empty-panel">
            <h3>No lending records yet</h3>
            <p>Your active, overdue, and returned books will appear here once you lend one out.</p>
          </div>
        ) : (
          <div className="lending-record-grid">
            {lendings.map((record) => (
              <article key={record.id} className="lending-record-card">
                <div className="lending-record-header">
                  <div>
                    <h3>{record.book_name}</h3>
                    <p>{record.friend_name}</p>
                  </div>
                  <span className={record.status === "overdue" ? "record-pill overdue" : "record-pill"}>
                    {record.status === "returned" ? "Returned" : record.status === "overdue" ? "Overdue" : "Active"}
                  </span>
                </div>

                <dl className="lending-record-details">
                  <div>
                    <dt>Email</dt>
                    <dd>{record.friend_email}</dd>
                  </div>
                  <div>
                    <dt>Lending date</dt>
                    <dd>{formatDate(record.lend_date)}</dd>
                  </div>
                  <div>
                    <dt>Due date</dt>
                    <dd>{formatDate(record.due_date)}</dd>
                  </div>
                  <div>
                    <dt>Reminder stage</dt>
                    <dd>{record.reminder_stage || "Pending"}</dd>
                  </div>
                </dl>

                {record.status !== "returned" ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => markReturned(record.id)}
                  >
                    Mark as Returned
                  </button>
                ) : (
                  <p className="returned-note">Returned {record.returned_at ? formatDate(record.returned_at) : "recently"}.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
