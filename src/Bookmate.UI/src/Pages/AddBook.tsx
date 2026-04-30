import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { booksApi, googleBooksApi } from "../services/api";

type CameraOption = {
  id: string;
  label: string;
};

type Html5QrcodeInstance = {
  start: (cameraId: string, config: object, onSuccess: (decodedText: string) => void, onError: () => void) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => Promise<void>;
  isScanning?: boolean;
};

declare global {
  interface Window {
    Html5Qrcode?: {
      new (elementId: string): Html5QrcodeInstance;
      getCameras: () => Promise<Array<{ id: string; label: string }>>;
    };
  }
}

function normalizePublishedDate(value?: string | null) {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return "";
}

function getPreferredCamera(cameras: CameraOption[]) {
  return (
    cameras.find((camera) => /back|rear|environment/i.test(camera.label)) ||
    cameras[0] ||
    null
  );
}

export default function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    author: "",
    language: "English",
    published_date: "",
    purchased_date: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanFeedback, setScanFeedback] = useState("");
  const [scannerLoading, setScannerLoading] = useState(false);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [activeCameraId, setActiveCameraId] = useState("");
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<Html5QrcodeInstance | null>(null);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const author = form.author.trim();
    const language = form.language.trim();
    if (!title || !author || !language) {
      setError("Title, author, and language are required.");
      return;
    }

    setSaving(true);
    try {
      await booksApi.create({
        title,
        author,
        language,
        published_date: form.published_date || null,
        purchased_date: form.purchased_date || null,
        image_url: form.image_url.trim() || null,
      });
      navigate("/");
    } catch (err) {
      setError((err as Error).message || "Unable to create the book.");
    } finally {
      setSaving(false);
    }
  }

  async function onIsbnScanned(isbn: string) {
    setScanFeedback(`ISBN detected: ${isbn}. Looking up book details...`);
    await stopScanner();
    try {
      const book = await googleBooksApi.getByIsbn(isbn);
      setForm({
        title: book.title,
        author: book.authors[0] || "",
        language: "English",
        published_date: normalizePublishedDate(book.published_date),
        purchased_date: "",
        image_url: book.thumbnail || "",
      });
      setScanFeedback(`Book found: "${book.title}". Review the details and save.`);
    } catch {
      setScanFeedback("No book was found for this ISBN. Enter details manually.");
    }
  }

  async function loadScannerScript() {
    if (window.Html5Qrcode) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.getElementById("html5-qrcode-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load scanner.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "html5-qrcode-script";
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load scanner."));
      document.body.appendChild(script);
    });
  }

  async function stopScanner() {
    const scanner = scannerInstanceRef.current;
    if (!scanner) {
      setScannerActive(false);
      return;
    }

    try {
      await scanner.stop();
    } catch {
      // ignore stop errors when scanner is already inactive
    }

    try {
      await scanner.clear();
    } catch {
      // ignore clear errors
    }

    scannerInstanceRef.current = null;
    setScannerActive(false);
    setScannerLoading(false);
  }

  async function startScanner(cameraId: string) {
    await loadScannerScript();
    if (!window.Html5Qrcode || !scannerContainerRef.current) {
      throw new Error("Scanner is unavailable on this device.");
    }

    if (scannerInstanceRef.current) {
      await stopScanner();
    }

    const scanner = new window.Html5Qrcode("barcode-reader");
    scannerInstanceRef.current = scanner;
    await scanner.start(
      cameraId,
      { fps: 10, qrbox: { width: 240, height: 140 }, aspectRatio: 1.6 },
      (decodedText) => {
        void onIsbnScanned(decodedText);
      },
      () => {
        // keep scanning quietly
      }
    );
    setActiveCameraId(cameraId);
    setScannerActive(true);
    setScannerLoading(false);
  }

  async function openScanner() {
    setScanFeedback("");
    setError("");
    setScannerLoading(true);

    try {
      await loadScannerScript();
      if (!window.Html5Qrcode) {
        throw new Error("Scanner is unavailable on this device.");
      }

      const foundCameras = (await window.Html5Qrcode.getCameras()).map((camera) => ({
        id: camera.id,
        label: camera.label || `Camera ${camera.id}`,
      }));
      if (foundCameras.length === 0) {
        throw new Error("No camera was found on this device.");
      }

      setCameras(foundCameras);
      const preferred = getPreferredCamera(foundCameras);
      if (!preferred) {
        throw new Error("No usable camera was found.");
      }

      await startScanner(preferred.id);
    } catch (err) {
      setScannerLoading(false);
      setScanFeedback((err as Error).message || "Unable to start the scanner.");
    }
  }

  async function flipCamera() {
    if (cameras.length < 2) {
      return;
    }

    const currentIndex = cameras.findIndex((camera) => camera.id === activeCameraId);
    const nextCamera = cameras[(currentIndex + 1) % cameras.length];
    setScannerLoading(true);
    setScanFeedback("Switching camera...");
    try {
      await startScanner(nextCamera.id);
      setScanFeedback(`Using ${nextCamera.label}.`);
    } catch (err) {
      setScannerLoading(false);
      setScanFeedback((err as Error).message || "Unable to switch camera.");
    }
  }

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <section className="page-shell form-page">
      <div className="section-heading">
        <p className="page-eyebrow">Books</p>
        <h1>Add a New Book</h1>
        <p>Add books faster with barcode scanning, camera switching, and a mobile-friendly form.</p>
      </div>

      <section className="scanner-panel">
        <div className="scanner-header">
          <div>
            <h2>ISBN Scanner</h2>
            <p>Use the back or front camera on your phone and switch between them any time.</p>
          </div>
          <div className="scanner-toolbar">
            {!scannerActive ? (
              <button type="button" className="primary-button" onClick={() => void openScanner()} disabled={scannerLoading}>
                {scannerLoading ? "Opening scanner..." : "Open scanner"}
              </button>
            ) : (
              <>
                <button type="button" className="secondary-button" onClick={() => void flipCamera()} disabled={scannerLoading || cameras.length < 2}>
                  Flip camera
                </button>
                <button type="button" className="secondary-button" onClick={() => void stopScanner()} disabled={scannerLoading}>
                  Close scanner
                </button>
              </>
            )}
          </div>
        </div>

        {cameras.length > 1 ? (
          <label>
            Camera
            <select
              value={activeCameraId}
              onChange={(event) => void startScanner(event.target.value)}
              disabled={!scannerActive || scannerLoading}
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="scanner-reader-frame">
          <div id="barcode-reader" ref={scannerContainerRef} className="scanner-reader" />
        </div>

        {scanFeedback ? (
          <p className={`scanner-feedback ${scanFeedback.toLowerCase().includes("unable") || scanFeedback.toLowerCase().includes("no book") ? "scanner-feedback-error" : "scanner-feedback-info"}`}>
            {scanFeedback}
          </p>
        ) : null}
      </section>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Title *
            <input value={form.title} onChange={(event) => setField("title", event.target.value)} required />
          </label>
          <label>
            Author *
            <input value={form.author} onChange={(event) => setField("author", event.target.value)} required />
          </label>
          <label>
            Language *
            <input value={form.language} onChange={(event) => setField("language", event.target.value)} required />
          </label>
          <label>
            Published Date
            <input type="date" value={form.published_date} onChange={(event) => setField("published_date", event.target.value)} />
          </label>
          <label>
            Purchased Date
            <input type="date" value={form.purchased_date} onChange={(event) => setField("purchased_date", event.target.value)} />
          </label>
          <label className="full-width">
            Cover Image URL
            <input
              value={form.image_url}
              onChange={(event) => setField("image_url", event.target.value)}
              placeholder="https://..."
            />
          </label>
          {form.image_url ? (
            <div className="full-width scanner-preview">
              <img src={form.image_url} alt="Book cover preview" />
              <p>Cover preview</p>
            </div>
          ) : null}
        </div>

        {error ? <p className="form-error">{error}</p> : null}

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
