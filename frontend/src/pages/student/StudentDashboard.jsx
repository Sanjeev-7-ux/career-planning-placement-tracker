import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api";
import {
  Briefcase,
  Send,
  Calendar,
  Award,
  TrendingUp,
  Bell,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  FileCheck2,
  AlertCircle
} from "lucide-react";
import progressIllustration from "../../assets/progress-dashboard.svg";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = user?.email || "student@careerpilot.com";

  useEffect(() => {
    fetchDashboardInfo();
  }, [email]);

  const fetchDashboardInfo = async () => {
    setLoading(true);
    try {
      const [dashRes, appsRes, intRes, offRes] = await Promise.all([
        api.get(`/students/${encodeURIComponent(email)}/dashboard`).catch(() => ({ data: null })),
        api.get(`/applications/student/${encodeURIComponent(email)}`).catch(() => ({ data: [] })),
        api.get(`/interviews/student/${encodeURIComponent(email)}`).catch(() => ({ data: [] })),
        api.get(`/offers/student/${encodeURIComponent(email)}`).catch(() => ({ data: [] })),
      ]);

      setDashboardData(dashRes.data);
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      setInterviews(Array.isArray(intRes.data) ? intRes.data : []);
      setOffers(Array.isArray(offRes.data) ? offRes.data : []);
    } catch {
      toast.error("Could not load all dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const readinessScore = dashboardData?.careerReadiness || 65;

  return (
    <div className="module-page student-dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text">
          <div className="badge-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Student Career Command Center</span>
          </div>
          <h1>
            Welcome back, {dashboardData?.welcomeName || user?.name || "Student"}!
          </h1>
          <p>
            Track your job applications, prepare for scheduled interview rounds, and build your career portfolio.
          </p>
          <div className="welcome-quick-actions">
            <Link to="/opportunities" className="btn btn-primary btn-sm">
              <Briefcase size={15} /> Browse Jobs
            </Link>
            <Link to="/profile" className="btn btn-outline btn-sm">
              Update Profile & CV
            </Link>
          </div>
        </div>

        <div className="readiness-card">
          <div className="readiness-header">
            <span className="readiness-title">
              <TrendingUp size={16} /> Career Readiness Index
            </span>
            <span className="readiness-score-number">{readinessScore}%</span>
          </div>

          <div className="readiness-progress-track">
            <div
              className="readiness-progress-fill"
              style={{ width: `${Math.min(100, Math.max(10, readinessScore))}%` }}
            />
          </div>

          <p className="readiness-hint">
            {readinessScore >= 80
              ? "🚀 Excellent! Your profile is highly competitive for placement drives."
              : readinessScore >= 60
              ? "⚡ Good progress! Add certifications and upload your resume to reach 90%+."
              : "💡 Complete your college details and degree to boost your score."}
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-blue">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="kpi-label">Open Opportunities</span>
            <strong className="kpi-value">{dashboardData?.jobs ?? 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-purple">
            <Send size={22} />
          </div>
          <div>
            <span className="kpi-label">Submitted Applications</span>
            <strong className="kpi-value">{applications.length}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-amber">
            <Calendar size={22} />
          </div>
          <div>
            <span className="kpi-label">Interviews Scheduled</span>
            <strong className="kpi-value">{interviews.length}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-emerald">
            <Award size={22} />
          </div>
          <div>
            <span className="kpi-label">Job Offers</span>
            <strong className="kpi-value">{offers.length}</strong>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="dashboard-grid-layout">
        {/* Left Column: Applications & Interviews */}
        <div className="dashboard-main-col">
          {/* Active Applications */}
          <section className="dashboard-card">
            <div className="card-header-row">
              <div>
                <h3>Recent Applications</h3>
                <small className="card-subtitle">Your active placement candidacies</small>
              </div>
              <Link to="/my-applications" className="card-header-link">
                View All ({applications.length}) &rarr;
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="empty-subcard">
                <FileCheck2 size={32} className="empty-subicon" />
                <p>You haven't submitted any applications yet.</p>
                <Link to="/opportunities" className="btn btn-outline btn-sm">
                  Explore Open Jobs
                </Link>
              </div>
            ) : (
              <div className="dashboard-list">
                {applications.slice(0, 4).map((app) => (
                  <div key={app.id} className="dashboard-list-item">
                    <div className="item-main-info">
                      <strong>{app.role}</strong>
                      <span className="item-sub">{app.companyName}</span>
                    </div>

                    <div className="item-right">
                      {app.appliedAt && (
                        <small className="item-date">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </small>
                      )}
                      <span className={`status-badge status-${(app.status || "APPLIED").toLowerCase()}`}>
                        {app.status || "APPLIED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Scheduled Interviews */}
          <section className="dashboard-card">
            <div className="card-header-row">
              <div>
                <h3>Scheduled Interviews</h3>
                <small className="card-subtitle">Upcoming rounds with recruiting teams</small>
              </div>
              <span className="badge badge-subtle">{interviews.length} rounds</span>
            </div>

            {interviews.length === 0 ? (
              <div className="empty-subcard">
                <Calendar size={32} className="empty-subicon" />
                <p>No upcoming interviews currently scheduled.</p>
              </div>
            ) : (
              <div className="interview-cards-list">
                {interviews.map((item) => (
                  <div key={item.id} className="interview-slot-card">
                    <div className="interview-time-col">
                      <Calendar size={18} className="text-primary" />
                      <strong>
                        {item.interviewDateTime
                          ? new Date(item.interviewDateTime).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : "Scheduled"}
                      </strong>
                      <small>
                        {item.interviewDateTime
                          ? new Date(item.interviewDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </small>
                    </div>

                    <div className="interview-details-col">
                      <h4>{item.round || "Technical Interview"}</h4>
                      <p className="interview-company-role">
                        {item.companyName} · {item.role}
                      </p>
                      <div className="interview-mode-pill">
                        Mode: <strong>{item.mode || "Online"}</strong>
                      </div>
                    </div>

                    {item.meetingLink && (
                      <div className="interview-action-col">
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Join Meeting <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Job Offers */}
          {offers.length > 0 && (
            <section className="dashboard-card highlight-card">
              <div className="card-header-row">
                <div>
                  <h3 className="text-emerald">🎉 Job Offers Received</h3>
                  <small className="card-subtitle">Congratulations on your placement achievements!</small>
                </div>
              </div>

              <div className="offers-list">
                {offers.map((offer) => (
                  <div key={offer.id} className="offer-congrats-card">
                    <div className="offer-top">
                      <div>
                        <h4>{offer.role}</h4>
                        <p className="offer-company-name">{offer.companyName}</p>
                      </div>
                      <span className="status-badge status-approved">OFFERED</span>
                    </div>

                    <div className="offer-details-row">
                      <div className="offer-detail">
                        <span>Compensation:</span>
                        <strong>{offer.salary || "Competitive"}</strong>
                      </div>
                      <div className="offer-detail">
                        <span>Location:</span>
                        <strong>{offer.location || "On-site"}</strong>
                      </div>
                      {offer.joiningDate && (
                        <div className="offer-detail">
                          <span>Joining Date:</span>
                          <strong>{offer.joiningDate}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar: Notifications & Opportunities */}
        <div className="dashboard-side-col">
          {/* Notifications Box */}
          <section className="dashboard-card">
            <div className="card-header-row">
              <h3>
                <Bell size={18} className="text-primary" /> Notifications
              </h3>
            </div>

            {dashboardData?.notifications?.length ? (
              <div className="notifications-compact-list">
                {dashboardData.notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="notif-compact-item">
                    <span className="notif-type-bubble">{n.type}</span>
                    <p className="notif-compact-msg">{n.message}</p>
                    {n.createdAt && (
                      <small className="notif-compact-time">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No new notifications.</p>
            )}
          </section>

          {/* Featured Opportunities */}
          <section className="dashboard-card">
            <div className="card-header-row">
              <h3>Recommended Jobs</h3>
              <Link to="/opportunities" className="card-header-link">
                Browse &rarr;
              </Link>
            </div>

            <div className="recommended-jobs-list">
              {dashboardData?.opportunities?.slice(0, 3).map((job) => (
                <div key={job.id} className="recommended-job-item">
                  <strong>{job.title}</strong>
                  <span className="text-muted text-sm">
                    {job.company?.name || "CareerPilot"} · {job.location}
                  </span>
                  <div className="rec-job-footer">
                    <small className="text-primary font-bold">
                      {job.salaryRange || "Competitive"}
                    </small>
                    <Link to="/opportunities" className="btn btn-outline btn-xs">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
