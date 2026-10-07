import React from "react";
import { Link } from "react-router-dom";
import { Compass, Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <Compass size={24} className="brand-icon-svg" />
            <span>CareerPilot</span>
          </div>
          <p className="footer-desc">
            Empowering students, companies, and placement teams with a unified, transparent career ecosystem.
          </p>
          <div className="footer-contact-items">
            <a href="mailto:careerpilot@gmail.com" className="footer-contact-item">
              <Mail size={15} /> careerpilot@gmail.com
            </a>
            <a href="tel:9922012145" className="footer-contact-item">
              <Phone size={15} /> +91 99220 12145
            </a>
            <span className="footer-contact-item">
              <MapPin size={15} /> Chennai, India
            </span>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Platform</h4>
          <Link to="/opportunities">Explore Jobs</Link>
          <Link to="/companies">Featured Companies</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/login">Sign In</Link>
        </div>

        <div className="footer-links-col">
          <h4>For Candidates</h4>
          <Link to="/profile">Resume & Profile</Link>
          <Link to="/credentials">Certificates & Experience</Link>
          <Link to="/my-applications">Application Tracker</Link>
          <Link to="/dashboard">Student Dashboard</Link>
        </div>

        <div className="footer-links-col">
          <h4>For Recruiters</h4>
          <Link to="/post-job">Post Opening</Link>
          <Link to="/company-dashboard">Applicant Pipeline</Link>
          <Link to="/manage-jobs">Job Management</Link>
          <Link to="/company-profile">Company Profile</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CareerPilot Platform. All rights reserved.</p>
        <p className="footer-made-with">
          Built for seamless placement & campus recruitment.
        </p>
      </div>
    </footer>
  );
}
