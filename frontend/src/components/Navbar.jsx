import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  Compass,
  Briefcase,
  Building2,
  LayoutDashboard,
  FileCheck,
  User,
  Award,
  PlusCircle,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Building
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications for student
  useEffect(() => {
    if (user?.role === "STUDENT" && user?.email) {
      api.get(`/students/${encodeURIComponent(user.email)}/notifications`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setNotifications(res.data);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Brand */}
        <Link to="/" className="brand-wrap">
          <div className="brand-logo-icon">
            <Compass size={24} className="brand-icon-svg" />
          </div>
          <div className="brand-text">
            <span className="brand">CareerPilot</span>
            <span className="brand-tag">Placement & Careers</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/opportunities" className={`nav-link ${isActive("/opportunities") ? "active" : ""}`}>
            <Briefcase size={16} />
            <span>Opportunities</span>
          </Link>
          <Link to="/companies" className={`nav-link ${isActive("/companies") ? "active" : ""}`}>
            <Building2 size={16} />
            <span>Companies</span>
          </Link>

          {/* Student Links */}
          {user?.role === "STUDENT" && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link to="/my-applications" className={`nav-link ${isActive("/my-applications") ? "active" : ""}`}>
                <FileCheck size={16} />
                <span>My Applications</span>
              </Link>
              <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
                <User size={16} />
                <span>Profile & CV</span>
              </Link>
              <Link to="/credentials" className={`nav-link ${isActive("/credentials") ? "active" : ""}`}>
                <Award size={16} />
                <span>Credentials</span>
              </Link>
            </>
          )}

          {/* Company Links */}
          {user?.role === "COMPANY" && (
            <>
              <Link to="/company-dashboard" className={`nav-link ${isActive("/company-dashboard") ? "active" : ""}`}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link to="/post-job" className={`nav-link ${isActive("/post-job") ? "active" : ""}`}>
                <PlusCircle size={16} />
                <span>Post Job</span>
              </Link>
              <Link to="/manage-jobs" className={`nav-link ${isActive("/manage-jobs") ? "active" : ""}`}>
                <Briefcase size={16} />
                <span>My Postings</span>
              </Link>
              <Link to="/company-profile" className={`nav-link ${isActive("/company-profile") ? "active" : ""}`}>
                <Building size={16} />
                <span>Profile</span>
              </Link>
            </>
          )}

          {/* Admin Links */}
          {user?.role === "ADMIN" && (
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
              <ShieldCheck size={16} />
              <span>Admin Hub</span>
            </Link>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="nav-actions">
          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          ) : (
            <div className="user-area">
              {/* Notifications for student */}
              {user.role === "STUDENT" && (
                <div className="notif-wrapper" ref={notifRef}>
                  <button
                    className="notif-btn"
                    onClick={() => setNotificationsOpen((prev) => !prev)}
                    aria-label="View notifications"
                  >
                    <Bell size={18} />
                    {notifications.length > 0 && (
                      <span className="notif-badge">{notifications.length}</span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <h4>Notifications</h4>
                        <span className="badge badge-subtle">{notifications.length} updates</span>
                      </div>
                      <div className="notif-list">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n.id} className="notif-item">
                              <span className="notif-type-tag">{n.type}</span>
                              <p className="notif-text">{n.message}</p>
                              {n.createdAt && (
                                <small className="notif-time">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </small>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="notif-empty">No new notifications</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Dropdown */}
              <div className="profile-dropdown-wrapper" ref={dropdownRef}>
                <button
                  className="profile-chip"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                >
                  <div className="avatar-circle">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="user-info-text">
                    <span className="user-name">{user.name || user.email}</span>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown size={14} className="dropdown-caret" />
                </button>

                {userDropdownOpen && (
                  <div className="profile-menu">
                    <div className="menu-header">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                    <div className="menu-divider" />
                    {user.role === "STUDENT" && (
                      <Link to="/profile" className="menu-item" onClick={() => setUserDropdownOpen(false)}>
                        <User size={16} /> My Profile
                      </Link>
                    )}
                    {user.role === "COMPANY" && (
                      <Link to="/company-profile" className="menu-item" onClick={() => setUserDropdownOpen(false)}>
                        <Building size={16} /> Company Profile
                      </Link>
                    )}
                    {user.role === "ADMIN" && (
                      <Link to="/admin" className="menu-item" onClick={() => setUserDropdownOpen(false)}>
                        <ShieldCheck size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button className="menu-item menu-item-danger" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/opportunities" onClick={() => setMobileMenuOpen(false)}>Opportunities</Link>
          <Link to="/companies" onClick={() => setMobileMenuOpen(false)}>Companies</Link>
          {user?.role === "STUDENT" && (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Student Dashboard</Link>
              <Link to="/my-applications" onClick={() => setMobileMenuOpen(false)}>My Applications</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile & CV</Link>
              <Link to="/credentials" onClick={() => setMobileMenuOpen(false)}>Credentials</Link>
            </>
          )}
          {user?.role === "COMPANY" && (
            <>
              <Link to="/company-dashboard" onClick={() => setMobileMenuOpen(false)}>Company Dashboard</Link>
              <Link to="/post-job" onClick={() => setMobileMenuOpen(false)}>Post Job</Link>
              <Link to="/manage-jobs" onClick={() => setMobileMenuOpen(false)}>My Postings</Link>
              <Link to="/company-profile" onClick={() => setMobileMenuOpen(false)}>Company Profile</Link>
            </>
          )}
          {user?.role === "ADMIN" && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
          )}
          {!user ? (
            <div className="mobile-auth-links">
              <Link to="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          ) : (
            <button className="btn btn-danger btn-full" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
