import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  adminApi,
  booksApi,
  communityGroupsApi,
  corporateClubsApi,
  institutionsApi,
  marketplaceApi,
  type AdminLibrarySummary,
  type AdminOverview,
  type AdminUserSummary,
  type Book,
  type CommunityGroup,
  type CorporateClub,
  type Institution,
  type MarketplaceItem,
  type UserInteraction,
  type UserPreference,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

type AdminSection =
  | "overview"
  | "users"
  | "books"
  | "library"
  | "preferences"
  | "interactions"
  | "marketplace"
  | "institutions"
  | "clubs"
  | "communities";

const sections: { id: AdminSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "books", label: "Books" },
  { id: "library", label: "Library" },
  { id: "preferences", label: "Preferences" },
  { id: "interactions", label: "Interactions" },
  { id: "marketplace", label: "Marketplace" },
  { id: "institutions", label: "Institutions" },
  { id: "clubs", label: "Clubs" },
  { id: "communities", label: "Communities" },
];

export default function Admin() {
  const { token, user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [libraryItems, setLibraryItems] = useState<AdminLibrarySummary[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [clubs, setClubs] = useState<CorporateClub[]>([]);
  const [communities, setCommunities] = useState<CommunityGroup[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadAdminData() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [
        overviewData,
        userData,
        bookData,
        libraryData,
        preferenceData,
        interactionData,
        marketplaceData,
        institutionData,
        clubData,
        communityData,
      ] = await Promise.all([
        adminApi.overview(token),
        adminApi.listUsers(token),
        adminApi.listBooks(token),
        adminApi.listLibraries(token),
        adminApi.listPreferences(token),
        adminApi.listInteractions(token),
        adminApi.listMarketplaces(token),
        adminApi.listInstitutions(token),
        adminApi.listCorporateClubs(token),
        adminApi.listCommunityGroups(token),
      ]);

      setOverview(overviewData);
      setUsers(userData);
      setBooks(bookData);
      setLibraryItems(libraryData);
      setPreferences(preferenceData);
      setInteractions(interactionData);
      setMarketplaceItems(marketplaceData);
      setInstitutions(institutionData);
      setClubs(clubData);
      setCommunities(communityData);
    } catch (err) {
      setError((err as Error).message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, [token]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((entry) => entry.email.toLowerCase().includes(query));
  }, [userSearch, users]);

  async function handleRoleChange(userId: string, role: string) {
    if (!token) return;
    setBusyId(`user-role-${userId}`);
    setError("");
    try {
      await adminApi.updateUserRole(token, userId, role);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to update user role.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!token) return;
    setBusyId(`user-delete-${userId}`);
    setError("");
    try {
      await adminApi.deleteUser(token, userId);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to delete user.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteLibraryItem(libraryId: string) {
    if (!token) return;
    setBusyId(`library-delete-${libraryId}`);
    setError("");
    try {
      await adminApi.deleteLibraryItem(token, libraryId);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to delete library item.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteBook(bookId: string) {
    setBusyId(`book-delete-${bookId}`);
    setError("");
    try {
      await booksApi.remove(bookId);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to delete book.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteInstitution(institutionId: string) {
    setBusyId(`institution-delete-${institutionId}`);
    setError("");
    try {
      await institutionsApi.remove(institutionId);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to delete institution.");
    } finally {
      setBusyId("");
    }
  }

  async function toggleInstitutionVerification(institution: Institution) {
    setBusyId(`institution-verify-${institution.id}`);
    setError("");
    try {
      await institutionsApi.update(institution.id, { is_verified: !institution.is_verified });
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to update institution.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteClub(clubId: string) {
    setBusyId(`club-delete-${clubId}`);
    setError("");
    try {
      await corporateClubsApi.remove(clubId);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to delete club.");
    } finally {
      setBusyId("");
    }
  }

  async function toggleClubStatus(club: CorporateClub) {
    setBusyId(`club-status-${club.id}`);
    setError("");
    try {
      await corporateClubsApi.update(club.id, { is_active: !club.is_active });
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to update club.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteCommunity(groupId: string) {
    setBusyId(`community-delete-${groupId}`);
    setError("");
    try {
      await communityGroupsApi.remove(groupId);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to delete community group.");
    } finally {
      setBusyId("");
    }
  }

  async function toggleCommunityVisibility(group: CommunityGroup) {
    setBusyId(`community-visibility-${group.id}`);
    setError("");
    try {
      await communityGroupsApi.update(group.id, { is_public: !group.is_public });
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to update community group.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteMarketplace(marketplaceId: string) {
    setBusyId(`marketplace-delete-${marketplaceId}`);
    setError("");
    try {
      await marketplaceApi.remove(marketplaceId);
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to delete marketplace listing.");
    } finally {
      setBusyId("");
    }
  }

  async function toggleMarketplaceAvailability(item: MarketplaceItem) {
    setBusyId(`marketplace-status-${item.id}`);
    setError("");
    try {
      await marketplaceApi.update(item.id, { is_available: !item.is_available });
      await loadAdminData();
    } catch (err) {
      setError((err as Error).message || "Unable to update listing.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="page-shell">
      <div className="hero-banner">
        <div className="hero-left">
          <p className="page-eyebrow">Admin</p>
          <h1>Complete admin management panel</h1>
          <p>
            Manage users, content, library activity, marketplace listings, and community entities
            from one workspace. The first registered user is promoted to admin automatically.
          </p>
        </div>
        <div className="hero-right">
          <div className="guide-highlight">
            <strong>Signed in as</strong>
            <p>{user?.email ?? "Unknown admin"}</p>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              className={activeSection === section.id ? "tab-button active" : "tab-button"}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {loading ? (
        <p className="page-status">Loading admin workspace...</p>
      ) : (
        <>
          {activeSection === "overview" && overview ? (
            <div className="stats-grid admin-stats-grid">
              {[
                ["Users", overview.users],
                ["Admins", overview.admins],
                ["Books", overview.books],
                ["Library items", overview.library_items],
                ["Preferences", overview.preferences],
                ["Interactions", overview.interactions],
                ["Marketplace", overview.marketplace_items],
                ["Active listings", overview.active_marketplace_items],
                ["Institutions", overview.institutions],
                ["Clubs", overview.corporate_clubs],
                ["Communities", overview.community_groups],
              ].map(([label, value]) => (
                <article key={label} className="stack-card stat-card">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          ) : null}

          {activeSection === "users" ? (
            <div className="list-panel">
              <div className="admin-panel-head">
                <h2>User management</h2>
                <input
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search by email"
                />
              </div>
              <div className="admin-table">
                <div className="admin-table-row admin-table-header">
                  <span>Email</span>
                  <span>Role</span>
                  <span>Usage</span>
                  <span>Joined</span>
                  <span>Actions</span>
                </div>
                {filteredUsers.map((entry) => (
                  <div key={entry.id} className="admin-table-row">
                    <span>{entry.email}</span>
                    <span>
                      <select
                        value={entry.role}
                        onChange={(event) => handleRoleChange(entry.id, event.target.value)}
                        disabled={busyId === `user-role-${entry.id}`}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </span>
                    <span>
                      {entry.library_count} library / {entry.preference_count} preferences /{" "}
                      {entry.interaction_count} interactions
                    </span>
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    <span>
                      <button
                        className="icon-button danger"
                        onClick={() => handleDeleteUser(entry.id)}
                        disabled={busyId === `user-delete-${entry.id}` || user?.id === entry.id}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeSection === "books" ? (
            <AdminCollectionPanel
              title="Book moderation"
              rows={books.map((book) => ({
                id: book.id,
                title: book.title,
                meta: `${book.author} · ${book.language}`,
                extra: book.published_date || "No publish date",
                actions: (
                  <button
                    className="icon-button danger"
                    onClick={() => handleDeleteBook(book.id)}
                    disabled={busyId === `book-delete-${book.id}`}
                  >
                    Delete
                  </button>
                ),
              }))}
            />
          ) : null}

          {activeSection === "library" ? (
            <AdminCollectionPanel
              title="Library management"
              rows={libraryItems.map((item) => ({
                id: item.id,
                title: item.book_title || item.book_id,
                meta: `${item.user_email || item.user_id} · ${item.status}`,
                extra: `Added ${new Date(item.added_at).toLocaleDateString()}`,
                actions: (
                  <button
                    className="icon-button danger"
                    onClick={() => handleDeleteLibraryItem(item.id)}
                    disabled={busyId === `library-delete-${item.id}`}
                  >
                    Remove
                  </button>
                ),
              }))}
            />
          ) : null}

          {activeSection === "preferences" ? (
            <AdminCollectionPanel
              title="Preference signals"
              rows={preferences.map((preference) => ({
                id: preference.id,
                title: `${preference.genre} / ${preference.author}`,
                meta: preference.user_id || "Unknown user",
                extra: preference.book_id || "Manual preference",
              }))}
            />
          ) : null}

          {activeSection === "interactions" ? (
            <AdminCollectionPanel
              title="Interaction history"
              rows={interactions.map((interaction) => ({
                id: interaction.id,
                title: `${interaction.interaction_type} · ${interaction.book_id}`,
                meta: interaction.user_id || "Unknown user",
                extra: interaction.rating ? `Rating ${interaction.rating}/5` : "No rating",
              }))}
            />
          ) : null}

          {activeSection === "marketplace" ? (
            <AdminCollectionPanel
              title="Marketplace moderation"
              rows={marketplaceItems.map((item) => ({
                id: item.id,
                title: item.book_id,
                meta: `$${item.price.toFixed(2)} · ${item.condition}`,
                extra: item.is_available ? "Available" : "Unavailable",
                actions: (
                  <>
                    <button
                      className="icon-button"
                      onClick={() => toggleMarketplaceAvailability(item)}
                      disabled={busyId === `marketplace-status-${item.id}`}
                    >
                      {item.is_available ? "Mark unavailable" : "Mark available"}
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => handleDeleteMarketplace(item.id)}
                      disabled={busyId === `marketplace-delete-${item.id}`}
                    >
                      Delete
                    </button>
                  </>
                ),
              }))}
            />
          ) : null}

          {activeSection === "institutions" ? (
            <AdminCollectionPanel
              title="Institution management"
              rows={institutions.map((institution) => ({
                id: institution.id,
                title: institution.name,
                meta: `${institution.type} · ${institution.contact_email || "No contact"}`,
                extra: institution.is_verified ? "Verified" : "Pending verification",
                actions: (
                  <>
                    <button
                      className="icon-button"
                      onClick={() => toggleInstitutionVerification(institution)}
                      disabled={busyId === `institution-verify-${institution.id}`}
                    >
                      {institution.is_verified ? "Unverify" : "Verify"}
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => handleDeleteInstitution(institution.id)}
                      disabled={busyId === `institution-delete-${institution.id}`}
                    >
                      Delete
                    </button>
                  </>
                ),
              }))}
            />
          ) : null}

          {activeSection === "clubs" ? (
            <AdminCollectionPanel
              title="Corporate clubs"
              rows={clubs.map((club) => ({
                id: club.id,
                title: club.name,
                meta: `${club.organization_name} · ${club.admin_user_id}`,
                extra: club.is_active ? "Active" : "Inactive",
                actions: (
                  <>
                    <button
                      className="icon-button"
                      onClick={() => toggleClubStatus(club)}
                      disabled={busyId === `club-status-${club.id}`}
                    >
                      {club.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => handleDeleteClub(club.id)}
                      disabled={busyId === `club-delete-${club.id}`}
                    >
                      Delete
                    </button>
                  </>
                ),
              }))}
            />
          ) : null}

          {activeSection === "communities" ? (
            <AdminCollectionPanel
              title="Community groups"
              rows={communities.map((group) => ({
                id: group.id,
                title: group.name,
                meta: `${group.topic} · ${group.creator_user_id}`,
                extra: group.is_public ? "Public" : "Private",
                actions: (
                  <>
                    <button
                      className="icon-button"
                      onClick={() => toggleCommunityVisibility(group)}
                      disabled={busyId === `community-visibility-${group.id}`}
                    >
                      {group.is_public ? "Make private" : "Make public"}
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => handleDeleteCommunity(group.id)}
                      disabled={busyId === `community-delete-${group.id}`}
                    >
                      Delete
                    </button>
                  </>
                ),
              }))}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

function AdminCollectionPanel({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    meta: string;
    extra: string;
    actions?: ReactNode;
  }>;
}) {
  return (
    <div className="list-panel">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <div className="empty-panel">
          <h3>No records found</h3>
          <p>This section is empty right now.</p>
        </div>
      ) : (
        <div className="stack-list">
          {rows.map((row) => (
            <article key={row.id} className="stack-card admin-record">
              <div>
                <strong>{row.title}</strong>
                <p>{row.meta}</p>
                <small>{row.extra}</small>
              </div>
              {row.actions ? <div className="book-actions">{row.actions}</div> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
