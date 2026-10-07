import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api";
import {
  FileCheck2,
  Calendar,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const email = user?.email || "student@careerpilot.com";

  useEffect(() => {
    fetchApplications();
  }, [email]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/student/${encodeURIComponent(email)}`);
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Could not load your applications.");
    } finally {
      setLoading(false);
    }
  };

  const getStageNumber = (status) => {
    switch (status?.toUpperCase()) {
      case "APPLIED":
        return 1;
      case "SHORTLISTED":
      case "APPROVED":
        return 2;
      case "INTERVIEW":
        return 3;
      case "OFFERED":
      case "SELECTED":
        return 4;
      case "REJECTED":
        return -1;
      default:
        return 1;
    }
  };

  const filteredApps = applications.filter((app) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "IN_REVIEW") return app.status === "APPLIED";
    if (statusFilter === "SHORTLISTED") return ["SHORTLISTED", "APPROVED"].includes(app.status);
    if (statusFilter === "INTERVIEW") return app.status === "INTERVIEW";
    if (statusFilter === "OFFERED") return ["OFFERED", "SELECTED"].includes(app.status);
    if (statusFilter === "REJECTED") return app.status === "REJECTED";
    return true;
  });

  return (
    <div className="module-page my-applications-page">
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Your Placement Pipeline</span>
          <h1>My Job Applications</h1>
          <p>
            Track real-time candidate stage progression from submission through interview rounds and final offers.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="search-filter-card">
        <div className="filter-chips">
          <button
            className={`filter-chip ${statusFilter === "ALL" ? "active" : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            All Applications ({applications.length})
          </button>
          <button
            className={`filter-chip ${statusFilter === "IN_REVIEW" ? "active" : ""}`}
            onClick={() => setStatusFilter("IN_REVIEW")}
          >
            In Review
          </button>
          <button
            className={`filter-chip ${statusFilter === "SHORTLISTED" ? "active" : ""}`}
            onClick={() => setStatusFilter("SHORTLISTED")}
          >
            Shortlisted
          </button>
          <button
            className={`filter-chip ${statusFilter === "INTERVIEW" ? "active" : ""}`}
            onClick={() => setStatusFilter("INTERVIEW")}
          >
            Interview
          </button>
          <button
            className={`filter-chip ${statusFilter === "OFFERED" ? "active" : ""}`}
            onClick={() => setStatusFilter("OFFERED")}
          >
            Offered
          </button>
          <button
            className={`filter-chip ${statusFilter === "REJECTED" ? "active" : ""}`}
            onClick={() => setStatusFilter("REJECTED")}
          >
            Not Selected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="empty-state-card">
          <FileCheck2 size={48} className="empty-icon" />
          <h3>No applications found in this category</h3>
          <p>You can discover open roles and apply in just one click.</p>
          <Link to="/opportunities" className="btn btn-primary">
            Explore Openings &rarr;
          </Link>
        </div>
      ) : (
        <div className="applications-timeline-list">
          {filteredApps.map((app) => {
            const stage = getStageNumber(app.status);
            const isRejected = stage === -1;

            return (
              <article key={app.id} className="application-tracking-card">
                <div className="app-card-top-row">
                  <div className="app-company-info">
                    <div className="app-company-icon">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 className="app-role-title">{app.role}</h3>
                      <p className="app-company-name">{app.companyName || "CareerPartner"}</p>
                    </div>
                  </div>

                  <div className="app-status-badge-wrap">
                    <span className={`status-badge status-${(app.status || "APPLIED").toLowerCase()}`}>
                      {app.status || "APPLIED"}
                    </span>
                    {app.appliedAt && (
                      <small className="app-applied-date">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>

                {/* Stepper Pipeline */}
                {!isRejected ? (
                  <div className="pipeline-stepper">
                    <div className={`step-node ${stage >= 1 ? "completed" : ""}`}>
                      <div className="step-circle">1</div>
                      <span className="step-label">Applied</span>
                    </div>
                    <div className={`step-connector ${stage >= 2 ? "completed" : ""}`} />

                    <div className={`step-node ${stage >= 2 ? "completed" : ""}`}>
                      <div className="step-circle">2</div>
                      <span className="step-label">Shortlisted</span>
                    </div>
                    <div className={`step-connector ${stage >= 3 ? "completed" : ""}`} />

                    <div className={`step-node ${stage >= 3 ? "completed" : ""}`}>
                      <div className="step-circle">3</div>
                      <span className="step-label">Interview</span>
                    </div>
                    <div className={`step-connector ${stage >= 4 ? "completed" : ""}`} />

                    <div className={`step-node ${stage >= 4 ? "completed" : ""}`}>
                      <div className="step-circle">4</div>
                      <span className="step-label">Offer</span>
                    </div>
                  </div>
                ) : (
                  <div className="rejected-notice">
                    <XCircle size={16} />
                    <span>The employer decided not to proceed with this application. Keep exploring!</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
