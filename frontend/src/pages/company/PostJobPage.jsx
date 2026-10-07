import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api";
import {
  Briefcase,
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    location: "Chennai",
    type: "Full Time",
    employmentType: "Full Time",
    experience: "Fresher",
    requiredSkills: "Java, Spring Boot, React, MySQL",
    salaryRange: "₹5-8 LPA",
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .slice(0, 10),
    description: "",
  });

  useEffect(() => {
    fetchCompany();
  }, [user]);

  const fetchCompany = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("/companies");
      const match = res.data.find(
        (c) => c.email === user.email || c.name?.toLowerCase() === user.name?.toLowerCase()
      );
      setCompany(match || null);
    } catch {
      toast.error("Could not verify company identity.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "employmentType" ? { type: value } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) {
      toast.error("Please complete your company profile before posting jobs.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyId: company.id,
        title: form.title,
        location: form.location,
        type: form.type,
        employmentType: form.employmentType,
        experience: form.experience,
        requiredSkills: form.requiredSkills,
        salaryRange: form.salaryRange,
        description: form.description,
        applicationDeadline: form.applicationDeadline,
      };

      await api.post("/opportunities", payload);
      toast.success("Job opening published successfully!");
      navigate("/manage-jobs");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post job opening.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !company) {
    return (
      <div className="module-page empty-profile-prompt">
        <div className="empty-state-card">
          <Building2 size={48} className="empty-icon text-primary" />
          <h2>Create Company Profile First</h2>
          <p>You need an active company profile before posting campus jobs and opportunities.</p>
          <Link to="/company-profile" className="btn btn-primary btn-lg mt-3">
            Setup Company Profile &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page post-job-page">
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Recruitment Campaign</span>
          <h1>Post a New Opportunity</h1>
          <p>
            Publish job openings, set candidate eligibility criteria, and invite student applications.
          </p>
        </div>
      </div>

      <div className="post-job-container">
        <form onSubmit={handleSubmit} className="form-card max-width-card">
          <div className="form-company-indicator">
            <Building2 size={18} className="text-primary" />
            <span>Posting on behalf of: <strong>{company?.name}</strong></span>
          </div>

          <div className="form-group">
            <label>Job Title / Role *</label>
            <input
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Graduate Software Engineer, Associate Consultant"
            />
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label>Employment Type</label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
              >
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="form-group">
              <label>Work Location</label>
              <div className="input-with-icon">
                <MapPin size={16} className="field-icon" />
                <input
                  required
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Chennai, Bangalore, or Remote"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <input
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. Fresher, 0-1 Years"
              />
            </div>

            <div className="form-group">
              <label>Compensation / Salary Band</label>
              <div className="input-with-icon">
                <DollarSign size={16} className="field-icon" />
                <input
                  name="salaryRange"
                  value={form.salaryRange}
                  onChange={handleChange}
                  placeholder="e.g. ₹6-9 LPA or ₹30,000/mo"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Application Deadline</label>
              <div className="input-with-icon">
                <Calendar size={16} className="field-icon" />
                <input
                  type="date"
                  name="applicationDeadline"
                  value={form.applicationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Required Skills & Technologies (comma separated)</label>
            <input
              name="requiredSkills"
              value={form.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. Java, Spring Boot, React, MySQL, Data Structures"
            />
          </div>

          <div className="form-group">
            <label>Job Description & Responsibilities *</label>
            <textarea
              required
              rows="6"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the day-to-day responsibilities, what makes your team exciting, and qualifications desired..."
            />
          </div>

          <div className="form-actions-bar">
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              <span>{submitting ? "Publishing Role..." : "Publish Job Opening"}</span>
              <ArrowRight size={18} />
            </button>
            <Link to="/company-dashboard" className="btn btn-outline btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
