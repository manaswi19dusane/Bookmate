import { useEffect, useState } from "react";
import { communityGroupsApi, type CommunityGroup } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Community() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [form, setForm] = useState({
    name: "",
    topic: "fiction",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadGroups() {
    setLoading(true);
    try {
      setGroups(await communityGroupsApi.list());
    } catch (err) {
      setError((err as Error).message || "Unable to load community groups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGroups();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      await communityGroupsApi.create({
        name: form.name,
        creator_user_id: user.id,
        topic: form.topic,
        description: form.description || undefined,
        is_public: true,
      });
      setForm({ name: "", topic: "fiction", description: "" });
      await loadGroups();
    } catch (err) {
      setError((err as Error).message || "Unable to create community group.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Communities</p>
        <h1>Community groups</h1>
        <p>Explore and create reading groups using the live backend group endpoints.</p>
      </div>

      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Name<input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required /></label>
          <label>Topic<select value={form.topic} onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}><option value="fiction">fiction</option><option value="non-fiction">non-fiction</option><option value="business">business</option><option value="science fiction">science fiction</option></select></label>
          <label>Description<textarea rows={4} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create group"}</button>
        </form>

        <div className="list-panel">
          <h2>Available groups</h2>
          {loading ? <p className="page-status">Loading groups...</p> : groups.length === 0 ? <div className="empty-panel"><h3>No groups yet</h3><p>Create one to start the conversation.</p></div> : <div className="stack-list">{groups.map((group) => <article key={group.id} className="stack-card"><strong>{group.name}</strong><span>{group.topic}</span><small>{group.description || (group.is_public ? "Public group" : "Private group")}</small></article>)}</div>}
        </div>
      </div>
    </section>
  );
}
