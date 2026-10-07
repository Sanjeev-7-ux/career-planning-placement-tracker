import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import Modal from "../../components/Modal";
import api from "../../api";
import downloadApplicationResume from "../../utils/downloadApplicationResume";
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  Calendar,
  Award,
  Search,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Layers,
  Sparkles,
  Download
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [summary, setSummary] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("applications");
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sumRes, appRes, jobRes, compRes] = await Promise.all([
        api.get("/admin/summary").catch(() => ({ data: null })),
        api.get("/applications").catch(() => ({ data: [] })),
        api.get("/opportunities").catch(() => ({ data: [] })),
        api.get("/companies").catch(() => ({ data: [] })),
      ]);

      setSummary(sumRes.data);
      setApplications(Array.isArray(appRes.data) ? appRes.data : []);
      setJobs(Array.isArray(jobRes.data) ? jobRes.data : []);
      setCompanies(Array.isArray(compRes.data) ? compRes.data : []);
    } catch {
      toast.error("Could not load administrative analytics.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job opening permanently?")) return;
    try {
      await api.delete(`/opportunities/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job opening deleted.");
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Delete this company record?")) return;
    try {
      await api.delete(`/companies/${companyId}`);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      toast.success("Company record removed.");
    } catch {
      toast.error("Failed to delete company.");
    }
  };

  const handleResumeDownload = async (application) => {
    try {
      await downloadApplicationResume(application);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not download the submitted resume.");
    }
  };

  return (
    <div className="module-page admin-dashboard-page">
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Institutional Governance</span>
          <h1>Placement Administration & Analytics</h1>
          <p>
            Oversee platform recruitment health, audit applications, and monitor corporate engagement metrics.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-blue">
            <Users size={22} />
          </div>
          <div>
            <span className="kpi-label">Registered Students</span>
            <strong className="kpi-value">{summary?.totalStudents ?? 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-purple">
            <Building2 size={22} />
          </div>
          <div>
            <span className="kpi-label">Hiring Companies</span>
            <strong className="kpi-value">{summary?.totalCompanies ?? 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-cyan">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="kpi-label">Total Jobs Posted</span>
            <strong className="kpi-value">{summary?.totalJobs ?? 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-amber">
            <FileCheck2 size={22} />
          </div>
          <div>
            <span className="kpi-label">Total Applications</span>
            <strong className="kpi-value">{summary?.totalApplications ?? 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-rose">
            <Calendar size={22} />
          </div>
          <div>
            <span className="kpi-label">Interviews Conducted</span>
            <strong className="kpi-value">{summary?.totalInterviews ?? 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-emerald">
            <Award size={22} />
          </div>
          <div>
            <span className="kpi-label">Offers Issued</span>
            <strong className="kpi-value">{summary?.totalOffers ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="auth-mode-tabs mt-4">
        <button
          className={`auth-tab ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          <FileCheck2 size={16} /> All Applications ({applications.length})
        </button>
        <button
          className={`auth-tab ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          <Briefcase size={16} /> All Jobs ({jobs.length})
        </button>
        <button
          className={`auth-tab ${activeTab === "companies" ? "active" : ""}`}
          onClick={() => setActiveTab("companies")}
        >
          <Building2 size={16} /> Partner Companies ({companies.length})
        </button>
      </div>

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div className="dashboard-card mt-3">
          <div className="card-header-row">
            <div>
              <h3>Institutional Application Ledger</h3>
              <small className="card-subtitle">
                Complete log of student applications submitted across all recruiters
              </small>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="empty-subcard">
              <FileCheck2 size={36} className="empty-subicon" />
              <p>No applications logged yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role & Company</th>
                    <th>College & CGPA</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.studentProfile?.name || app.studentEmail}</strong>
                        <small className="d-block text-muted">{app.studentEmail}</small>
                      </td>
                      <td>
                        <strong>{app.role}</strong>
                        <small className="d-block text-muted">{app.companyName}</small>
                      </td>
                      <td>
                        <span>{app.studentProfile?.college || "N/A"}</span>
                        {app.studentProfile?.cgpa && (
                          <span className="badge badge-subtle ml-2">
                            CGPA: {app.studentProfile.cgpa}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${(app.status || "APPLIED").toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => setSelectedCandidate(app)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === "jobs" && (
        <div className="dashboard-card mt-3">
          <div className="card-header-row">
            <div>
              <h3>Campus Job Openings</h3>
              <small className="card-subtitle">All active corporate postings</small>
            </div>
          </div>

          <div className="jobs-cards-grid mt-3">
            {jobs.map((job) => (
              <article key={job.id} className="job-card">
                <div className="job-card-top">
                  <div className="job-company-avatar">
                    {job.company?.name ? job.company.name.charAt(0) : "J"}
                  </div>
                  <div>
                    <span className="job-company-name">{job.company?.name}</span>
                    <h4 className="job-title">{job.title}</h4>
                  </div>
                </div>

                <div className="job-meta-pills">
                  <span className="meta-pill">📍 {job.location}</span>
                  <span className="meta-pill">💼 {job.type || "Full Time"}</span>
                  {job.salaryRange && (
                    <span className="meta-pill meta-salary">💰 {job.salaryRange}</span>
                  )}
                </div>

                <div className="job-card-footer mt-2">
                  <span className="text-muted text-xs">
                    Deadline: {job.applicationDeadline || "Rolling"}
                  </span>
                  <button
                    className="btn btn-outline btn-xs btn-danger-hover"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === "companies" && (
        <div className="dashboard-card mt-3">
          <div className="card-header-row">
            <div>
              <h3>Corporate Partners</h3>
              <small className="card-subtitle">Organizations registered on the platform</small>
            </div>
          </div>

          <div className="companies-cards-grid mt-3">
            {companies.map((c) => (
              <article key={c.id} className="company-card">
                <div className="company-card-header">
                  <div className="company-avatar">
                    {c.name ? c.name.charAt(0) : "C"}
                  </div>
                  <div>
                    <h4 className="company-name">{c.name}</h4>
                    <span className="company-industry-tag">{c.industry || "IT Services"}</span>
                  </div>
                </div>

                <p className="company-description mt-2">{c.description || "Partner employer"}</p>

                <div className="company-card-footer mt-2">
                  <span className="text-muted text-xs">📍 {c.location || "India"}</span>
                  <button
                    className="btn btn-outline btn-xs btn-danger-hover"
                    onClick={() => handleDeleteCompany(c.id)}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Dossier Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          title={`Candidate Details: ${
            selectedCandidate.studentProfile?.name || selectedCandidate.studentEmail
          }`}
          maxWidth="640px"
        >
          {selectedCandidate.studentProfile ? (
            <div className="candidate-dossier-modal">
              <div className="dossier-header">
                <div className="dossier-avatar">
                  {selectedCandidate.studentProfile.name?.charAt(0) || "S"}
                </div>
                <div>
                  <h4>{selectedCandidate.studentProfile.name}</h4>
                  <p>{selectedCandidate.studentEmail} · {selectedCandidate.studentProfile.phone || "No phone"}</p>
                </div>
              </div>

              <div className="dossier-grid">
                <div className="dossier-item">
                  <span>College:</span>
                  <strong>{selectedCandidate.studentProfile.college || "N/A"}</strong>
                </div>
                <div className="dossier-item">
                  <span>Degree & Branch:</span>
                  <strong>
                    {selectedCandidate.studentProfile.degree || "N/A"} (
                    {selectedCandidate.studentProfile.department || "N/A"})
                  </strong>
                </div>
                <div className="dossier-item">
                  <span>CGPA:</span>
                  <strong className="text-primary">{selectedCandidate.studentProfile.cgpa || "N/A"}</strong>
                </div>
                <div className="dossier-item">
                  <span>Graduation Year:</span>
                  <strong>{selectedCandidate.studentProfile.graduationYear || "N/A"}</strong>
                </div>
                <div className="dossier-item">
                  <span>Applied Role:</span>
                  <strong>{selectedCandidate.role}</strong>
                </div>
                <div className="dossier-item">
                  <span>Target Company:</span>
                  <strong>{selectedCandidate.companyName}</strong>
                </div>
              </div>

              <div className="modal-section mt-3">
                <h5>Skills</h5>
                <p>{selectedCandidate.studentProfile.skills || "Not specified"}</p>
              </div>

              <div className="modal-section mt-2">
                <h5>Resume submitted by student</h5>
                {/* Show application-specific submitted resume if available */}
                {(selectedCandidate.resumeFileName || selectedCandidate.studentProfile.resumeFileName) ? (
                  <div className="resume-download-row">
                    <span className="resume-file-label">
                      📄 {selectedCandidate.resumeFileName || selectedCandidate.studentProfile.resumeFileName}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleResumeDownload(selectedCandidate)}
                    >
                      <Download size={12} /> Download Resume
                    </button>
                  </div>
                ) : selectedCandidate.studentProfile.resumeUrl ? (
                  <p className="text-muted text-sm">No file resume uploaded — external link available below.</p>
                ) : (
                  <p className="text-muted text-sm">No resume was submitted with this application.</p>
                )}
                {selectedCandidate.studentProfile.resumeUrl && (
                  <a
                    href={selectedCandidate.studentProfile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm mt-2"
                  >
                    <ExternalLink size={12} /> Open External Resume Link
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p>Candidate profile details not available.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
