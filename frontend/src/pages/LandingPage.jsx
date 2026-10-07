import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  Briefcase,
  Users,
  Building2,
  Award,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Calendar,
  Layers
} from "lucide-react";
import careerIllustration from "../assets/career-journey.svg";
import teamIllustration from "../assets/team-collaboration.svg";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    students: 0,
  });

  useEffect(() => {
    // Fetch live counts
    Promise.all([
      api.get("/opportunities").catch(() => ({ data: [] })),
      api.get("/companies").catch(() => ({ data: [] })),
    ]).then(([jobsRes, compRes]) => {
      setStats({
        jobs: Array.isArray(jobsRes.data) ? jobsRes.data.length : 0,
        companies: Array.isArray(compRes.data) ? compRes.data.length : 0,
        students: 250, // Active candidates
      });
    });
  }, []);

  const handleCta = () => {
    if (!user) {
      navigate("/register");
    } else if (user.role === "STUDENT") {
      navigate("/dashboard");
    } else if (user.role === "COMPANY") {
      navigate("/company-dashboard");
    } else if (user.role === "ADMIN") {
      navigate("/admin");
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Next-Generation Campus & Career Platform</span>
          </div>
          <h1 className="hero-headline">
            Launch Your Career With <span className="gradient-text">Precision & Confidence</span>
          </h1>
          <p className="hero-subtitle">
            CareerPilot bridges high-achieving students, top-tier employers, and campus recruitment officers
            into one dynamic, real-time placement workflow.
          </p>

          <div className="hero-cta-group">
            <button className="btn btn-primary btn-lg" onClick={handleCta}>
              <span>{user ? "Go to Dashboard" : "Get Started Now"}</span>
              <ArrowRight size={18} />
            </button>
            <Link to="/opportunities" className="btn btn-outline btn-lg">
              <Briefcase size={18} />
              <span>Browse Openings</span>
            </Link>
          </div>

          <div className="hero-stat-ribbon">
            <div className="ribbon-item">
              <span className="ribbon-number">{stats.jobs || "20+"}</span>
              <span className="ribbon-label">Active Opportunities</span>
            </div>
            <div className="ribbon-divider" />
            <div className="ribbon-item">
              <span className="ribbon-number">{stats.companies || "10+"}</span>
              <span className="ribbon-label">Hiring Partners</span>
            </div>
            <div className="ribbon-divider" />
            <div className="ribbon-item">
              <span className="ribbon-number">98%</span>
              <span className="ribbon-label">Application Visibility</span>
            </div>
          </div>
        </div>

        <div className="hero-media">
          <div className="art-card-backdrop">
            <img src={careerIllustration} alt="Career Planning Journey" className="hero-art" />
            <div className="floating-card top-float">
              <FileCheck2 size={20} className="float-icon green" />
              <div>
                <strong>Interview Scheduled</strong>
                <small>Technical Round · ABC Tech</small>
              </div>
            </div>
            <div className="floating-card bottom-float">
              <TrendingUp size={20} className="float-icon blue" />
              <div>
                <strong>Career Readiness</strong>
                <small>Top 10% on Platform</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Ecosystem Section */}
      <section className="section ecosystem-section">
        <div className="section-header text-center">
          <p className="eyebrow">Designed for the Entire Ecosystem</p>
          <h2>One Unified Hub for Every Stakeholder</h2>
          <p className="section-subtext">
            From smart profile building to live interview scheduling and verified offers, CareerPilot coordinates every phase of placement.
          </p>
        </div>

        <div className="cards-grid role-cards-grid">
          {/* Student Card */}
          <div className="feature-card">
            <div className="card-icon-bubble student-bubble">
              <Users size={24} />
            </div>
            <h3>For Ambitious Students</h3>
            <p>Craft a recruiter-ready profile with verified certifications, project portfolios, and direct one-click job applications.</p>
            <ul className="feature-checklist">
              <li><CheckCircle size={15} /> Resume file upload & parsing</li>
              <li><CheckCircle size={15} /> Live application stage tracker</li>
              <li><CheckCircle size={15} /> Interview calendar & offer letters</li>
            </ul>
            <Link to="/opportunities" className="card-link">Explore Opportunities &rarr;</Link>
          </div>

          {/* Company Card */}
          <div className="feature-card">
            <div className="card-icon-bubble company-bubble">
              <Building2 size={24} />
            </div>
            <h3>For Hiring Employers</h3>
            <p>Post open roles, review candidates with standardized academic criteria, schedule interviews, and issue formal offers directly.</p>
            <ul className="feature-checklist">
              <li><CheckCircle size={15} /> Targeted campus candidate search</li>
              <li><CheckCircle size={15} /> Built-in interview scheduling</li>
              <li><CheckCircle size={15} /> Instant offer letter generation</li>
            </ul>
            <Link to="/post-job" className="card-link">Post an Opening &rarr;</Link>
          </div>

          {/* Admin Card */}
          <div className="feature-card">
            <div className="card-icon-bubble admin-bubble">
              <Layers size={24} />
            </div>
            <h3>For Placement Teams</h3>
            <p>Comprehensive oversight of institutional placement health, corporate relationships, candidate pipelines, and offers.</p>
            <ul className="feature-checklist">
              <li><CheckCircle size={15} /> Platform-wide placement analytics</li>
              <li><CheckCircle size={15} /> Student application audits</li>
              <li><CheckCircle size={15} /> Company partner verification</li>
            </ul>
            <Link to="/login" className="card-link">Placement Officers Portal &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Workflow Showcase */}
      <section className="section workflow-section">
        <div className="workflow-grid">
          <div className="workflow-art-col">
            <img src={teamIllustration} alt="Team recruitment workflow" className="workflow-img" />
          </div>
          <div className="workflow-copy-col">
            <p className="eyebrow">Seamless Pipeline</p>
            <h2>Turn Applications into Offers Faster</h2>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-num">01</div>
                <div>
                  <h4>Build & Verify Your Profile</h4>
                  <p>Input your academic credentials, GPA, certifications, and upload your PDF resume.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">02</div>
                <div>
                  <h4>Discover & Apply in 1-Click</h4>
                  <p>Browse open software engineering, data science, and consulting positions with transparent salary bands.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">03</div>
                <div>
                  <h4>Interview & Accept Offers</h4>
                  <p>Receive scheduled interview slots, online meeting links, and formal offers directly on your dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready Banner */}
      <section className="cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to elevate your placement experience?</h2>
          <p>Join students and employers already accelerating their career trajectories with CareerPilot.</p>
          <div className="cta-buttons">
            <button className="btn btn-light btn-lg" onClick={() => navigate("/register")}>
              Create Free Account
            </button>
            <button className="btn btn-outline-white btn-lg" onClick={() => navigate("/login")}>
              Sign In to Your Workspace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
