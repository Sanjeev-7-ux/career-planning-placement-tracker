import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import {
  Compass,
  Mail,
  Lock,
  User,
  Building2,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from "lucide-react";

export default function AuthPage({ defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(defaultMode);
    setError("");
  }, [defaultMode]);

  useEffect(() => {
    if (searchParams.get("expired")) {
      setError("Your session has expired. Please sign in again.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const autofillDemo = (role) => {
    if (role === "STUDENT") {
      setForm({ name: "Sanjeev Kumar", email: "student@careerpilot.com", password: "password123", role: "STUDENT" });
      setMode("login");
    } else if (role === "COMPANY") {
      setForm({ name: "ABC Technologies", email: "company@careerpilot.com", password: "password123", role: "COMPANY" });
      setMode("login");
    } else if (role === "ADMIN") {
      setForm({ name: "Platform Admin", email: "admin@careerpilot.com", password: "password123", role: "ADMIN" });
      setMode("login");
    }
    toast.info(`Filled ${role.toLowerCase()} demo credentials`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      const res = await login(form.email, form.password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name || "User"}!`);
        if (res.user.role === "ADMIN") navigate("/admin");
        else if (res.user.role === "COMPANY") navigate("/company-dashboard");
        else navigate("/dashboard");
      } else {
        setError(res.error);
        toast.error(res.error);
      }
    } else {
      const res = await register(form);
      if (res.success) {
        toast.success("Account created successfully!");
        if (res.user.role === "COMPANY") navigate("/company-profile");
        else navigate("/profile");
      } else {
        setError(res.error);
        toast.error(res.error);
      }
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-card-header">
          <div className="auth-brand-icon">
            <Compass size={28} />
          </div>
          <h2>{mode === "login" ? "Welcome Back" : "Join CareerPilot"}</h2>
          <p className="auth-card-subtitle">
            {mode === "login"
              ? "Sign in to access your placement dashboard and opportunities."
              : "Create an account to start your campus recruitment journey."}
          </p>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="demo-credentials-box">
          <div className="demo-credentials-header">
            <Sparkles size={14} />
            <span>Fast Demo Logins (Click to autofill):</span>
          </div>
          <div className="demo-chips-row">
            <button
              type="button"
              className="demo-chip"
              onClick={() => autofillDemo("STUDENT")}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => autofillDemo("COMPANY")}
            >
              🏢 Company
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => autofillDemo("ADMIN")}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              navigate("/login");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              navigate("/register");
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name or Organization</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Sanjeev Kumar"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                id="auth-password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                minLength={mode === "register" ? 8 : undefined}
                required
              />
            </div>
            {mode === "register" && (
              <small className="field-help">Minimum 8 characters required</small>
            )}
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label>Account Role</label>
              <div className="role-selector-grid">
                <label className={`role-radio-card ${form.role === "STUDENT" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="STUDENT"
                    checked={form.role === "STUDENT"}
                    onChange={handleChange}
                  />
                  <GraduationCap size={20} />
                  <div>
                    <strong>Student</strong>
                    <small>Seeking Jobs & Internships</small>
                  </div>
                </label>

                <label className={`role-radio-card ${form.role === "COMPANY" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="COMPANY"
                    checked={form.role === "COMPANY"}
                    onChange={handleChange}
                  />
                  <Building2 size={20} />
                  <div>
                    <strong>Company</strong>
                    <small>Recruiting & Posting Roles</small>
                  </div>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="auth-error-alert" role="alert">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            <span>{loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer">
          {mode === "login" ? (
            <p>
              Don't have an account yet?{" "}
              <Link to="/register" onClick={() => setMode("register")}>
                Create an account
              </Link>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <Link to="/login" onClick={() => setMode("login")}>
                Sign In instead
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
