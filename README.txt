CAREERPILOT — CAREER AND PLACEMENT PLATFORM

This project includes student and company accounts, company profiles, job opportunities and applications, student profiles, certifications, internships, and an admin dashboard. It uses a React/Vite frontend and a Spring Boot REST API with JWT authentication and role-based authorization.

REQUIREMENTS
- Java 17+
- Maven 3.8+
- Node.js LTS

DATABASE
The default local database is a file-backed H2 database at backend/data/careerpilot. Accounts and app data persist between backend restarts; keep this folder to retain them. Passwords are BCrypt-hashed.

The database and local settings can be overridden with DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD, JPA_DDL_AUTO, H2_CONSOLE_ENABLED, CAREERPILOT_JWT_SECRET, and CAREERPILOT_CORS_ALLOWED_ORIGIN. Before deployment, configure a strong unique CAREERPILOT_JWT_SECRET, use a production database, disable the H2 console, and set an appropriate JPA_DDL_AUTO policy.
Set VITE_API_BASE_URL in the frontend environment when the API is hosted somewhere other than http://localhost:8080/api.

RUN THE BACKEND
From the repository root:
  cd backend
  mvn spring-boot:run

The API runs at http://localhost:8080.

RUN THE FRONTEND
In another terminal:
  cd frontend
  npm install
  npm run dev

Open the Vite URL shown in the terminal (normally http://localhost:5173).

LOCAL ACCOUNTS AND SAMPLE DATA
On a fresh local database, the backend seeds Student, Company, and Admin sample accounts. The local development password is password123. Public registration supports Student and Company roles; it does not allow users to register as Admin. Use seeded passwords only for local development.

The backend seeds example companies and open opportunities into the database. Both the dashboard and opportunities page read the same persisted opportunity list, so cards correspond to real application records.

AUTHENTICATION AND API ACCESS
- Public: GET /api/health, GET /api/companies, GET /api/opportunities
- Student: own profile, certifications and internships; POST /api/applications/{opportunityId}; GET /api/applications/student/{email}
- Company: own company profile and jobs; GET /api/applications/company/{companyId}; update statuses for own applicants
- Admin: GET /api/admin/summary and GET /api/applications

Application ownership is derived from the authenticated account, not from a student email supplied in the request body. Restart the backend after changing Java code.
