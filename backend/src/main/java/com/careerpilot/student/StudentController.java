package com.careerpilot.student;

import com.careerpilot.application.JobApplication;
import com.careerpilot.application.JobApplicationRepository;
import com.careerpilot.auth.User;
import com.careerpilot.auth.UserRepository;
import com.careerpilot.company.Company;
import com.careerpilot.company.CompanyRepository;
import com.careerpilot.opportunity.Opportunity;
import com.careerpilot.opportunity.OpportunityRepository;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Locale;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StudentController {
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final NotificationRepository notificationRepository;
    private final CertificationRepository certificationRepository;
    private final InternshipRepository internshipRepository;
    private final OpportunityRepository opportunityRepository;
    private final CompanyRepository companyRepository;

    public StudentController(StudentProfileRepository studentProfileRepository,
                            UserRepository userRepository,
                            JobApplicationRepository jobApplicationRepository,
                            NotificationRepository notificationRepository,
                            CertificationRepository certificationRepository,
                            InternshipRepository internshipRepository,
                            OpportunityRepository opportunityRepository,
                            CompanyRepository companyRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.notificationRepository = notificationRepository;
        this.certificationRepository = certificationRepository;
        this.internshipRepository = internshipRepository;
        this.opportunityRepository = opportunityRepository;
        this.companyRepository = companyRepository;
    }

    @GetMapping("/students/{email}/profile")
    public StudentProfile profile(@PathVariable String email, Authentication authentication) {
        requireOwnProfile(email, authentication);
        return studentProfileRepository.findByUserEmail(email)
                .orElseGet(() -> createDefaultProfile(email));
    }

    @PutMapping("/students/{email}/profile")
    public StudentProfile updateProfile(@PathVariable String email,
                                         @RequestBody StudentProfile payload,
                                         Authentication authentication) {
        requireOwnProfile(email, authentication);
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseGet(() -> createDefaultProfile(email));
        User user = userRepository.findByEmail(email).orElseThrow();
        profile.setUser(user);
        profile.setPhone(payload.getPhone());
        if (payload.getDateOfBirth() != null) {
            profile.setDateOfBirth(payload.getDateOfBirth());
        }
        profile.setLocation(payload.getLocation());
        profile.setDegree(payload.getDegree());
        profile.setCollege(payload.getCollege());
        profile.setDepartment(payload.getDepartment());
        profile.setGraduationYear(payload.getGraduationYear());
        profile.setCgpa(payload.getCgpa());
        profile.setSkills(payload.getSkills());
        profile.setResumeUrl(payload.getResumeUrl());
        profile.setLinkedinUrl(payload.getLinkedinUrl());
        profile.setGithubUrl(payload.getGithubUrl());
        profile.setPortfolioUrl(payload.getPortfolioUrl());
        return studentProfileRepository.save(profile);
    }

    @DeleteMapping("/students/{email}/profile/fields/{field}")
    public ResponseEntity<Void> deleteProfileField(@PathVariable String email,
                                                   @PathVariable String field,
                                                   Authentication authentication) {
        requireOwnProfile(email, authentication);
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found."));

        switch (field) {
            case "phone" -> profile.setPhone(null);
            case "location" -> profile.setLocation(null);
            case "degree" -> profile.setDegree(null);
            case "college" -> profile.setCollege(null);
            case "department" -> profile.setDepartment(null);
            case "graduationYear" -> profile.setGraduationYear(null);
            case "cgpa" -> profile.setCgpa(null);
            case "linkedinUrl" -> profile.setLinkedinUrl(null);
            case "githubUrl" -> profile.setGithubUrl(null);
            case "portfolioUrl" -> profile.setPortfolioUrl(null);
            case "resumeUrl" -> profile.setResumeUrl(null);
            case "resumeFileName" -> {
                profile.setResumeFileName(null);
                profile.setResumeFileData(null);
                profile.setResumeUrl(null);
            }
            case "skills" -> profile.setSkills(null);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown profile field.");
        }

        studentProfileRepository.save(profile);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/students/{email}/profile/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadResume(@PathVariable String email,
                                           @RequestParam("file") MultipartFile file,
                                           Authentication authentication) throws IOException {
        requireOwnProfile(email, authentication);
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a resume file to upload.");
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Resume files must be 5 MB or smaller.");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalName);
        if (extension == null || !List.of("pdf", "doc", "docx").contains(extension.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload a PDF, DOC, or DOCX resume.");
        }
        if (originalName.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The resume filename is invalid.");
        }

        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseGet(() -> createDefaultProfile(email));
        profile.setResumeFileName(originalName);
        profile.setResumeFileData(file.getBytes());
        profile.setResumeUrl(null);
        studentProfileRepository.save(profile);
        return Map.of("resumeFileName", originalName);
    }

    @GetMapping("/students/{email}/profile/resume")
    public ResponseEntity<byte[]> downloadResume(@PathVariable String email, Authentication authentication) {
        requireOwnProfile(email, authentication);
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
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

    private void requireOwnProfile(String email, Authentication authentication) {
        if (authentication == null || !email.equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own profile.");
        }
    }

    @GetMapping("/students/{email}/dashboard")
    public DashboardResponse dashboard(@PathVariable String email, Authentication authentication) {
        requireOwnProfile(email, authentication);
        User user = userRepository.findByEmail(email).orElseThrow();
        List<JobApplication> applications = jobApplicationRepository.findByStudentEmail(email);
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        List<Certification> certifications = certificationRepository.findByStudentEmail(email);
        List<Internship> internships = internshipRepository.findByStudentEmail(email);
        StudentProfile profile = studentProfileRepository.findByUserEmail(email).orElseGet(() -> createDefaultProfile(email));

        double readiness = computeCareerReadiness(profile, applications, certifications, internships);

        return new DashboardResponse(
                user.getName(),
                opportunityRepository.findAll().size(),
                applications.size(),
                applications.stream().filter(app -> "INTERVIEW".equalsIgnoreCase(app.getStatus())).count(),
                certifications.size(),
                applications.stream().filter(app -> "SELECTED".equalsIgnoreCase(app.getStatus()) || "OFFERED".equalsIgnoreCase(app.getStatus())).count(),
                readiness,
                notifications,
                opportunityRepository.findAll().stream().limit(6).toList(),
                companyRepository.findAll().stream().limit(4).toList()
        );
    }

    @GetMapping("/students/{email}/notifications")
    public List<Notification> notifications(@PathVariable String email, Authentication authentication) {
        requireOwnProfile(email, authentication);
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    @PostMapping("/students/{email}/notifications")
    public Notification addNotification(@PathVariable String email,
                                        @RequestBody Notification payload,
                                        Authentication authentication) {
        requireOwnProfile(email, authentication);
        payload.setUserEmail(email);
        return notificationRepository.save(payload);
    }

    @GetMapping("/students/{email}/certifications")
    public List<Certification> certifications(@PathVariable String email, Authentication authentication) {
        requireOwnProfile(email, authentication);
        return certificationRepository.findByStudentEmail(email);
    }

    @PostMapping("/students/{email}/certifications")
    public Certification addCertification(@PathVariable String email,
                                          @RequestBody Certification certification,
                                          Authentication authentication) {
        requireOwnProfile(email, authentication);
        certification.setId(null);
        certification.setStudentEmail(email);
        return certificationRepository.save(certification);
    }

    @PutMapping("/students/{email}/certifications/{id}")
    public Certification updateCertification(@PathVariable String email,
                                             @PathVariable Long id,
                                             @RequestBody Certification payload,
                                             Authentication authentication) {
        if (authentication == null || !email.equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own certifications.");
        }

        Certification certification = certificationRepository.findByIdAndStudentEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found."));
        certification.setName(payload.getName());
        certification.setIssuingOrganization(payload.getIssuingOrganization());
        certification.setIssueDate(payload.getIssueDate());
        certification.setExpiryDate(payload.getExpiryDate());
        certification.setCredentialId(payload.getCredentialId());
        certification.setCertificateUrl(payload.getCertificateUrl());
        return certificationRepository.save(certification);
    }

    @DeleteMapping("/students/{email}/certifications/{id}")
    public ResponseEntity<Void> deleteCertification(@PathVariable String email,
                                                    @PathVariable Long id,
                                                    Authentication authentication) {
        if (authentication == null || !email.equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own certifications.");
        }

        Certification certification = certificationRepository.findByIdAndStudentEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found."));
        certificationRepository.delete(certification);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/students/{email}/internships")
    public List<Internship> internships(@PathVariable String email, Authentication authentication) {
        requireOwnProfile(email, authentication);
        return internshipRepository.findByStudentEmail(email);
    }

    @PostMapping("/students/{email}/internships")
    public Internship addInternship(@PathVariable String email,
                                    @RequestBody Internship internship,
                                    Authentication authentication) {
        requireOwnProfile(email, authentication);
        internship.setStudentEmail(email);
        return internshipRepository.save(internship);
    }

    @DeleteMapping("/students/{email}/internships/{id}")
    public ResponseEntity<Void> deleteInternship(@PathVariable("email") String email,
                                                 @PathVariable("id") Long id,
                                                 Authentication authentication) {
        if (authentication == null || !email.equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own internships.");
        }

        Internship internship = internshipRepository.findByIdAndStudentEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Internship not found."));
        internshipRepository.delete(internship);
        return ResponseEntity.noContent().build();
    }

    private StudentProfile createDefaultProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        return studentProfileRepository.save(profile);
    }

    private double computeCareerReadiness(StudentProfile profile,
                                         List<JobApplication> applications,
                                         List<Certification> certifications,
                                         List<Internship> internships) {
        double score = 0;
        int total = 0;

        if (profile.getDegree() != null && !profile.getDegree().isBlank()) { score += 20; }
        if (profile.getResumeUrl() != null && !profile.getResumeUrl().isBlank()) { score += 20; }
        if (profile.getSkills() != null && !profile.getSkills().isBlank()) { score += 20; }
        if (profile.getLinkedinUrl() != null || profile.getGithubUrl() != null || profile.getPortfolioUrl() != null) { score += 10; }
        if (profile.getCollege() != null && !profile.getCollege().isBlank()) { score += 10; }

        total += 80;
        score += Math.min(20, certifications.size() * 5);
        total += 20;
        score += Math.min(20, internships.size() * 5);
        total += 20;
        score += Math.min(20, applications.size() * 2);
        total += 20;

        return Math.min(100, Math.round((score / total) * 100.0));
    }

    public record DashboardResponse(String welcomeName,
                                   int jobs,
                                   int applied,
                                   long interviews,
                                   int certifications,
                                   long offers,
                                   double careerReadiness,
                                   List<Notification> notifications,
                                   List<Opportunity> opportunities,
                                   List<Company> companies) {}
}
