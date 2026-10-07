package com.careerpilot.application;

import com.careerpilot.auth.User;
import com.careerpilot.auth.UserRepository;
import com.careerpilot.company.Company;
import com.careerpilot.company.CompanyRepository;
import com.careerpilot.opportunity.Opportunity;
import com.careerpilot.opportunity.OpportunityRepository;
import com.careerpilot.student.StudentProfile;
import com.careerpilot.student.StudentProfileRepository;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final JobApplicationRepository applications;
    private final OpportunityRepository opportunities;
    private final StudentProfileRepository studentProfiles;
    private final CompanyRepository companies;
    private final UserRepository users;

    public ApplicationController(JobApplicationRepository applications,
                                  OpportunityRepository opportunities,
                                  StudentProfileRepository studentProfiles,
                                  CompanyRepository companies,
                                  UserRepository users) {
        this.applications = applications;
        this.opportunities = opportunities;
        this.studentProfiles = studentProfiles;
        this.companies = companies;
        this.users = users;
    }

    @GetMapping
    public List<ApplicationView> all(Authentication authentication) {
        requireRole(authentication, "ROLE_ADMIN");
        return applications.findAll().stream().map(this::toApplicationView).toList();
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> applicationResume(@PathVariable Long id, Authentication authentication) {
        JobApplication application = applications.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        Opportunity opportunity = application.getOpportunity();
        if (opportunity == null || opportunity.getCompany() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application is not linked to a company.");
        }
        requireCompanyAccess(opportunity.getCompany(), authentication);

        StudentProfile profile = studentProfiles.findByUserEmail(application.getStudentEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found."));
        if (profile.getResumeFileData() == null || profile.getResumeFileName() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No uploaded resume was found.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename(profile.getResumeFileName()).build());
        headers.setCacheControl("no-store");
        return new ResponseEntity<>(profile.getResumeFileData(), headers, HttpStatus.OK);
    }

    public record ApplyRequest(String studentEmail) {}

    @PostMapping("/{opportunityId}")
    public JobApplication apply(@PathVariable Long opportunityId,
                                @RequestBody ApplyRequest request,
                                Authentication authentication) {
        requireRole(authentication, "ROLE_STUDENT");
        Opportunity opportunity = opportunities.findById(opportunityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found."));
        LocalDate deadline = opportunity.getApplicationDeadline();
        if (!"OPEN".equalsIgnoreCase(opportunity.getStatus())
                || (deadline != null && deadline.isBefore(LocalDate.now()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This opportunity is not open for applications.");
        }
        JobApplication app = new JobApplication();
        app.setStudentEmail(authentication.getName());
        app.setOpportunity(opportunity);
        app.setCompanyName(opportunity.getCompany() != null ? opportunity.getCompany().getName() : "");
        app.setRole(opportunity.getTitle());
        try {
            return applications.saveAndFlush(app);
        } catch (org.springframework.dao.DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied to this opportunity.");
        }
    }

    @GetMapping("/student/{email}")
    public List<ApplicationView> mine(@PathVariable String email, Authentication authentication) {
        if (authentication == null || !email.equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own applications.");
        }
        return applications.findByStudentEmail(email).stream().map(this::toApplicationView).toList();
    }

    @GetMapping("/company/{companyId}")
    public List<ApplicationView> companyApplications(@PathVariable Long companyId, Authentication authentication) {
        Company company = companies.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found."));
        requireCompanyAccess(company, authentication);
        return opportunities.findByCompanyId(companyId).stream()
                .flatMap(op -> applications.findByOpportunityId(op.getId()).stream())
                .map(this::toApplicationView)
                .toList();
    }

    @PutMapping("/{id}/status")
    public JobApplication updateStatus(@PathVariable Long id,
                                       @RequestBody StatusRequest request,
                                       Authentication authentication) {
        JobApplication app = applications.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        if (app.getOpportunity() == null || app.getOpportunity().getCompany() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application is not linked to a company.");
        }
        requireCompanyAccess(app.getOpportunity().getCompany(), authentication);
        if (!List.of("APPROVED", "SHORTLISTED", "REJECTED", "INTERVIEW", "SELECTED", "OFFERED")
                .contains(request.status() == null ? "" : request.status().trim().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid application status.");
        }
        app.setStatus(request.status().trim().toUpperCase());
        return applications.save(app);
    }

    public record StatusRequest(String status) {}

    private void requireRole(Authentication authentication, String role) {
        if (authentication == null || authentication.getAuthorities().stream()
                .noneMatch(authority -> role.equals(authority.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to perform this action.");
        }
    }

    private void requireCompanyAccess(Company company, Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue.");
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (isAdmin) return;

        User user = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found."));
        if (!user.getEmail().equalsIgnoreCase(company.getEmail())
                && (company.getEmail() != null || !user.getName().equalsIgnoreCase(company.getName()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage applications for your company.");
        }
    }

    private ApplicationView toApplicationView(JobApplication application) {
        StudentProfile profile = studentProfiles.findByUserEmail(application.getStudentEmail()).orElse(null);
        StudentProfileView student = profile == null ? null : new StudentProfileView(
                profile.getUser().getName(),
                application.getStudentEmail(),
                profile.getPhone(),
                profile.getLocation(),
                profile.getDegree(),
                profile.getCollege(),
                profile.getDepartment(),
                profile.getGraduationYear(),
                profile.getCgpa(),
                profile.getSkills(),
                profile.getResumeFileName(),
                profile.getResumeUrl(),
                profile.getLinkedinUrl(),
                profile.getGithubUrl(),
                profile.getPortfolioUrl()
        );
        Opportunity opportunity = application.getOpportunity();
        return new ApplicationView(
                application.getId(),
                application.getStudentEmail(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getCompanyName(),
                application.getRole(),
                opportunity == null ? null : opportunity.getId(),
                opportunity == null || opportunity.getCompany() == null ? null : opportunity.getCompany().getId(),
                student
        );
    }

    public record ApplicationView(Long id,
                                  String studentEmail,
                                  String status,
                                  LocalDateTime appliedAt,
                                  String companyName,
                                  String role,
                                  Long opportunityId,
                                  Long companyId,
                                  StudentProfileView studentProfile) {}

    public record StudentProfileView(String name,
                                     String email,
                                     String phone,
                                     String location,
                                     String degree,
                                     String college,
                                     String department,
                                     Integer graduationYear,
                                     Double cgpa,
                                     String skills,
                                     String resumeFileName,
                                     String resumeUrl,
                                     String linkedinUrl,
                                     String githubUrl,
                                     String portfolioUrl) {}
}
