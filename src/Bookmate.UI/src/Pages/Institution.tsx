import { useEffect, useMemo, useState } from "react";
import { institutionsApi, type Institution } from "../services/api";

export default function Institution() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    type: "organization",
    address: "",
    website: "",
    contact_email: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadInstitutions() {
    setLoading(true);
    try {
      setInstitutions(await institutionsApi.list());
    } catch (err) {
      setError((err as Error).message || "Unable to load institutions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInstitutions();
  }, []);

  const filtered = useMemo(
    () => institutions.filter((institution) => filter === "all" || institution.type === filter),
    [filter, institutions]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await institutionsApi.create({
        ...form,
        address: form.address || undefined,
        website: form.website || undefined,
        contact_email: form.contact_email || undefined,
      });
      setForm({ name: "", type: "organization", address: "", website: "", contact_email: "" });
      await loadInstitutions();
    } catch (err) {
      setError((err as Error).message || "Unable to create institution.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Communities</p>
        <h1>Institutions</h1>
        <p>Browse and create institutions using the backend endpoints exactly as they exist today.</p>
      </div>

      <div className="toolbar-tabs">
        {["all", "organization", "university", "school", "library"].map((value) => (
          <button key={value} className={filter === value ? "tab-button active" : "tab-button"} onClick={() => setFilter(value)}>
            {value}
          </button>
        ))}
      </div>

      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Name<input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required /></label>
          <label>Type<select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}><option value="organization">organization</option><option value="university">university</option><option value="school">school</option><option value="library">library</option></select></label>
          <label>Address<input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} /></label>
          <label>Website<input value={form.website} onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))} /></label>
          <label>Contact email<input value={form.contact_email} onChange={(event) => setForm((prev) => ({ ...prev, contact_email: event.target.value }))} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create institution"}</button>
        </form>

        <div className="list-panel">
          <h2>Institution directory</h2>
          {loading ? <p className="page-status">Loading institutions...</p> : filtered.length === 0 ? <div className="empty-panel"><h3>No institutions</h3><p>Try another filter or create one.</p></div> : <div className="stack-list">{filtered.map((institution) => <article key={institution.id} className="stack-card"><strong>{institution.name}</strong><span>{institution.type}</span><small>{institution.address || institution.contact_email || "No contact details yet"}</small></article>)}</div>}
        </div>
      </div>
    </section>
  );
}
