import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api";
import {
  User,
  GraduationCap,
  Building,
  MapPin,
  Phone,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Link2,
  Code2,
  Globe,
  Sparkles
} from "lucide-react";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const email = user?.email || "student@careerpilot.com";

  const emptyProfile = {
    phone: "",
    degree: "",
    college: "",
    department: "",
    graduationYear: "",
    cgpa: "",
    location: "",
    skills: "",
    resumeUrl: "",
    resumeFileName: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  };

  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, [email]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students/${encodeURIComponent(email)}/profile`);
      const loaded = Object.fromEntries(
        Object.keys(emptyProfile).map((k) => [k, res.data[k] ?? ""])
      );
      setProfile(loaded);
      setSavedProfile(loaded);
    } catch {
      toast.error("Could not load your profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...profile,
        graduationYear: profile.graduationYear ? Number(profile.graduationYear) : null,
        cgpa: profile.cgpa ? Number(profile.cgpa) : null,
      };
      const res = await api.put(`/students/${encodeURIComponent(email)}/profile`, payload);
      const updated = Object.fromEntries(
        Object.keys(emptyProfile).map((k) => [k, res.data[k] ?? ""])
      );
      setSavedProfile(updated);
      setProfile(updated);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume file size must be less than 5 MB.");
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(
        `/students/${encodeURIComponent(email)}/profile/resume`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const fileName = res.data.resumeFileName || file.name;
      setProfile((prev) => ({ ...prev, resumeFileName: fileName }));
      setSavedProfile((prev) => ({ ...prev, resumeFileName: fileName }));
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDownload = async () => {
    try {
      const res = await api.get(`/students/${encodeURIComponent(email)}/profile/resume`, {
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = savedProfile?.resumeFileName || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success("Downloading resume file...");
    } catch {
      toast.error("Could not download the resume file.");
    }
  };

  const handleDeleteField = async (field, label) => {
    if (!window.confirm(`Clear ${label}?`)) return;
    try {
      await api.delete(`/students/${encodeURIComponent(email)}/profile/fields/${field}`);
      setProfile((prev) => ({ ...prev, [field]: "" }));
      setSavedProfile((prev) => ({ ...prev, [field]: "" }));
      toast.success(`${label} cleared.`);
    } catch {
      toast.error(`Could not delete ${label}.`);
    }
  };

  return (
    <div className="module-page student-profile-page">
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Professional Identity</span>
          <h1>Student Profile & CV</h1>
          <p>
            Your comprehensive academic resume showcased to recruiters and campus placement teams.
          </p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Main Form */}
        <div className="profile-form-col">
          <form onSubmit={handleSubmit} className="form-card profile-card">
            <h3 className="section-title">Academic & Contact Information</h3>

            <div className="grid-two">
              <div className="form-group">
                <label>College / University</label>
                <div className="input-with-icon">
                  <Building size={16} className="field-icon" />
                  <input
                    name="college"
                    value={profile.college}
                    onChange={handleChange}
                    placeholder="e.g. SRM Institute of Science & Technology"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Degree & Major</label>
                <div className="input-with-icon">
                  <GraduationCap size={16} className="field-icon" />
                  <input
                    name="degree"
                    value={profile.degree}
                    onChange={handleChange}
                    placeholder="e.g. B.E. Computer Science"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Department / Branch</label>
                <input
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  placeholder="e.g. CSE / IT"
                />
              </div>

              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={profile.graduationYear}
                  onChange={handleChange}
                  placeholder="2025"
                />
              </div>

              <div className="form-group">
                <label>CGPA / Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={profile.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.75"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="field-icon" />
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Current Location</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="field-icon" />
                  <input
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    placeholder="e.g. Chennai, India"
                  />
                </div>
              </div>
            </div>

            <h3 className="section-title mt-4">Professional & Social Links</h3>
            <div className="grid-two">
              <div className="form-group">
                <label>LinkedIn URL</label>
                <div className="input-with-icon">
                  <Link2 size={16} className="field-icon" />
                  <input
                    name="linkedinUrl"
                    value={profile.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GitHub URL</label>
                <div className="input-with-icon">
                  <Code2 size={16} className="field-icon" />
                  <input
                    name="githubUrl"
                    value={profile.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Portfolio / Personal Website</label>
                <div className="input-with-icon">
                  <Globe size={16} className="field-icon" />
                  <input
                    name="portfolioUrl"
                    value={profile.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://myportfolio.com"
                  />
                </div>
              </div>
            </div>

            <h3 className="section-title mt-4">Skills & Technical Competencies</h3>
            <div className="form-group">
              <label>List skills separated by commas</label>
              <textarea
                name="skills"
                rows="3"
                value={profile.skills}
                onChange={handleChange}
                placeholder="e.g. Java, Spring Boot, MySQL, React, Docker, Python, Git"
              />
            </div>

            <div className="form-actions-bar">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Resume & Quick Overview */}
        <div className="profile-side-col">
          {/* Resume Upload Card */}
          <div className="side-panel-card">
            <h3>
              <FileText size={18} className="text-primary" /> Resume / CV
            </h3>
            <p className="text-muted text-sm">
              Upload your official resume for employers to download during application review.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
            />

            {savedProfile?.resumeFileName ? (
              <div className="saved-resume-box">
                <div className="resume-icon-circle">
                  <FileText size={20} />
                </div>
                <div className="resume-info">
                  <strong>{savedProfile.resumeFileName}</strong>
                  <small>Verified Attached Resume</small>
                </div>
                <div className="resume-actions-group">
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={handleResumeDownload}
                    title="Download resume"
                  >
                    <Download size={14} /> Download
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingResume}
                    title="Replace resume"
                  >
                    <Upload size={14} /> Replace
                  </button>
                </div>
              </div>
            ) : (
              <div className="resume-drop-box" onClick={() => fileInputRef.current?.click()}>
                <Upload size={24} className="upload-icon" />
                <strong>Upload Resume File</strong>
                <small>Supports PDF, DOC, DOCX up to 5 MB</small>
                <button
                  type="button"
                  className="btn btn-outline btn-sm mt-2"
                  disabled={uploadingResume}
                >
                  {uploadingResume ? "Uploading..." : "Select Document"}
                </button>
              </div>
            )}
          </div>

          {/* Quick Snapshot Card */}
          <div className="side-panel-card">
            <h3>Profile Summary</h3>
            <ul className="profile-snapshot-list">
              <li>
                <span>Name:</span> <strong>{user?.name || "Student"}</strong>
              </li>
              <li>
                <span>Email:</span> <strong>{email}</strong>
              </li>
              <li>
                <span>College:</span> <strong>{savedProfile?.college || "Not set"}</strong>
              </li>
              <li>
                <span>Degree:</span> <strong>{savedProfile?.degree || "Not set"}</strong>
              </li>
              <li>
                <span>CGPA:</span> <strong>{savedProfile?.cgpa || "Not set"}</strong>
              </li>
              <li>
                <span>Grad Year:</span> <strong>{savedProfile?.graduationYear || "Not set"}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
