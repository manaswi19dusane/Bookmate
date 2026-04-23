import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { booksApi, googleBooksApi } from "../services/api";

export default function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", author: "", language: "English",
    published_date: "", purchased_date: "", image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanFeedback, setScanFeedback] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<unknown>(null);

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.author.trim() || !form.language.trim()) {
      setError("Title, author, and language are required.");
      return;
    }
    setSaving(true);
    try {
      await booksApi.create({
        ...form,
        published_date: form.published_date || null,
        purchased_date: form.purchased_date || null,
        image_url: form.image_url || null,
      });
      navigate("/");
    } catch (err) {
      setError((err as Error).message || "Unable to create the book.");
    } finally {
      setSaving(false);
    }
  }

  async function onIsbnScanned(isbn: string) {
    setScanFeedback(`ISBN detected: ${isbn} — Looking up...`);
    stopScanner();
    try {
      const book = await googleBooksApi.getByIsbn(isbn);
      setForm({
        title: book.title,
        author: book.authors[0] || "",
        language: "English",
        published_date: book.published_date?.slice(0, 10) || "",
        purchased_date: "",
        image_url: book.thumbnail || "",
      });
      setScanFeedback(`✅ Book found: "${book.title}" — Edit details below and save.`);
    } catch {
      setScanFeedback("❌ No book found for this ISBN. Enter details manually.");
    }
  }

  function stopScanner() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inst = scannerInstanceRef.current as any;
    if (inst) {
      try { inst.clear(); } catch { /* ignore */ }
      scannerInstanceRef.current = null;
    }
    setScannerActive(false);
  }

  useEffect(() => {
    if (!scannerActive || !scannerRef.current) return;

    const scriptId = "html5-qrcode-script";
    function startScanner() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Html5QrcodeScanner = (window as any).Html5QrcodeScanner;
      if (!Html5QrcodeScanner) return;
      const scanner = new Html5QrcodeScanner(
        "barcode-reader",
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      );
      scanner.render(
        (decodedText: string) => { void onIsbnScanned(decodedText); },
        () => { /* scan error, ignore */ }
      );
      scannerInstanceRef.current = scanner;
    }

    if (document.getElementById(scriptId)) {
      startScanner();
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.onload = startScanner;
      document.body.appendChild(script);
    }

    return () => { stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerActive]);

  return (
    <section className="page-shell form-page">
      <div className="section-heading">
        <p className="page-eyebrow">Books</p>
        <h1>Add a New Book</h1>
        <p>Scan a barcode or enter details manually.</p>
      </div>

      {/* Barcode Scanner */}
      <div style={{ marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => { setScanFeedback(""); setScannerActive(prev => !prev); }}
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ea5e9",
            color: "#fff", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
          {scannerActive ? "✕ Close Scanner" : "📷 Scan Barcode / ISBN"}
        </button>

        {scannerActive && (
          <div style={{ marginTop: "16px", background: "#fff", borderRadius: "12px",
            padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
              Point your camera at the book's ISBN barcode. Fields will auto-fill.
            </p>
            <div id="barcode-reader" ref={scannerRef} />
          </div>
        )}

        {scanFeedback && (
          <p style={{ marginTop: "10px", fontSize: "14px", fontWeight: 600,
            color: scanFeedback.startsWith("✅") ? "#16a34a" : scanFeedback.startsWith("❌") ? "#dc2626" : "#4f46e5" }}>
            {scanFeedback}
          </p>
        )}
      </div>

      {/* Book Form */}
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Title *
            <input value={form.title} onChange={e => setField("title", e.target.value)} required />
          </label>
          <label>
            Author *
            <input value={form.author} onChange={e => setField("author", e.target.value)} required />
          </label>
          <label>
            Language *
            <input value={form.language} onChange={e => setField("language", e.target.value)} required />
          </label>
          <label>
            Published Date
            <input type="date" value={form.published_date} onChange={e => setField("published_date", e.target.value)} />
          </label>
          <label>
            Purchased Date
            <input type="date" value={form.purchased_date} onChange={e => setField("purchased_date", e.target.value)} />
          </label>
          <label className="full-width">
            Cover Image URL
            <input value={form.image_url} onChange={e => setField("image_url", e.target.value)} placeholder="https://..." />
          </label>
          {form.image_url && (
            <div className="full-width" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <img src={form.image_url} alt="preview"
                style={{ width: "60px", height: "80px", objectFit: "cover", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Cover preview</p>
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Create Book"}
          </button>
        </div>
      </form>
    </section>
  );
}
