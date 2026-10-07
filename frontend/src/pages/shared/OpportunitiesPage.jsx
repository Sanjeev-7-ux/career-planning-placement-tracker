import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import Modal from "../../components/Modal";
import api from "../../api";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowRight,
  Filter,
  Clock,
  Sparkles
} from "lucide-react";

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
    if (user?.role === "STUDENT" && user?.email) {
      fetchMyApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/opportunities");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Could not load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await api.get(`/applications/student/${encodeURIComponent(user.email)}`);
      setMyApplications(Array.isArray(res.data) ? res.data : []);
    } catch {
      // ignore
    }
  };

  // Find if student applied to a job
  const getApplicationForJob = (jobId) => {
    return myApplications.find(
      (app) => app.opportunityId === jobId || app.opportunity?.id === jobId
    );
  };

  const handleApply = async (job) => {
    if (!user) {
      toast.info("Please sign in as a student to apply.");
      navigate("/login");
      return;
    }
    if (user.role !== "STUDENT") {
      toast.error("Only registered students can apply for roles.");
      return;
    }

    setApplyingJobId(job.id);
    try {
      await api.post(`/applications/${job.id}`, { studentEmail: user.email });
      toast.success(`Application submitted for ${job.title}!`);
      // Refresh applications
      await fetchMyApplications();
      if (selectedJob?.id === job.id) {
        setSelectedJob(null);
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Could not apply for this role. You may have already applied.";
      toast.error(errorMsg);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "ALL" ||
      job.type?.toUpperCase() === selectedType.toUpperCase() ||
      job.employmentType?.toUpperCase() === selectedType.toUpperCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="module-page opportunities-page">
      {/* Header */}
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Discover Your Next Role</span>
          <h1>Campus & Career Opportunities</h1>
          <p>
            Explore verified openings from top recruiting companies. Track deadlines, salary benchmarks, and requirements.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-card">
        <div className="search-input-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by role title, company, skills (e.g. Java, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-chips">
          <button
            className={`filter-chip ${selectedType === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedType("ALL")}
          >
            All Roles ({jobs.length})
          </button>
          <button
            className={`filter-chip ${selectedType === "FULL TIME" ? "active" : ""}`}
            onClick={() => setSelectedType("FULL TIME")}
          >
            Full Time
          </button>
          <button
            className={`filter-chip ${selectedType === "INTERNSHIP" ? "active" : ""}`}
            onClick={() => setSelectedType("INTERNSHIP")}
          >
            Internship
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading open opportunities...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state-card">
          <Briefcase size={48} className="empty-icon" />
          <h3>No matching opportunities found</h3>
          <p>Try adjusting your search keywords or clear your filters.</p>
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedType("ALL");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="jobs-cards-grid">
          {filteredJobs.map((job) => {
            const application = getApplicationForJob(job.id);
            const isApplied = Boolean(application);
            const skillsList = (job.requiredSkills || job.skills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            return (
              <article key={job.id} className="job-card">
                <div className="job-card-top">
                  <div className="job-company-avatar">
                    {job.company?.name ? job.company.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div className="job-title-info">
                    <span className="job-company-name">
                      {job.company?.name || "CareerPilot Partner"}
                    </span>
                    <h3 className="job-title">{job.title}</h3>
                  </div>
                </div>

                <div className="job-meta-pills">
                  <span className="meta-pill">
                    <MapPin size={13} />
                    {job.location || "Location Flexible"}
                  </span>
                  <span className="meta-pill">
                    <Briefcase size={13} />
                    {job.type || job.employmentType || "Full Time"}
                  </span>
                  {(job.salaryRange || job.stipendOrSalary) && (
                    <span className="meta-pill meta-salary">
                      <DollarSign size={13} />
                      {job.salaryRange || job.stipendOrSalary}
                    </span>
                  )}
                </div>

                <p className="job-card-description">
                  {job.description?.length > 130
                    ? `${job.description.substring(0, 130)}...`
                    : job.description}
                </p>

                {skillsList.length > 0 && (
                  <div className="job-skills-tags">
                    {skillsList.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {skillsList.length > 4 && (
                      <span className="skill-tag skill-more">+{skillsList.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="job-card-footer">
                  <div className="job-deadline-text">
                    {job.applicationDeadline || job.deadline ? (
                      <span>
                        <Calendar size={13} /> Deadline: {job.applicationDeadline || job.deadline}
                      </span>
                    ) : (
                      <span>
                        <Clock size={13} /> Open for Applications
                      </span>
                    )}
                  </div>

                  <div className="job-card-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedJob(job)}
                    >
                      Details
                    </button>

                    {isApplied ? (
                      <span className={`status-badge status-${application.status.toLowerCase()}`}>
                        <CheckCircle2 size={13} />
                        {application.status}
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={applyingJobId === job.id}
                        onClick={() => handleApply(job)}
                      >
                        {applyingJobId === job.id ? "Submitting..." : "Apply Now"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          maxWidth="680px"
        >
          <div className="job-modal-content">
            <div className="modal-company-header">
              <div className="modal-company-avatar">
                {selectedJob.company?.name ? selectedJob.company.name.charAt(0).toUpperCase() : "C"}
              </div>
              <div>
                <h4>{selectedJob.company?.name || "CareerPilot Partner"}</h4>
                <p className="modal-company-sub">
                  {selectedJob.company?.industry || "Technology"} · {selectedJob.location}
                </p>
              </div>
            </div>

            <div className="job-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Employment Type</span>
                <strong>{selectedJob.type || selectedJob.employmentType || "Full Time"}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Experience Required</span>
                <strong>{selectedJob.experience || "Fresher"}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Compensation</span>
                <strong className="text-highlight">
                  {selectedJob.salaryRange || selectedJob.stipendOrSalary || "Competitive"}
                </strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Application Deadline</span>
                <strong>{selectedJob.applicationDeadline || selectedJob.deadline || "Rolling"}</strong>
              </div>
            </div>

            <div className="modal-section">
              <h5>Role Description</h5>
              <p className="modal-desc-body">{selectedJob.description}</p>
            </div>

            <div className="modal-section">
              <h5>Required Skills & Competencies</h5>
              <div className="job-skills-tags">
                {(selectedJob.requiredSkills || selectedJob.skills || "Not specified")
                  .split(",")
                  .map((s, idx) => (
                    <span key={idx} className="skill-tag active-tag">
                      {s.trim()}
                    </span>
                  ))}
              </div>
            </div>

            {selectedJob.company?.description && (
              <div className="modal-section">
                <h5>About {selectedJob.company.name}</h5>
                <p className="modal-desc-body">{selectedJob.company.description}</p>
              </div>
            )}

            <div className="modal-actions-footer">
              <button className="btn btn-outline" onClick={() => setSelectedJob(null)}>
                Close
              </button>
              {getApplicationForJob(selectedJob.id) ? (
                <span className="status-badge status-approved">
                  <CheckCircle2 size={16} /> Applied (Status: {getApplicationForJob(selectedJob.id).status})
                </span>
              ) : (
                <button
                  className="btn btn-primary"
                  disabled={applyingJobId === selectedJob.id}
                  onClick={() => handleApply(selectedJob)}
                >
                  {applyingJobId === selectedJob.id ? "Submitting Application..." : "Submit Application Now"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
