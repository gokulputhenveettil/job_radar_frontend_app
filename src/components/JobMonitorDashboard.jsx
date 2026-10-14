// frontend/src/components/JobMonitorDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";

const API_BASE = "http://localhost:3000/api/v1";

const TABS = [
  { id: "all", label: "All Postings" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "unapplied", label: "Unapplied" },
];

export default function JobMonitorDashboard() {
  const [jobs, setJobs] = useState([]);
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/jobs`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (jobId, action) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const updatedJob = await res.json();

      setJobs((prevJobs) =>
        prevJobs.map((j) => (j.id === updatedJob.id ? updatedJob : j))
      );
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
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
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
        fetchJobs();
        setPolling(false);
      }, 3500);
    } catch (err) {
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
      if (activeTab === "saved") matchesTab = Boolean(job.saved);
      else if (activeTab === "applied") matchesTab = Boolean(job.applied);
      else if (activeTab === "unapplied") matchesTab = !job.applied;

      // Location check
      const jobLoc = (job.location || "").toLowerCase();
      const searchLoc = locationSearch.trim().toLowerCase();
      const matchesLocation = !searchLoc || jobLoc.includes(searchLoc);

      return matchesTab && matchesLocation;
    });
  }, [jobs, activeTab, locationSearch]);

  const tabCounts = useMemo(() => ({
    all: jobs.length,
    saved: jobs.filter((j) => j.saved).length,
    applied: jobs.filter((j) => j.applied).length,
    unapplied: jobs.filter((j) => !j.applied).length,
  }), [jobs]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans text-gray-900">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">LinkedIn Job Radar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor recent postings, filter by location, and preserve important records.
        </p>
      </header>

      {/* Scrape Controls */}
      <form onSubmit={handlePoll} className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Keywords</label>
          <input
            type="text"
            value={filters.keywords}
            onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Scrape Target Location</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Alert Email</label>
          <input
            type="email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={polling}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
        >
          {polling ? "Scanning..." : "Check Now"}
        </button>
      </form>

      {statusMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
          {statusMessage}
        </div>
      )}

      {/* Secondary Bar: Tabs + Location Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 gap-4 pb-3">
        <nav className="flex space-x-2 -mb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 font-medium text-sm border-b-2 flex items-center space-x-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-blue-100 text-blue-700 font-bold" : "bg-gray-100 text-gray-600"}`}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Location Filter Input */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              list="location-options"
              placeholder="Filter by location (e.g. Remote)..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md w-56 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="location-options">
              {uniqueLocations.map((loc, idx) => (
                <option key={idx} value={loc} />
              ))}
            </datalist>
            {locationSearch && (
              <button
                onClick={() => setLocationSearch("")}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setLocationSearch("Remote")}
            className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
              locationSearch.toLowerCase() === "remote"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Remote
          </button>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading postings...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500 border border-dashed rounded-lg">
          No postings found matching your active tab and location criteria.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="p-3">Role</th>
                <th className="p-3">Company</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Manage</th>
                <th className="p-3 text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-900">{job.title}</td>
                  <td className="p-3 text-gray-600">{job.company}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded text-gray-700">
                      {job.location || "Not specified"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                      job.notified ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-600"
                    }`}>
                      {job.notified ? "Alerted" : "Unnotified"}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(job.id, "toggle_saved")}
                      className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${
                        job.saved ? "bg-amber-500 text-white border-amber-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {job.saved ? "Saved ★" : "Save ☆"}
                    </button>
                    <button
                      onClick={() => handleToggle(job.id, "toggle_applied")}
                      className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${
                        job.applied ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {job.applied ? "Applied ✓" : "Mark Applied"}
                    </button>
                    <button
                      onClick={() => handleDismiss(job.id)}
                      className="px-2 py-1 text-xs rounded font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      ✕ Remove
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                      View &rarr;
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}