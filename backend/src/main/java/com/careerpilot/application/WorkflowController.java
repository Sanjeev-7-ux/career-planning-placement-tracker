package com.careerpilot.application;

import com.careerpilot.auth.User;
import com.careerpilot.auth.UserRepository;
import com.careerpilot.auth.UserRole;
import com.careerpilot.company.Company;
import com.careerpilot.company.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@RestController
public class WorkflowController {
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final JobApplicationRepository applications;
    private final CompanyRepository companies;
    private final UserRepository users;

    public WorkflowController(InterviewRepository interviewRepository,
                              OfferRepository offerRepository,
                              JobApplicationRepository applications,
                              CompanyRepository companies,
                              UserRepository users) {
        this.interviewRepository = interviewRepository;
        this.offerRepository = offerRepository;
        this.applications = applications;
        this.companies = companies;
        this.users = users;
    }

    @GetMapping("/api/interviews/student/{email}")
    public List<Interview> interviewsForStudent(@PathVariable String email, Authentication authentication) {
        String studentEmail = requireStudentOrAdmin(email, authentication);
        return interviewRepository.findByStudentEmail(studentEmail);
    }

    @PostMapping("/api/interviews")
    public Interview createInterview(@RequestBody Interview request, Authentication authentication) {
        Company company = requireCompanyForWorkflow(request.getCompanyName(), authentication);
        String studentEmail = validateApplicant(request.getStudentEmail(), request.getRole(), company);
        Interview interview = new Interview();
        interview.setStudentEmail(studentEmail);
        interview.setCompanyName(company.getName());
        interview.setRole(request.getRole().trim());
        interview.setRound(request.getRound());
        interview.setInterviewDateTime(request.getInterviewDateTime());
        interview.setMode(request.getMode());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setStatus("SCHEDULED");
        return interviewRepository.save(interview);
    }

    @GetMapping("/api/offers/student/{email}")
    public List<Offer> offersForStudent(@PathVariable String email, Authentication authentication) {
        String studentEmail = requireStudentOrAdmin(email, authentication);
        return offerRepository.findByStudentEmail(studentEmail);
    }

    @PostMapping("/api/offers")
    public Offer createOffer(@RequestBody Offer request, Authentication authentication) {
        Company company = requireCompanyForWorkflow(request.getCompanyName(), authentication);
        String studentEmail = validateApplicant(request.getStudentEmail(), request.getRole(), company);
        Offer offer = new Offer();
        offer.setStudentEmail(studentEmail);
        offer.setCompanyName(company.getName());
        offer.setRole(request.getRole().trim());
        offer.setSalary(request.getSalary());
        offer.setLocation(request.getLocation());
        offer.setOfferDate(request.getOfferDate());
        offer.setJoiningDate(request.getJoiningDate());
        offer.setStatus("OFFERED");
        return offerRepository.save(offer);
    }

    @GetMapping("/api/health")
    public String health() {
        return "CareerPilot API is running";
    }

    private String requireStudentOrAdmin(String email, Authentication authentication) {
        User user = currentUser(authentication);
        String normalizedEmail = normalizeEmail(email);
        if (user.getRole() != UserRole.ADMIN
                && (user.getRole() != UserRole.STUDENT || !user.getEmail().equals(normalizedEmail))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own workflow details.");
        }
        return normalizedEmail;
    }

    private Company requireCompanyForWorkflow(String companyName, Authentication authentication) {
        User user = currentUser(authentication);
        if (user.getRole() != UserRole.COMPANY && user.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only company accounts can create workflow records.");
        }
        if (companyName == null || companyName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A company name is required.");
        }
        Company company = companies.findFirstByNameIgnoreCaseOrderByIdAsc(companyName.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found."));
        boolean ownsCompany = user.getRole() == UserRole.ADMIN
                || user.getEmail().equalsIgnoreCase(company.getEmail())
                || (company.getEmail() == null && user.getName().equalsIgnoreCase(company.getName()));
        if (!ownsCompany) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only create workflow records for your company.");
        }
        return company;
    }

    private String validateApplicant(String email, String role, Company company) {
        if (email == null || email.isBlank() || role == null || role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A student email and job role are required.");
        }
        String studentEmail = normalizeEmail(email);
        User student = users.findByEmail(studentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student account not found."));
        if (student.getRole() != UserRole.STUDENT
                || !applications.existsByStudentEmailIgnoreCaseAndRoleIgnoreCaseAndOpportunityCompanyId(
                        studentEmail, role.trim(), company.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The student must have applied to this company's role before an interview or offer can be created.");
        }
        return studentEmail;
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue.");
        }
        return users.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found."));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A student email is required.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
