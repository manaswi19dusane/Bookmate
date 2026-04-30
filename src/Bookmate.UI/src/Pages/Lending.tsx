import { useEffect, useState } from "react";
import { booksApi, lendingsApi, type Book, type Lending } from "../services/api";

export default function Lending() {
  const [books, setBooks] = useState<Book[]>([]);
  const [lendings, setLendings] = useState<Lending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showLendForm, setShowLendForm] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
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

  useEffect(() => {
    void load();
  }, []);

  const lentBookIds = new Set(
    lendings.filter((lending) => lending.status !== "Returned").map((lending) => lending.book_id)
  );

  async function handleLend(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedBookId || !friendName.trim() || !friendEmail.trim() || !dueDate) {
      setFeedback("All fields are required.");
      return;
    }

    setSubmitting(true);
    setFeedback("");
    try {
      await lendingsApi.create({
        book_id: selectedBookId,
        friend_name: friendName.trim(),
        friend_email: friendEmail.trim(),
        due_date: dueDate,
      });
      setFeedback("Book lent successfully. Email confirmation will be sent when SMTP is configured.");
      setShowLendForm(false);
      setSelectedBookId("");
      setFriendName("");
      setFriendEmail("");
      setDueDate("");
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
      setFeedback("Book marked as returned.");
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
    return books.find((book) => book.id === bookId)?.title || bookId;
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Lending</p>
        <h1>Book Lending Dashboard</h1>
        <p>Manage books you&apos;ve lent to friends and track due dates.</p>
      </div>

      {feedback ? (
        <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: "16px" }}>{feedback}</p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div style={{ marginBottom: "28px" }}>
        <button
          type="button"
          onClick={() => setShowLendForm((current) => !current)}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showLendForm ? "Cancel" : "Lend a Book"}
        </button>
      </div>

      {showLendForm ? (
        <form
          onSubmit={handleLend}
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            marginBottom: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <h3 style={{ gridColumn: "1/-1", margin: 0, fontSize: "17px" }}>Lend a Book</h3>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Book
            <select
              value={selectedBookId}
              onChange={(event) => setSelectedBookId(event.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
            >
              <option value="">Select a book...</option>
              {books.filter((book) => !lentBookIds.has(book.id)).map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Friend&apos;s Name
            <input
              value={friendName}
              onChange={(event) => setFriendName(event.target.value)}
              placeholder="John Doe"
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Friend&apos;s Email
            <input
              type="email"
              value={friendEmail}
              onChange={(event) => setFriendEmail(event.target.value)}
              placeholder="john@email.com"
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 500 }}>
            Due Date
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
            />
          </label>

          <div style={{ gridColumn: "1/-1", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {submitting ? "Lending..." : "Confirm Lend"}
            </button>
          </div>

          <p style={{ gridColumn: "1/-1", margin: 0, fontSize: "13px", color: "#6b7280" }}>
            Confirmation and due-date reminders are sent to this email address.
          </p>
        </form>
      ) : null}

      {!loading ? (
        <>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>My Books</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            {books.map((book) => {
              const isLent = lentBookIds.has(book.id);
              return (
                <div
                  key={book.id}
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {book.image_url ? (
                    <img
                      src={book.image_url}
                      alt={book.title}
                      style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  ) : null}
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>{book.title}</h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{book.author}</p>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: isLent ? "#fee2e2" : "#dcfce7",
                      color: isLent ? "#dc2626" : "#16a34a",
                      alignSelf: "flex-start",
                    }}
                  >
                    {isLent ? "Lent Out" : "Available"}
                  </span>
                  {!isLent ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBookId(book.id);
                        setShowLendForm(true);
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        background: "#ede9fe",
                        color: "#4f46e5",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Lend
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {lendings.length > 0 ? (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Lent Books</h2>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Book", "Friend", "Email", "Due Date", "Status", "Action"].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#374151",
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lendings.map((lending) => {
                      const statusColor = getStatusColor(lending.status);
                      return (
                        <tr key={lending.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>
                            {getBookTitle(lending.book_id)}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "14px" }}>{lending.friend_name}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{lending.friend_email}</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px" }}>{lending.due_date}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "99px",
                                fontSize: "12px",
                                fontWeight: 600,
                                background: statusColor.bg,
                                color: statusColor.color,
                              }}
                            >
                              {lending.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {lending.status !== "Returned" ? (
                              <button
                                type="button"
                                onClick={() => handleReturn(lending)}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: "6px",
                                  background: "#dcfce7",
                                  color: "#16a34a",
                                  border: "none",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Mark Returned
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
