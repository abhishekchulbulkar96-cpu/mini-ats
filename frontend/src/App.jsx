
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "https://mini-ats-ycs6.onrender.com/api/candidates";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  skills: "",
  stage: "APPLIED",
};

const stages = ["APPLIED", "IN REVIEW", "INTERVIEW", "HIRED", "REJECTED"];

function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadCandidates = async () => {
    try {
      setLoading(true);
     const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load candidates.");
      setCandidates(await response.json());
      setError("");
    } catch {
     setError("Cannot connect to the backend. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const normalizedStage = (stage) =>
    (stage || "APPLIED").toUpperCase().replaceAll("_", " ");

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const term = search.toLowerCase().trim();
      const matchesSearch = [
        candidate.fullName,
        candidate.email,
        candidate.position,
        candidate.skills,
      ].some((value) => (value || "").toLowerCase().includes(term));

      const matchesStage =
        stageFilter === "ALL" ||
        normalizedStage(candidate.stage) === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [candidates, search, stageFilter]);

  const countStage = (stage) =>
    candidates.filter(
      (candidate) => normalizedStage(candidate.stage) === stage
    ).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (candidate) => {
    setEditing(candidate);
    setForm({
      fullName: candidate.fullName || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      position: candidate.position || "",
      skills: candidate.skills || "",
      stage: normalizedStage(candidate.stage),
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");


    try {
     const url = editing ? `${API_URL}/${editing.id}` : API_URL;
      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stage: form.stage.replaceAll(" ", "_"),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          response.status === 409 || message.toLowerCase().includes("duplicate")
            ? "This email may already belong to another candidate."
            : message || "Could not save candidate."
        );
      }

      setModalOpen(false);
      setNotice(editing ? "Candidate updated successfully." : "Candidate added successfully.");
      await loadCandidates();
    } catch (err) {
      setError(err.message || "Could not save candidate.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCandidate = async (candidate) => {
    if (!window.confirm(`Delete ${candidate.fullName}? This cannot be undone.`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${candidate.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete candidate.");

      setCandidates((previous) =>
        previous.filter((item) => item.id !== candidate.id)
      );
      setNotice("Candidate deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const initials = (name) =>
    (name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">M</span>
          <span>Mini ATS</span>
        </div>

        <nav className="navigation">
          <button className="nav-item active">
            <span>▦</span> Candidates
          </button>
          <button className="nav-item" onClick={openAdd}>
            <span>＋</span> Add Candidate
          </button>
          <button
            className="nav-item"
            onClick={() =>
              document.getElementById("overview")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            <span>▥</span> Analytics
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="online-dot" />
          <div>
            <strong>Recruitment workspace</strong>
            <small>Local development</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">RECRUITMENT WORKSPACE</div>
            <h1>Candidates</h1>
            <p className="subtitle">Manage and track all job applicants.</p>
          </div>
          <button className="primary-button" onClick={openAdd}>
            <span>＋</span> Add Candidate
          </button>
        </header>

        <section className="stats-grid" id="overview">
          <div className="stat-card stat-blue">
            <div className="stat-icon">♙</div>
            <div><span>Total Candidates</span><strong>{candidates.length}</strong></div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-icon">◉</div>
            <div><span>In Review</span><strong>{countStage("IN REVIEW")}</strong></div>
          </div>
          <div className="stat-card stat-amber">
            <div className="stat-icon">◷</div>
            <div><span>Interview</span><strong>{countStage("INTERVIEW")}</strong></div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon">✓</div>
            <div><span>Hired</span><strong>{countStage("HIRED")}</strong></div>
          </div>
        </section>

        {notice && <div className="notice success-notice">{notice}</div>}
        {error && <div className="notice error-notice">{error}</div>}

        <section className="table-panel">
          <div className="panel-heading">
            <div>
              <h2>All Applicants</h2>
              <p>{filteredCandidates.length} candidates displayed</p>
            </div>
            <span className="live-indicator"><span /> Live data</span>
          </div>

          <div className="filters">
            <label className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or position..."
              />
              {search && (
                <button className="clear-search" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </label>

            <select
              className="stage-select"
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
              aria-label="Filter candidates by stage"
            >
              <option value="ALL">All Stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div className="table-scroll">
            <table className="candidate-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Position</th>
                  <th>Skills</th>
                  <th>Stage</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <div className="candidate-name">
                        <div className="avatar">{initials(candidate.fullName)}</div>
                        <div>
                          <strong>{candidate.fullName}</strong>
                          <small>ID: {candidate.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span>{candidate.email}</span>
                        <small>{candidate.phone || "No phone provided"}</small>
                      </div>
                    </td>
                    <td><span className="position-text">{candidate.position}</span></td>
                    <td>
                      <div className="skill-list">
                        {(candidate.skills || "")
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((skill) => (
                            <span className="skill-tag" key={skill}>{skill}</span>
                          ))}
                        {!candidate.skills && <span className="muted">—</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`stage-badge stage-${normalizedStage(candidate.stage).toLowerCase().replaceAll(" ", "-")}`}>
                        {normalizedStage(candidate.stage)}
                      </span>
                    </td>
                    <td className="date-cell">{candidate.appliedDate || "—"}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="action-button edit-action"
                          onClick={() => openEdit(candidate)}
                          title="Edit candidate"
                          aria-label={`Edit ${candidate.fullName}`}
                        >✎</button>
                        <button
                          className="action-button delete-action"
                          onClick={() => deleteCandidate(candidate)}
                          title="Delete candidate"
                          aria-label={`Delete ${candidate.fullName}`}
                        >⌫</button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">
                        <div className="empty-icon">⌕</div>
                        <strong>No candidates found</strong>
                        <p>Try changing your search or add a new candidate.</p>
                        <button className="primary-button" onClick={openAdd}>
                          ＋ Add Candidate
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr><td colSpan="7" className="loading-cell">Loading candidates...</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="table-footer">
            <span>Showing {filteredCandidates.length} of {candidates.length} candidates</span>
            <span>Mini ATS <span className="footer-dot">•</span> Applicant management</span>
          </footer>
        </section>

        <footer className="page-footer">
          Mini ATS <span>•</span> Built for smarter recruitment
        </footer>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <section
            className="candidate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">CANDIDATE DETAILS</div>
                <h2 id="modal-title">{editing ? "Edit Candidate" : "Add Candidate"}</h2>
                <p>Enter the applicant's information below.</p>
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="candidate-form">
              <label>
                Full Name *
                <input name="fullName" value={form.fullName} onChange={handleChange} required maxLength={100} placeholder="e.g. Rahul Sharma" />
              </label>
              <label>
                Email Address *
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="e.g. rahul@example.com" />
              </label>
              <label>
                Phone Number
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
              </label>
              <label>
                Position Applied For *
                <input name="position" value={form.position} onChange={handleChange} required placeholder="e.g. Java Developer" />
              </label>
              <label>
                Skills
                <input name="skills" value={form.skills} onChange={handleChange} placeholder="Java, Spring Boot, React" />
                <small>Separate skills with commas.</small>
              </label>
              <label>
                Application Stage
                <select name="stage" value={form.stage} onChange={handleChange}>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </label>

              {error && <div className="notice error-notice">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Candidate"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
