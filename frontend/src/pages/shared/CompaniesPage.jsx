import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { useToast } from "../../components/Toast";
import Modal from "../../components/Modal";
import {
  Building2,
  Search,
  MapPin,
  Globe,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/companies");
      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Could not load companies.");
    } finally {
      setLoading(false);
    }
  };

  const openCompanyJobs = async (company) => {
    setSelectedCompany(company);
    setLoadingJobs(true);
    try {
      const res = await api.get(`/opportunities/company/${company.id}`);
      setCompanyJobs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCompanyJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const filtered = companies.filter((c) => {
    return (
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="module-page companies-page">
      {/* Header */}
      <div className="page-hero-banner">
        <div className="banner-content">
          <span className="eyebrow">Corporate Network</span>
          <h1>Featured Hiring Partners</h1>
          <p>
            Connect with enterprises and high-growth technology companies actively recruiting campus talent.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="search-filter-card">
        <div className="search-input-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by company name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading hiring companies...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state-card">
          <Building2 size={48} className="empty-icon" />
          <h3>No companies match your search</h3>
          <button className="btn btn-outline" onClick={() => setSearch("")}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="companies-cards-grid">
          {filtered.map((company) => (
            <article key={company.id} className="company-card">
              <div className="company-card-header">
                <div className="company-avatar">
                  {company.name ? company.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <h3 className="company-name">{company.name}</h3>
                  <span className="company-industry-tag">
                    {company.industry || "Technology & Services"}
                  </span>
                </div>
              </div>

              <div className="company-meta-row">
                <span className="meta-pill">
                  <MapPin size={13} /> {company.location || "India"}
                </span>
                {company.website && (
                  <a
                    href={
                      company.website.startsWith("http")
                        ? company.website
                        : `https://${company.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="meta-pill meta-link"
                  >
                    <Globe size={13} /> Website <ExternalLink size={11} />
                  </a>
                )}
              </div>

              <p className="company-description">
                {company.description ||
                  "A forward-thinking organization partnering with CareerPilot for talent acquisition and career advancement."}
              </p>

              <div className="company-card-footer">
                <button
                  className="btn btn-outline btn-sm btn-full"
                  onClick={() => openCompanyJobs(company)}
                >
                  <Briefcase size={14} />
                  <span>View Open Positions</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Company Open Jobs Modal */}
      {selectedCompany && (
        <Modal
          isOpen={Boolean(selectedCompany)}
          onClose={() => setSelectedCompany(null)}
          title={`Open Roles at ${selectedCompany.name}`}
          maxWidth="640px"
        >
          <div className="company-jobs-modal">
            <div className="company-summary-strip">
              <div>
                <strong>{selectedCompany.name}</strong>
                <p>
                  {selectedCompany.industry || "Technology"} · {selectedCompany.location}
                </p>
              </div>
              {selectedCompany.website && (
                <a
                  href={
                    selectedCompany.website.startsWith("http")
                      ? selectedCompany.website
                      : `https://${selectedCompany.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Visit Website <ExternalLink size={12} />
                </a>
              )}
            </div>

            {loadingJobs ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Checking job openings...</p>
              </div>
            ) : companyJobs.length === 0 ? (
              <div className="empty-state-card compact">
                <Briefcase size={36} className="empty-icon" />
                <h4>No current job openings</h4>
                <p>
                  {selectedCompany.name} has not posted new vacancies yet. Please check back soon or browse all opportunities.
                </p>
                <Link
                  to="/opportunities"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedCompany(null)}
                >
                  Browse All Jobs
                </Link>
              </div>
            ) : (
              <div className="company-jobs-list">
                {companyJobs.map((job) => (
                  <div key={job.id} className="company-job-item">
                    <div>
                      <h5>{job.title}</h5>
                      <p className="job-sub">
                        {job.location} · {job.type || "Full Time"} · {job.salaryRange || "Open"}
                      </p>
                      {job.requiredSkills && (
                        <small className="job-skills-preview">
                          Skills: {job.requiredSkills}
                        </small>
                      )}
                    </div>
                    <Link
                      to="/opportunities"
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedCompany(null)}
                    >
                      View & Apply <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
