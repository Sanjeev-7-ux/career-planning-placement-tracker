import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import Modal from "../../components/Modal";
import api from "../../api";
import downloadApplicationResume from "../../utils/downloadApplicationResume";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  Clock,
  XCircle,
  ExternalLink,
  PlusCircle,
  Filter,
  User,
  GraduationCap,
  Sparkles,
  Send,
  Download
} from "lucide-react";

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [offerModalApp, setOfferModalApp] = useState(null);

  // Interview Form
  const [interviewForm, setInterviewForm] = useState({
    round: "Technical Interview",
    interviewDateTime: "",
    mode: "Online",
    meetingLink: "https://meet.google.com/abc-def-ghi",
  });

  // Offer Form
  const [offerForm, setOfferForm] = useState({
    salary: "₹6-8 LPA",
    location: "Chennai",
    offerDate: new Date().toISOString().slice(0, 10),
    joiningDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  const fetchCompanyData = async () => {
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

      const [jobsRes, appsRes] = await Promise.all([
        api.get(`/opportunities/company/${match.id}`).catch(() => ({ data: [] })),
        api.get(`/applications/company/${match.id}`).catch(() => ({ data: [] })),
      ]);

      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
    } catch {
      toast.error("Could not load company dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Applicant marked as ${newStatus}!`);
      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status update failed.");
    }
  };

  const handleResumeDownload = async (application) => {
    try {
      await downloadApplicationResume(application);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not download the submitted resume.");
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewModalApp || !company) return;

    try {
      const payload = {
        studentEmail: interviewModalApp.studentEmail,
        companyName: company.name,
        role: interviewModalApp.role,
        round: interviewForm.round,
        interviewDateTime: interviewForm.interviewDateTime
          ? new Date(interviewForm.interviewDateTime).toISOString()
          : new Date().toISOString(),
        mode: interviewForm.mode,
        meetingLink: interviewForm.meetingLink,
      };

      await api.post("/interviews", payload);
      await updateStatus(interviewModalApp.id, "INTERVIEW");
      toast.success(`Interview scheduled for ${interviewModalApp.studentProfile?.name || interviewModalApp.studentEmail}!`);
      setInterviewModalApp(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to schedule interview.");
    }
  };

  const handleExtendOffer = async (e) => {
    e.preventDefault();
    if (!offerModalApp || !company) return;

    try {
      const payload = {
        studentEmail: offerModalApp.studentEmail,
        companyName: company.name,
        role: offerModalApp.role,
        salary: offerForm.salary,
        location: offerForm.location,
        offerDate: offerForm.offerDate,
        joiningDate: offerForm.joiningDate,
      };

      await api.post("/offers", payload);
      await updateStatus(offerModalApp.id, "OFFERED");
      toast.success(`Job offer extended to ${offerModalApp.studentProfile?.name || offerModalApp.studentEmail}!`);
      setOfferModalApp(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to extend offer.");
    }
  };

  if (!loading && !company) {
    return (
      <div className="module-page empty-profile-prompt">
        <div className="empty-state-card">
          <Briefcase size={48} className="empty-icon text-primary" />
          <h2>Complete Your Company Profile</h2>
          <p>Please register your company details before accessing the applicant hiring pipeline.</p>
          <Link to="/company-profile" className="btn btn-primary btn-lg mt-3">
            Setup Company Profile Now &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const approvedCount = applications.filter((a) =>
    ["APPROVED", "SHORTLISTED"].includes(a.status)
  ).length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;
  const offerCount = applications.filter((a) =>
    ["OFFERED", "SELECTED"].includes(a.status)
  ).length;

  const filteredApps = applications.filter((app) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "APPLIED") return app.status === "APPLIED";
    if (statusFilter === "SHORTLISTED")
      return ["APPROVED", "SHORTLISTED"].includes(app.status);
    if (statusFilter === "INTERVIEW") return app.status === "INTERVIEW";
    if (statusFilter === "OFFERED")
      return ["OFFERED", "SELECTED"].includes(app.status);
    if (statusFilter === "REJECTED") return app.status === "REJECTED";
    return true;
  });

  return (
    <div className="module-page company-dashboard-page">
      {/* Header Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text">
          <div className="badge-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Employer Recruitment Suite</span>
          </div>
          <h1>{company?.name || "Company"} Talent Dashboard</h1>
          <p>
            Review campus applicants, evaluate verified skills, coordinate interview rounds, and extend job offers.
          </p>
          <div className="welcome-quick-actions">
            <Link to="/post-job" className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Post New Opportunity
            </Link>
            <Link to="/manage-jobs" className="btn btn-outline btn-sm">
              Manage Postings ({jobs.length})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-blue">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="kpi-label">Active Postings</span>
            <strong className="kpi-value">{jobs.length}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-purple">
            <Users size={22} />
          </div>
          <div>
            <span className="kpi-label">Total Applicants</span>
            <strong className="kpi-value">{applications.length}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-amber">
            <Calendar size={22} />
          </div>
          <div>
            <span className="kpi-label">Interview Stage</span>
            <strong className="kpi-value">{interviewCount}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-emerald">
            <Award size={22} />
          </div>
          <div>
            <span className="kpi-label">Offers Extended</span>
            <strong className="kpi-value">{offerCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="search-filter-card">
        <div className="filter-chips">
          <button
            className={`filter-chip ${statusFilter === "ALL" ? "active" : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            All Applicants ({applications.length})
          </button>
          <button
            className={`filter-chip ${statusFilter === "APPLIED" ? "active" : ""}`}
            onClick={() => setStatusFilter("APPLIED")}
          >
            New ({applications.filter((a) => a.status === "APPLIED").length})
          </button>
          <button
            className={`filter-chip ${statusFilter === "SHORTLISTED" ? "active" : ""}`}
            onClick={() => setStatusFilter("SHORTLISTED")}
          >
            Shortlisted ({approvedCount})
          </button>
          <button
            className={`filter-chip ${statusFilter === "INTERVIEW" ? "active" : ""}`}
            onClick={() => setStatusFilter("INTERVIEW")}
          >
            In Interview ({interviewCount})
          </button>
          <button
            className={`filter-chip ${statusFilter === "OFFERED" ? "active" : ""}`}
            onClick={() => setStatusFilter("OFFERED")}
          >
            Offered ({offerCount})
          </button>
          <button
            className={`filter-chip ${statusFilter === "REJECTED" ? "active" : ""}`}
            onClick={() => setStatusFilter("REJECTED")}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="dashboard-card mt-3">
        <div className="card-header-row">
          <div>
            <h3>Candidate Applications</h3>
            <small className="card-subtitle">
              Inspect candidate profiles, academic performance, and trigger workflow actions
            </small>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading candidate submissions...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="empty-subcard">
            <Users size={40} className="empty-subicon" />
            <h4>No candidates found in this stage</h4>
            <p>Applications submitted by students will appear here in real time.</p>
          </div>
        ) : (
          <div className="candidate-cards-list">
            {filteredApps.map((app) => {
              const student = app.studentProfile;

              return (
                <article key={app.id} className="candidate-card">
                  <div className="candidate-header-row">
                    <div className="candidate-avatar">
                      {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
                    </div>

                    <div className="candidate-title-info">
                      <div className="name-and-status">
                        <h4>{student?.name || app.studentEmail}</h4>
                        <span className={`status-badge status-${(app.status || "APPLIED").toLowerCase()}`}>
                          {app.status || "APPLIED"}
                        </span>
                      </div>
                      <p className="candidate-role-tag">
                        Applied for: <strong>{app.role}</strong> · {app.studentEmail}
                      </p>
                    </div>

                    {app.appliedAt && (
                      <small className="candidate-applied-time">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>

                  {/* Candidate Quick Stats */}
                  <div className="candidate-academic-pills">
                    {student?.college && (
                      <span className="acad-pill">
                        🏫 {student.college}
                      </span>
                    )}
                    {student?.degree && (
                      <span className="acad-pill">
                        🎓 {student.degree}
                      </span>
                    )}
                    {student?.cgpa && (
                      <span className="acad-pill highlight-pill">
                        ⭐ CGPA: {student.cgpa}
                      </span>
                    )}
                    {student?.location && (
                      <span className="acad-pill">
                        📍 {student.location}
                      </span>
                    )}
                  </div>

                  {student?.skills && (
                    <div className="candidate-skills-line">
                      <small>Skills:</small>
                      <div className="mini-skills">
                        {student.skills.split(",").slice(0, 5).map((s, i) => (
                          <span key={i} className="mini-tag">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="candidate-actions-bar">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedCandidate(app)}
                    >
                      <User size={14} /> Full Profile
                    </button>

                    <div className="action-buttons-group">
                      {app.status === "APPLIED" && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => updateStatus(app.id, "SHORTLISTED")}
                          >
                            <CheckCircle2 size={14} /> Shortlist
                          </button>
                          <button
                            className="btn btn-outline btn-sm btn-danger-hover"
                            onClick={() => updateStatus(app.id, "REJECTED")}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}

                      {["SHORTLISTED", "APPROVED", "APPLIED"].includes(app.status) && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setInterviewModalApp(app);
                            setInterviewForm((prev) => ({
                              ...prev,
                              round: `${app.role} Technical Round`,
                            }));
                          }}
                        >
                          <Calendar size={14} /> Schedule Interview
                        </button>
                      )}

                      {["INTERVIEW", "SHORTLISTED", "APPROVED"].includes(app.status) && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setOfferModalApp(app);
                          }}
                        >
                          <Award size={14} /> Extend Job Offer
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Full Profile Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          title={`Candidate Dossier: ${
            selectedCandidate.studentProfile?.name || selectedCandidate.studentEmail
          }`}
          maxWidth="680px"
        >
          {selectedCandidate.studentProfile ? (
            <div className="candidate-dossier-modal">
              <div className="dossier-header">
                <div className="dossier-avatar">
                  {selectedCandidate.studentProfile.name?.charAt(0) || "S"}
                </div>
                <div>
                  <h4>{selectedCandidate.studentProfile.name}</h4>
                  <p>{selectedCandidate.studentEmail} · {selectedCandidate.studentProfile.phone || "No phone provided"}</p>
                </div>
              </div>

              <div className="dossier-grid">
                <div className="dossier-item">
                  <span>University / College:</span>
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
                  <span>Location:</span>
                  <strong>{selectedCandidate.studentProfile.location || "N/A"}</strong>
                </div>
                <div className="dossier-item">
                  <span>Applied Role:</span>
                  <strong>{selectedCandidate.role}</strong>
                </div>
              </div>

              <div className="modal-section mt-3">
                <h5>Technical Skills</h5>
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

              <div className="dossier-links-row mt-3">
                {selectedCandidate.studentProfile.linkedinUrl && (
                  <a
                    href={selectedCandidate.studentProfile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="meta-pill meta-link"
                  >
                    LinkedIn <ExternalLink size={11} />
                  </a>
                )}
                {selectedCandidate.studentProfile.githubUrl && (
                  <a
                    href={selectedCandidate.studentProfile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="meta-pill meta-link"
                  >
                    GitHub <ExternalLink size={11} />
                  </a>
                )}
                {selectedCandidate.studentProfile.portfolioUrl && (
                  <a
                    href={selectedCandidate.studentProfile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="meta-pill meta-link"
                  >
                    Portfolio <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p>Candidate has not completed detailed profile fields yet.</p>
          )}
        </Modal>
      )}

      {/* Schedule Interview Modal */}
      {interviewModalApp && (
        <Modal
          isOpen={Boolean(interviewModalApp)}
          onClose={() => setInterviewModalApp(null)}
          title={`Schedule Interview with ${
            interviewModalApp.studentProfile?.name || interviewModalApp.studentEmail
          }`}
          maxWidth="550px"
        >
          <form onSubmit={handleScheduleInterview} className="modal-form">
            <div className="form-group">
              <label>Interview Round Title</label>
              <input
                required
                value={interviewForm.round}
                onChange={(e) =>
                  setInterviewForm({ ...interviewForm, round: e.target.value })
                }
                placeholder="e.g. Technical Round 1, System Design, HR"
              />
            </div>

            <div className="form-group">
              <label>Interview Date & Time</label>
              <input
                type="datetime-local"
                required
                value={interviewForm.interviewDateTime}
                onChange={(e) =>
                  setInterviewForm({ ...interviewForm, interviewDateTime: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Interview Mode</label>
              <select
                value={interviewForm.mode}
                onChange={(e) =>
                  setInterviewForm({ ...interviewForm, mode: e.target.value })
                }
              >
                <option value="Online">Online Video Call</option>
                <option value="On-Campus">On-Campus / In-Person</option>
                <option value="Telephone">Telephone</option>
              </select>
            </div>

            <div className="form-group">
              <label>Meeting / Video Link</label>
              <input
                required
                value={interviewForm.meetingLink}
                onChange={(e) =>
                  setInterviewForm({ ...interviewForm, meetingLink: e.target.value })
                }
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setInterviewModalApp(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Schedule & Notify Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Extend Job Offer Modal */}
      {offerModalApp && (
        <Modal
          isOpen={Boolean(offerModalApp)}
          onClose={() => setOfferModalApp(null)}
          title={`Extend Job Offer to ${
            offerModalApp.studentProfile?.name || offerModalApp.studentEmail
          }`}
          maxWidth="550px"
        >
          <form onSubmit={handleExtendOffer} className="modal-form">
            <div className="form-group">
              <label>Offered Role</label>
              <input readOnly value={offerModalApp.role} className="input-readonly" />
            </div>

            <div className="form-group">
              <label>Annual Compensation / Salary Package</label>
              <input
                required
                value={offerForm.salary}
                onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                placeholder="e.g. ₹6-8 LPA or ₹50,000/month"
              />
            </div>

            <div className="form-group">
              <label>Office / Work Location</label>
              <input
                required
                value={offerForm.location}
                onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })}
                placeholder="e.g. Chennai (Hybrid)"
              />
            </div>

            <div className="grid-two">
              <div className="form-group">
                <label>Offer Date</label>
                <input
                  type="date"
                  required
                  value={offerForm.offerDate}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, offerDate: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Expected Joining Date</label>
                <input
                  type="date"
                  required
                  value={offerForm.joiningDate}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, joiningDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOfferModalApp(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm & Issue Offer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
