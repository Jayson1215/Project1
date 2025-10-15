import React, { useState, useEffect, useMemo } from "react";

const API = "http://127.0.0.1:8000/api/profiles";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [message, setMessage]     = useState("");
  const [profiles, setProfiles]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery]         = useState("");

  // Page title
  useEffect(() => {
    document.title = "Profile Manager";
  }, []);

  // Fetch profiles
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Filter search
  const filtered = useMemo(() => {
    if (!query.trim()) return profiles;
    const q = query.toLowerCase();
    return profiles.filter(
      (p) =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q)
    );
  }, [profiles, query]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setMessage("❌ First and Last name are required");
      return;
    }

    const url = editingId ? `${API}/${editingId}` : API;
    const method = editingId ? "PUT" : "POST";

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ " + (data?.message || "Request failed"));
      } else {
        setMessage(editingId ? "✏️ Profile updated!" : "✅ Profile saved!");
        setFirstName("");
        setLastName("");
        setEditingId(null);
        await fetchProfiles();
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (profile) => {
    setEditingId(profile.id);
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this profile?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (res.ok) {
        setMessage("🗑️ Profile deleted!");
        await fetchProfiles();
      } else {
        setMessage("❌ Failed to delete");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
  };

  return (
    <div className="pm-wrap">
      <div className="pm-card">
        <header className="pm-header">
          <h1>Profile Manager</h1>
          <p className="pm-sub">Manage profiles with first and last name only.</p>
        </header>

        {/* Banner */}
        {message && (
          <div
            className={`pm-banner ${
              message.includes("✅") || message.includes("✏️") || message.includes("deleted")
                ? "pm-banner--ok"
                : "pm-banner--err"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form className="pm-form" onSubmit={handleSubmit}>
          <div className="pm-row">
            <label className="pm-label">First Name</label>
            <input
              className="pm-input"
              type="text"
              placeholder="e.g. Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="pm-row">
            <label className="pm-label">Last Name</label>
            <input
              className="pm-input"
              type="text"
              placeholder="e.g. Dela Cruz"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="pm-actions">
            <button className="pm-btn pm-btn--primary" type="submit" disabled={loading}>
              {editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button className="pm-btn pm-btn--ghost" type="button" onClick={handleCancelEdit} disabled={loading}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Search */}
        <div className="pm-toolbar">
          <input
            className="pm-input pm-input--search"
            type="text"
            placeholder="Search profiles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="pm-count">{profiles.length} total</span>
        </div>

        {/* List */}
        <div className="pm-list">
          {loading && <div className="pm-empty">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="pm-empty">
              {profiles.length === 0 ? "No profiles yet. Add one above!" : "No matches found."}
            </div>
          )}

          {!loading &&
            filtered.map((p) => (
              <div key={p.id} className="pm-item">
                <input
                  className="pm-input pm-input--readonly"
                  type="text"
                  value={`${p.first_name} ${p.last_name}`}
                  readOnly
                />
                <div className="pm-item-actions">
                  <button className="pm-btn pm-btn--tiny" onClick={() => handleEdit(p)}>
                    ✏️ Edit
                  </button>
                  <button className="pm-btn pm-btn--tiny pm-btn--danger" onClick={() => handleDelete(p.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
