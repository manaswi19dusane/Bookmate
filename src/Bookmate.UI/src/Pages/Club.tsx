import { useEffect, useState } from "react";
import { corporateClubsApi, type CorporateClub } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Club() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<CorporateClub[]>([]);
  const [form, setForm] = useState({
    name: "",
    organization_name: "",
    description: "",
    max_members: "25",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadClubs() {
    setLoading(true);
    try {
      setClubs(await corporateClubsApi.list());
    } catch (err) {
      setError((err as Error).message || "Unable to load corporate clubs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClubs();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      await corporateClubsApi.create({
        name: form.name,
        organization_name: form.organization_name,
        admin_user_id: user.id,
        description: form.description || undefined,
        max_members: Number(form.max_members),
        is_active: true,
      });
      setForm({ name: "", organization_name: "", description: "", max_members: "25" });
      await loadClubs();
    } catch (err) {
      setError((err as Error).message || "Unable to create corporate club.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Communities</p>
        <h1>Corporate clubs</h1>
        <p>See active clubs and create a new one with your current authenticated user id.</p>
      </div>

      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Name<input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required /></label>
          <label>Organization<input value={form.organization_name} onChange={(event) => setForm((prev) => ({ ...prev, organization_name: event.target.value }))} required /></label>
          <label>Max members<input type="number" min="1" value={form.max_members} onChange={(event) => setForm((prev) => ({ ...prev, max_members: event.target.value }))} /></label>
          <label>Description<textarea rows={4} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create club"}</button>
        </form>

        <div className="list-panel">
          <h2>Current clubs</h2>
          {loading ? <p className="page-status">Loading clubs...</p> : clubs.length === 0 ? <div className="empty-panel"><h3>No clubs yet</h3><p>Create one to get started.</p></div> : <div className="stack-list">{clubs.map((club) => <article key={club.id} className="stack-card"><strong>{club.name}</strong><span>{club.organization_name}</span><small>{club.description || `${club.max_members || "No"} seats · ${club.is_active ? "Active" : "Inactive"}`}</small></article>)}</div>}
        </div>
      </div>
    </section>
  );
}
