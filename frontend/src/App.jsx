import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OpportunitiesPage from "./pages/shared/OpportunitiesPage";
import CompaniesPage from "./pages/shared/CompaniesPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import CredentialsPage from "./pages/student/CredentialsPage";
import MyApplicationsPage from "./pages/student/MyApplicationsPage";

// Company Pages
import CompanyDashboardPage from "./pages/company/CompanyDashboardPage";
import CompanyProfilePage from "./pages/company/CompanyProfilePage";
import PostJobPage from "./pages/company/PostJobPage";
import ManageJobsPage from "./pages/company/ManageJobsPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

// Role-based route guard
function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content-area">
        <Routes>
          {/* Public & Shared Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage defaultMode="login" />} />
          <Route path="/register" element={<AuthPage defaultMode="register" />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/companies" element={<CompaniesPage />} />

          {/* Student Dedicated Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireRole roles={["STUDENT"]}>
                <StudentDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireRole roles={["STUDENT"]}>
                <StudentProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="/credentials"
            element={
              <RequireRole roles={["STUDENT"]}>
                <CredentialsPage />
              </RequireRole>
            }
          />
          <Route
            path="/my-applications"
            element={
              <RequireRole roles={["STUDENT"]}>
                <MyApplicationsPage />
              </RequireRole>
            }
          />
          {/* Compatibility redirects for older bookmarks */}
          <Route path="/certifications" element={<Navigate to="/credentials" replace />} />
          <Route path="/internships" element={<Navigate to="/credentials" replace />} />

          {/* Company Dedicated Routes */}
          <Route
            path="/company-dashboard"
            element={
              <RequireRole roles={["COMPANY"]}>
                <CompanyDashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/company-profile"
            element={
              <RequireRole roles={["COMPANY"]}>
                <CompanyProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="/post-job"
            element={
              <RequireRole roles={["COMPANY", "ADMIN"]}>
                <PostJobPage />
              </RequireRole>
            }
          />
          <Route
            path="/manage-jobs"
            element={
              <RequireRole roles={["COMPANY", "ADMIN"]}>
                <ManageJobsPage />
              </RequireRole>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireRole roles={["ADMIN"]}>
                <AdminDashboardPage />
              </RequireRole>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
