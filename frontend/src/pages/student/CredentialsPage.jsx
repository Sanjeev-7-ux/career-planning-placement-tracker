import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api";
import {
  Award,
  Briefcase,
  PlusCircle,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function CredentialsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const email = user?.email || "student@careerpilot.com";

  const [activeTab, setActiveTab] = useState("certifications");
  const [certifications, setCertifications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cert Form
  const [certForm, setCertForm] = useState({
    name: "",
    issuingOrganization: "",
    credentialId: "",
    certificateUrl: "",
  });
  const [editingCertId, setEditingCertId] = useState(null);

  // Internship Form
  const [internForm, setInternForm] = useState({
    companyName: "",
    role: "",
    location: "",
    duration: "",
    status: "Completed",
  });

  useEffect(() => {
    fetchCredentials();
  }, [email]);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const [certRes, internRes] = await Promise.all([
        api.get(`/students/${encodeURIComponent(email)}/certifications`),
        api.get(`/students/${encodeURIComponent(email)}/internships`),
      ]);
      setCertifications(Array.isArray(certRes.data) ? certRes.data : []);
      setInternships(Array.isArray(internRes.data) ? internRes.data : []);
    } catch {
      toast.error("Could not load credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Certifications CRUD
  const handleCertSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/students/${encodeURIComponent(email)}/certifications`;
      if (editingCertId === null) {
        const res = await api.post(endpoint, certForm);
        setCertifications((prev) => [...prev, res.data]);
        toast.success("Certification added!");
      } else {
        const res = await api.put(`${endpoint}/${editingCertId}`, certForm);
        setCertifications((prev) =>
          prev.map((c) => (c.id === editingCertId ? res.data : c))
        );
        toast.success("Certification updated!");
      }
      setCertForm({ name: "", issuingOrganization: "", credentialId: "", certificateUrl: "" });
      setEditingCertId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save certification.");
    }
  };

  const handleEditCert = (item) => {
    setEditingCertId(item.id);
    setCertForm({
      name: item.name || "",
      issuingOrganization: item.issuingOrganization || "",
      credentialId: item.credentialId || "",
      certificateUrl: item.certificateUrl || "",
    });
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm("Delete this certification?")) return;
    try {
      await api.delete(`/students/${encodeURIComponent(email)}/certifications/${id}`);
      setCertifications((prev) => prev.filter((c) => c.id !== id));
      toast.success("Certification removed.");
    } catch {
      toast.error("Failed to delete certification.");
    }
  };

  // Internships CRUD
  const handleInternSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/students/${encodeURIComponent(email)}/internships`, internForm);
      setInternships((prev) => [...prev, res.data]);
      setInternForm({ companyName: "", role: "", location: "", duration: "", status: "Completed" });
      toast.success("Internship added!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save internship.");
    }
  };

  const handleDeleteIntern = async (id) => {
    if (!window.confirm("Delete this internship experience?")) return;
    try {
      await api.delete(`/students/${encodeURIComponent(email)}/internships/${id}`);
      setInternships((prev) => prev.filter((i) => i.id !== id));
      toast.success("Internship removed.");
    } catch {
      toast.error("Failed to delete internship.");
    }
  };

  return (
    <div className="module-page credentials-page">
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Verified Achievements</span>
          <h1>Certifications & Internships</h1>
          <p>
            Showcase your completed industry certifications, licenses, and practical internship experiences.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="auth-mode-tabs mt-4">
        <button
          className={`auth-tab ${activeTab === "certifications" ? "active" : ""}`}
          onClick={() => setActiveTab("certifications")}
        >
          <Award size={16} />
          <span>Certifications ({certifications.length})</span>
        </button>
        <button
          className={`auth-tab ${activeTab === "internships" ? "active" : ""}`}
          onClick={() => setActiveTab("internships")}
        >
          <Briefcase size={16} />
          <span>Internships ({internships.length})</span>
        </button>
      </div>

      {activeTab === "certifications" && (
        <div className="tab-content-grid">
          {/* Add / Edit Form */}
          <div className="form-column">
            <form onSubmit={handleCertSubmit} className="form-card">
              <h3>{editingCertId ? "Edit Certification" : "Add New Certification"}</h3>

              <div className="form-group">
                <label>Certification Name *</label>
                <input
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Issuing Organization *</label>
                <input
                  required
                  placeholder="e.g. Amazon Web Services, Oracle, Coursera"
                  value={certForm.issuingOrganization}
                  onChange={(e) =>
                    setCertForm({ ...certForm, issuingOrganization: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Credential ID</label>
                <input
                  placeholder="e.g. AWS-12345678"
                  value={certForm.credentialId}
                  onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Verification URL</label>
                <input
                  placeholder="https://..."
                  value={certForm.certificateUrl}
                  onChange={(e) => setCertForm({ ...certForm, certificateUrl: e.target.value })}
                />
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn btn-primary">
                  {editingCertId ? "Update Certification" : "Add Certification"}
                </button>
                {editingCertId && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setEditingCertId(null);
                      setCertForm({
                        name: "",
                        issuingOrganization: "",
                        credentialId: "",
                        certificateUrl: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Cards */}
          <div className="list-column">
            {certifications.length === 0 ? (
              <div className="empty-state-card">
                <Award size={40} className="empty-icon" />
                <h4>No certifications added yet</h4>
                <p>Adding recognized certifications gives recruiters instant proof of your technical expertise.</p>
              </div>
            ) : (
              <div className="credential-cards-list">
                {certifications.map((item) => (
                  <div key={item.id} className="credential-card">
                    <div className="cred-top-row">
                      <div className="cred-icon-wrap">
                        <Award size={20} />
                      </div>
                      <div className="cred-main-info">
                        <h4>{item.name}</h4>
                        <span className="cred-issuer">{item.issuingOrganization}</span>
                      </div>
                      <div className="cred-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditCert(item)}
                          title="Edit certification"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleDeleteCert(item.id)}
                          title="Delete certification"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {item.credentialId && (
                      <p className="cred-id">
                        <strong>Credential ID:</strong> {item.credentialId}
                      </p>
                    )}

                    {item.certificateUrl && (
                      <a
                        href={item.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cred-link"
                      >
                        View Verification <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "internships" && (
        <div className="tab-content-grid">
          {/* Add Internship Form */}
          <div className="form-column">
            <form onSubmit={handleInternSubmit} className="form-card">
              <h3>Add Internship Experience</h3>

              <div className="form-group">
                <label>Company / Organization Name *</label>
                <input
                  required
                  placeholder="e.g. ABC Technologies"
                  value={internForm.companyName}
                  onChange={(e) => setInternForm({ ...internForm, companyName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Role / Designation *</label>
                <input
                  required
                  placeholder="e.g. Software Engineering Intern"
                  value={internForm.role}
                  onChange={(e) => setInternForm({ ...internForm, role: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  placeholder="e.g. Chennai, India (or Remote)"
                  value={internForm.location}
                  onChange={(e) => setInternForm({ ...internForm, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  placeholder="e.g. 3 Months (June 2024 - Aug 2024)"
                  value={internForm.duration}
                  onChange={(e) => setInternForm({ ...internForm, duration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={internForm.status}
                  onChange={(e) => setInternForm({ ...internForm, status: e.target.value })}
                >
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn btn-primary">
                  Add Internship
                </button>
              </div>
            </form>
          </div>

          {/* Internship Cards */}
          <div className="list-column">
            {internships.length === 0 ? (
              <div className="empty-state-card">
                <Briefcase size={40} className="empty-icon" />
                <h4>No internships logged yet</h4>
                <p>Highlight your industry internships, summer training, and project apprenticeships.</p>
              </div>
            ) : (
              <div className="credential-cards-list">
                {internships.map((item) => (
                  <div key={item.id} className="credential-card">
                    <div className="cred-top-row">
                      <div className="cred-icon-wrap intern-icon">
                        <Briefcase size={20} />
                      </div>
                      <div className="cred-main-info">
                        <h4>{item.role || "Intern"}</h4>
                        <span className="cred-issuer">{item.companyName}</span>
                      </div>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDeleteIntern(item.id)}
                        title="Delete internship"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="cred-meta-row">
                      {item.location && <span>📍 {item.location}</span>}
                      {item.duration && <span>⏱️ {item.duration}</span>}
                      <span className="badge badge-subtle">{item.status || "Completed"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
