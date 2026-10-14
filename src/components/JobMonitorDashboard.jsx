// frontend/src/components/JobMonitorDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeJob, setJobs, updateJob } from "../store";

const API_BASE = "http://localhost:3000/api/v1";

const TABS = [
  { id: "all", label: "All Postings" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "unapplied", label: "Unapplied" },
];

export default function JobMonitorDashboard() {
  const dispatch = useDispatch();
  const jobs = useSelector((state) => state.jobs);
  const user = useSelector((state) => state.app.user);
  const [activeTab, setActiveTab] = useState("all");
  const [locationSearch, setLocationSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [filters, setFilters] = useState({
    keywords: "Ruby on Rails",
    location: "Remote",
    email: "developer@example.com",
  });
  const visibleTabs = user
    ? TABS
    : TABS.filter((tab) => tab.id === "all");
  const selectedTab =
    !user && activeTab !== "all"
      ? "all"
      : activeTab;

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      const data = await res.json();
      dispatch(setJobs(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Failed to load jobs:", err);
      dispatch(setJobs([]));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggle = async (jobId, action) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const updatedJob = await res.json();

      dispatch(updateJob(updatedJob));
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
    }
  };

  const handleDismiss = async (jobId) => {
    if (!window.confirm("Remove this job? It won't appear again.")) return;
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/dismiss`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        dispatch(removeJob(jobId));
      }
    } catch (err) {
      console.error("Failed to dismiss:", err);
    }
  };

  const handlePoll = async (e) => {
    e.preventDefault();
    setPolling(true);
    setStatusMessage("");

    try {
      const res = await fetch(`${API_BASE}/jobs/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      setStatusMessage(data.message);

      setTimeout(() => {
        setLoading(true);
        fetchJobs();
        setPolling(false);
      }, 3500);
    } catch {
      setStatusMessage("Failed to initiate scan.");
      setPolling(false);
    }
  };

  // Distinct locations from available jobs for dropdown suggestion
  const uniqueLocations = useMemo(() => {
    const locs = jobs.map((j) => j.location).filter(Boolean);
    return Array.from(new Set(locs));
  }, [jobs]);

  // Combined tab + location filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Tab check
      let matchesTab = true;
      if (selectedTab === "saved") matchesTab = Boolean(job.saved);
      else if (selectedTab === "applied") matchesTab = Boolean(job.applied);
      else if (selectedTab === "unapplied") matchesTab = !job.applied;

      // Location check
      const jobLoc = (job.location || "").toLowerCase();
      const searchLoc = locationSearch.trim().toLowerCase();
      const matchesLocation = !searchLoc || jobLoc.includes(searchLoc);

      return matchesTab && matchesLocation;
    });
  }, [jobs, selectedTab, locationSearch]);

  const tabCounts = useMemo(() => ({
    all: jobs.length,
    saved: jobs.filter((j) => j.saved).length,
    applied: jobs.filter((j) => j.applied).length,
    unapplied: jobs.filter((j) => !j.applied).length,
  }), [jobs]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>Job dashboard</h1>
          <p>Keep track of promising roles and stay on top of your applications.</p>
        </div>
      </header>

      {user && (
      <section className="dashboard-stats" aria-label="Job posting summary">
        {[
          { label: "Total postings", value: tabCounts.all, dot: "" },
          { label: "Saved for later", value: tabCounts.saved, dot: "stat-dot-saved" },
          { label: "Applications sent", value: tabCounts.applied, dot: "stat-dot-applied" },
          { label: "Not yet applied", value: tabCounts.unapplied, dot: "stat-dot-open" },
        ].map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p className="stat-label">
              <span className={`stat-dot ${stat.dot}`} aria-hidden="true" />
              {stat.label}
            </p>
            <strong className="stat-value">{stat.value}</strong>
          </article>
        ))}
      </section>
      )}

      <form onSubmit={handlePoll} className="scan-panel">
        <div className="section-heading">
          <div>
            <h2>Find new opportunities</h2>
            <p>Choose what to search for and we’ll look for matching roles.</p>
          </div>
        </div>
        <div className="scan-fields">
        <div className="field-group">
          <label htmlFor="job-keywords">Keywords</label>
          <input
            id="job-keywords"
            type="text"
            value={filters.keywords}
            onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
            className="dashboard-input"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="job-location">Location</label>
          <input
            id="job-location"
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="dashboard-input"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="alert-email">Alert email</label>
          <input
            id="alert-email"
            type="email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            className="dashboard-input"
            required
          />
        </div>

        <button
          type="submit"
          disabled={polling}
          className="primary-button"
        >
          {polling ? "Scanning..." : "Check for jobs"}
        </button>
        </div>
      </form>

      {statusMessage && (
        <div className="status-message" role="status">
          {statusMessage}
        </div>
      )}

      <section className="jobs-panel" aria-label="Job postings">
      <div className="jobs-toolbar">
        <nav className="job-tabs" aria-label="Filter postings by status">
          {visibleTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className={`job-tab ${isActive ? "job-tab-active" : ""}`}
              >
                {tab.label}
                <span className="job-tab-count">
                  {tabCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="job-filters">
          <div className="location-control">
            <input
              aria-label="Filter postings by location"
              type="text"
              list="location-options"
              placeholder="Filter by location (e.g. Remote)..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="dashboard-input location-input"
            />
            <datalist id="location-options">
              {uniqueLocations.map((loc, idx) => (
                <option key={idx} value={loc} />
              ))}
            </datalist>
            {locationSearch && (
              <button
                type="button"
                aria-label="Clear location filter"
                onClick={() => setLocationSearch("")}
                className="clear-location"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setLocationSearch("Remote")}
            aria-pressed={locationSearch.toLowerCase() === "remote"}
            className={`filter-chip ${locationSearch.toLowerCase() === "remote" ? "filter-chip-active" : ""}`}
          >
            Remote
          </button>
        </div>
      </div>

      <div className="jobs-panel-heading">
        <h2>Recent postings</h2>
        {!loading && (
          <span className="results-count">
            {filteredJobs.length} {filteredJobs.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="dashboard-placeholder" role="status">Loading postings...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="dashboard-placeholder">
          <strong>No postings found</strong>
          <p>Try another status or location filter, or scan for new opportunities.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="jobs-table">
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Company</th>
                <th scope="col">Location</th>
                <th scope="col">Alert status</th>
                <th scope="col" className="text-center">Manage</th>
                <th scope="col" className="text-right">Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td><span className="job-title" title={job.title}>{job.title}</span></td>
                  <td><span className="job-company">{job.company}</span></td>
                  <td>
                    <span className="location-badge">
                      {job.location || "Not specified"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${job.notified ? "status-notified" : "status-unnotified"}`}>
                      {job.notified ? "Alerted" : "Unnotified"}
                    </span>
                  </td>
                  <td>
                    <div className="job-actions">
                    <button
                      onClick={() => handleToggle(job.id, "toggle_saved")}
                      aria-pressed={Boolean(job.saved)}
                      className={`table-action ${job.saved ? "table-action-saved" : ""}`}
                    >
                      {job.saved ? "Saved ★" : "☆ Save"}
                    </button>
                    <button
                      onClick={() => handleToggle(job.id, "toggle_applied")}
                      aria-pressed={Boolean(job.applied)}
                      className={`table-action ${job.applied ? "table-action-applied" : ""}`}
                    >
                      {job.applied ? "Applied ✓" : "Mark applied"}
                    </button>
                    <button
                      onClick={() => handleDismiss(job.id)}
                      className="table-action table-action-remove"
                      aria-label={`Remove ${job.title}`}
                    >
                      Remove
                    </button>
                    </div>
                  </td>
                  <td className="text-right">
                    <a href={job.url} target="_blank" rel="noreferrer" className="job-link">
                      View role →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </section>
      </div>
    </div>
  );
}