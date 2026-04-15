import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { booksApi, discoverApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../css/AddBook.css";

type BarcodeDetectorResult = {
  rawValue?: string;
};

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]>;
    };
  }
}

export default function AddBook() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "",
    author: "",
    language: "",
    published_date: "",
    purchased_date: "",
    image_url: "",
    description: "",
    isbn: "",
  });
  const [barcode, setBarcode] = useState("");
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastLookupRef = useRef("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

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
        description: form.description || null,
        isbn: form.isbn || null,
        source: form.isbn ? "google_books" : "manual",
      }, token);
      navigate("/");
    } catch (err) {
      setError((err as Error).message || "Unable to create the book.");
    } finally {
      setSaving(false);
    }
  }

  function applyLookupResult(result: Awaited<ReturnType<typeof discoverApi.lookupIsbn>>) {
    const normalizedDate = normalizePublishedDate(result.published_date);
    setForm((prev) => ({
      ...prev,
      title: result.title || prev.title,
      author: result.authors.join(", ") || prev.author,
      language: result.language || prev.language || "en",
      published_date: normalizedDate || prev.published_date,
      image_url: result.thumbnail || prev.image_url,
      description: result.description || prev.description,
      isbn: result.isbn || prev.isbn,
    }));
    setMessage(`Autofilled details for "${result.title}". You can still edit everything before saving.`);
  }

  function normalizePublishedDate(value?: string | null) {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
    if (/^\d{4}$/.test(value)) return `${value}-01-01`;
    return "";
  }

  async function lookupBarcode(value = barcode) {
    const normalized = value.trim();
    if (!normalized) {
      setError("Enter or scan a barcode first.");
      return;
    }

    setLookingUp(true);
    setError("");
    setMessage("");
    try {
      const result = await discoverApi.lookupIsbn(normalized);
      lastLookupRef.current = normalized;
      setBarcode(normalized);
      applyLookupResult(result);
    } catch (err) {
      setError((err as Error).message || "Unable to look up this barcode.");
    } finally {
      setLookingUp(false);
    }
  }

  useEffect(() => {
    const normalized = barcode.trim();
    if (!/^(\d{10}|\d{13}|\d{9}[\dXx])$/.test(normalized)) return;
    if (lastLookupRef.current === normalized) return;

    const timer = window.setTimeout(() => {
      void lookupBarcode(normalized);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [barcode]);

  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported in this browser.");
        setScannerOpen(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current!.srcObject = stream;
        await videoRef.current!.play();

        const Detector = window.BarcodeDetector;
        if (!Detector) {
          setMessage("Camera preview is ready, but automatic barcode detection is unavailable in this browser. Enter the ISBN manually if needed.");
          return;
        }

        const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
        const scan = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const firstCode = codes[0]?.rawValue?.trim();
            if (firstCode) {
              setScannerOpen(false);
              await lookupBarcode(firstCode);
              return;
            }
          } catch {
            // Ignore transient detection errors while the stream warms up.
          }
          timeoutId = window.setTimeout(() => void scan(), 700);
        };

        void scan();
      } catch (err) {
        setError((err as Error).message || "Unable to access the camera.");
        setScannerOpen(false);
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [scannerOpen]);

  return (
    <section className="page-shell form-page">
      <div className="section-heading">
        <p className="page-eyebrow">Books</p>
        <h1>Add a new book</h1>
        <p>Scan an ISBN, autofill from Google Books, and make any final edits before saving to your owned shelf.</p>
      </div>

      <div className="inline-tip">
        <strong>Best results for first-time users</strong>
        <p>
          Start with title, author, language, and an optional cover image. Once the book is saved,
          you can add it to your library and begin tracking activity.
        </p>
        <Link to="/guide" className="secondary-button">
          View guide
        </Link>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="inline-tip">
          <strong>Barcode autofill</strong>
          <p>
            Scan a barcode with your camera or paste an ISBN to fetch title, author, image, and description from Google Books.
          </p>
          <div className="hero-actions">
            <input
              value={barcode}
              onChange={(event) => {
                const value = event.target.value.replace(/[^\dXx]/g, "");
                setBarcode(value);
                setForm((prev) => ({ ...prev, isbn: value }));
              }}
              placeholder="9780143127741"
            />
            <button type="button" className="secondary-button" onClick={() => void lookupBarcode()} disabled={lookingUp}>
              {lookingUp ? "Looking up..." : "Lookup ISBN"}
            </button>
            <button type="button" className="secondary-button" onClick={() => setScannerOpen((prev) => !prev)}>
              {scannerOpen ? "Close Camera" : "Scan Barcode"}
            </button>
          </div>
          {scannerOpen ? (
            <div className="barcode-preview">
              <video ref={videoRef} muted playsInline className="barcode-video" />
            </div>
          ) : null}
        </div>

        <div className="form-grid">
          <label>
            Title
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
          </label>
          <label>
            Author
            <input value={form.author} onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))} required />
          </label>
          <label>
            Language
            <input value={form.language} onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))} required />
          </label>
          <label>
            ISBN
            <input
              value={form.isbn}
              onChange={(event) => {
                const value = event.target.value.replace(/[^\dXx]/g, "");
                setForm((prev) => ({ ...prev, isbn: value }));
                setBarcode(value);
              }}
            />
          </label>
          <label>
            Published date
            <input type="date" value={form.published_date} onChange={(event) => setForm((prev) => ({ ...prev, published_date: event.target.value }))} />
          </label>
          <label>
            Purchased date
            <input type="date" value={form.purchased_date} onChange={(event) => setForm((prev) => ({ ...prev, purchased_date: event.target.value }))} />
          </label>
          <label className="full-width">
            Cover image URL
            <input value={form.image_url} onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))} placeholder="https://..." />
          </label>
          <label className="full-width">
            Description
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Short summary or notes about this book"
            />
          </label>
        </div>

        {message && <p className="page-status">{message}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Create book"}
          </button>
        </div>
      </form>
    </section>
  );
}
