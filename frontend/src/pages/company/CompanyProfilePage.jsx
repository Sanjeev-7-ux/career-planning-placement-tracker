import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api";
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  FileText,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [company, setCompany] = useState({
    name: user?.name || "",
    email: user?.email || "",
    industry: "Information Technology",
    location: "Chennai, India",
    website: "https://example.com",
    logoUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("/companies");
      const match = res.data.find(
        (c) => c.email === user.email || c.name?.toLowerCase() === user.name?.toLowerCase()
      );
      if (match) {
        setCompany((prev) => ({ ...prev, ...match }));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCompany((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/companies", {
        ...company,
        email: user?.email || company.email,
      });
      toast.success("Company profile saved successfully!");
      navigate("/company-dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-page company-profile-page">
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Employer Branding</span>
          <h1>Company Presence Profile</h1>
          <p>
            Define how candidates view your corporate culture, industry focus, and campus recruitment reputation.
          </p>
        </div>
      </div>

      <div className="profile-layout-grid">
        <div className="profile-form-col">
          <form onSubmit={handleSubmit} className="form-card profile-card">
            <h3 className="section-title">Organization Details</h3>

            <div className="grid-two">
              <div className="form-group">
                <label>Company / Organization Name *</label>
                <div className="input-with-icon">
                  <Building2 size={16} className="field-icon" />
                  <input
                    required
                    name="name"
                    value={company.name}
                    onChange={handleChange}
                    placeholder="e.g. ABC Technologies"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Recruitment Contact Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    name="email"
                    value={company.email}
                    onChange={handleChange}
                    placeholder="careers@company.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Industry / Domain</label>
                <input
                  name="industry"
                  value={company.industry}
                  onChange={handleChange}
                  placeholder="e.g. Enterprise Software, Fintech, HealthTech"
                />
              </div>

              <div className="form-group">
                <label>Headquarters / Location</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="field-icon" />
                  <input
                    name="location"
                    value={company.location}
                    onChange={handleChange}
                    placeholder="e.g. Chennai, India"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Corporate Website</label>
                <div className="input-with-icon">
                  <Globe size={16} className="field-icon" />
                  <input
                    name="website"
                    value={company.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                  />
                </div>
              </div>
            </div>

            <div className="form-group mt-3">
              <label>About the Organization & Campus Hiring Mission</label>
              <textarea
                rows="5"
                name="description"
                value={company.description}
                onChange={handleChange}
                placeholder="Describe your company culture, technology stack, and career growth trajectories for campus hires..."
              />
            </div>

            <div className="form-actions-bar">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Company Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Preview */}
        <div className="profile-side-col">
          <div className="side-panel-card">
            <h3>Candidate Preview</h3>
            <p className="text-muted text-sm">
              Here is how candidates see your company header:
            </p>

            <div className="company-card mt-3">
              <div className="company-card-header">
                <div className="company-avatar">
                  {company.name ? company.name.charAt(0) : "C"}
                </div>
                <div>
                  <h4 className="company-name">{company.name || "Company Name"}</h4>
                  <span className="company-industry-tag">
                    {company.industry || "Industry"}
                  </span>
                </div>
              </div>

              <div className="company-meta-row mt-2">
                <span className="meta-pill">
                  <MapPin size={12} /> {company.location || "Location"}
                </span>
                {company.website && (
                  <span className="meta-pill">
                    <Globe size={12} /> Website
                  </span>
                )}
              </div>

              <p className="company-description mt-2">
                {company.description ||
                  "Detailed company description will appear here on your public card."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
