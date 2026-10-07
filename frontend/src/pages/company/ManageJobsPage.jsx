import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Trash2,
  PlusCircle,
  ExternalLink,
  DollarSign
} from "lucide-react";

export default function ManageJobsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const compRes = await api.get("/companies");
      const match = compRes.data.find(
        (c) => c.email === user.email || c.name?.toLowerCase() === user.name?.toLowerCase()
      );

      if (!match) {
        setCompany(null);
        setLoading(false);
        return;
      }

      setCompany(match);
      const jobsRes = await api.get(`/opportunities/company/${match.id}`);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
    } catch {
      toast.error("Could not load your job postings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to delete and close the opening "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/opportunities/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job posting removed.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete job.");
    }
  };

  return (
    <div className="module-page manage-jobs-page">
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Recruitment Campaigns</span>
          <h1>Manage Posted Openings</h1>
          <p>
            Track your open vacancies, monitor closing deadlines, and manage listings for {company?.name || "your organization"}.
          </p>
        </div>
      </div>

      <div className="manage-jobs-toolbar">
        <h3>Active Listings ({jobs.length})</h3>
        <Link to="/post-job" className="btn btn-primary btn-sm">
          <PlusCircle size={16} /> Post New Role
        </Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your job listings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state-card">
          <Briefcase size={48} className="empty-icon" />
          <h3>No active job openings posted</h3>
          <p>Create your first opportunity to begin receiving student applications.</p>
          <Link to="/post-job" className="btn btn-primary mt-2">
            Post an Opening Now
          </Link>
        </div>
      ) : (
        <div className="jobs-cards-grid">
          {jobs.map((job) => (
            <article key={job.id} className="job-card">
              <div className="job-card-top">
                <div className="job-company-avatar">
                  {company?.name ? company.name.charAt(0) : "C"}
                </div>
                <div className="job-title-info">
                  <span className="job-company-name">{company?.name}</span>
                  <h3 className="job-title">{job.title}</h3>
                </div>
              </div>

              <div className="job-meta-pills">
                <span className="meta-pill">
                  <MapPin size={13} /> {job.location}
                </span>
                <span className="meta-pill">
                  <Briefcase size={13} /> {job.type || "Full Time"}
                </span>
                {job.salaryRange && (
                  <span className="meta-pill meta-salary">
                    <DollarSign size={13} /> {job.salaryRange}
                  </span>
                )}
              </div>

              <p className="job-card-description">{job.description}</p>

              <div className="job-card-footer">
                <span className="job-deadline-text">
                  <Calendar size={13} /> Deadline: {job.applicationDeadline || "Rolling"}
                </span>
                <div className="job-card-actions">
                  <Link to="/company-dashboard" className="btn btn-outline btn-sm">
                    View Applicants
                  </Link>
                  <button
                    className="btn btn-outline btn-sm btn-danger-hover"
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    title="Delete and close job"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
