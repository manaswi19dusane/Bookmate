import { useEffect, useState } from "react";
import { booksApi, lendingsApi, type Book, type Lending } from "../services/api";

export default function Lending() {
  const [books, setBooks] = useState<Book[]>([]);
  const [lendings, setLendings] = useState<Lending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  // Lend form state
  const [showLendForm, setShowLendForm] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [allBooks, allLendings] = await Promise.all([
        booksApi.list(),
        lendingsApi.list(),
      ]);
      setBooks(allBooks);
      setLendings(allLendings);
    } catch {
      setError("Failed to load lending data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const lentBookIds = new Set(
    lendings.filter(l => l.status !== "Returned").map(l => l.book_id)
  );

  async function handleLend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookId || !friendName || !friendEmail || !dueDate) {
      setFeedback("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      await lendingsApi.create({ book_id: selectedBookId, friend_name: friendName, friend_email: friendEmail, due_date: dueDate });
      setFeedback("Book lent successfully!");
      setShowLendForm(false);
      setSelectedBookId(""); setFriendName(""); setFriendEmail(""); setDueDate("");
      await load();
    } catch (err) {
      setFeedback((err as Error).message || "Failed to lend book.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn(lending: Lending) {
    try {
      await lendingsApi.markReturned(lending.id);
      setFeedback("Book marked as returned!");
      await load();
    } catch {
      setFeedback("Failed to mark as returned.");
    }
  }

  function getStatusColor(status: string) {
    if (status === "Active") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "Overdue") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#f3f4f6", color: "#6b7280" };
  }

  function getBookTitle(bookId: string) {
    return books.find(b => b.id === bookId)?.title || bookId;
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Lending</p>
        <h1>Book Lending Dashboard</h1>
        <p>Manage books you've lent to friends and track due dates.</p>
      </div>

      {feedback && (
        <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: "16px" }}>{feedback}</p>
      )}
      {error && <p className="form-error">{error}</p>}

      {/* Lend a Book Button */}
      <div style={{ marginBottom: "28px" }}>
        <button
          onClick={() => setShowLendForm(!showLendForm)}
          style={{ padding: "10px 24px", borderRadius: "8px", background: "#4f46e5",
            color: "#fff", border: "none", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
          {showLendForm ? "✕ Cancel" : "📤 Lend a Book"}
        </button>
      </div>

      {/* Lend Form */}
      {showLendForm && (
        <form onSubmit={handleLend} style={{
          background: "#fff", borderRadius: "12px", padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "32px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"
        }}>
          <h3 style={{ gridColumn: "1/-1", margin: 0, fontSize: "17px" }}>Lend a Book</h3>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Book
            <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}>
              <option value="">Select a book...</option>
              {books.filter(b => !lentBookIds.has(b.id)).map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Friend's Name
            <input value={friendName} onChange={e => setFriendName(e.target.value)}
              placeholder="John Doe"
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Friend's Email
            <input type="email" value={friendEmail} onChange={e => setFriendEmail(e.target.value)}
              placeholder="john@email.com"
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Due Date
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
          </label>

          <div style={{ gridColumn: "1/-1", display: "flex", gap: "12px" }}>
            <button type="submit" disabled={submitting}
              style={{ padding: "10px 24px", borderRadius: "8px", background: "#4f46e5",
                color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
              {submitting ? "Lending..." : "✅ Confirm Lend"}
            </button>
          </div>
        </form>
      )}

      {/* All Books — Status Grid */}
      {!loading && (
        <>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>My Books</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "40px" }}>
            {books.map(book => {
              const isLent = lentBookIds.has(book.id);
              return (
                <div key={book.id} style={{
                  background: "#fff", borderRadius: "10px", padding: "16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "8px"
                }}>
                  {book.image_url && (
                    <img src={book.image_url} alt={book.title}
                      style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px" }} />
                  )}
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>{book.title}</h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{book.author}</p>
                  <span style={{
                    padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                    background: isLent ? "#fee2e2" : "#dcfce7",
                    color: isLent ? "#dc2626" : "#16a34a",
                    alignSelf: "flex-start"
                  }}>
                    {isLent ? "Lent Out" : "Available"}
                  </span>
                  {!isLent && (
                    <button onClick={() => { setSelectedBookId(book.id); setShowLendForm(true); }}
                      style={{ padding: "6px 14px", borderRadius: "6px", background: "#ede9fe",
                        color: "#4f46e5", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      📤 Lend
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Lendings Table */}
          {lendings.length > 0 && (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Lent Books</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff",
                  borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Book", "Friend", "Email", "Due Date", "Status", "Action"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px",
                          fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lendings.map(l => {
                      const sc = getStatusColor(l.status);
                      return (
                        <tr key={l.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>{getBookTitle(l.book_id)}</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px" }}>{l.friend_name}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{l.friend_email}</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px" }}>{l.due_date}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px",
                              fontWeight: 600, background: sc.bg, color: sc.color }}>
                              {l.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {l.status !== "Returned" && (
                              <button onClick={() => handleReturn(l)}
                                style={{ padding: "6px 14px", borderRadius: "6px", background: "#dcfce7",
                                  color: "#16a34a", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                ✓ Mark Returned
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
