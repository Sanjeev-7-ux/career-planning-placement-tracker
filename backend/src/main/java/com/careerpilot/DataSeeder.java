package com.careerpilot;

import com.careerpilot.application.*;
import com.careerpilot.auth.User;
import com.careerpilot.auth.UserRepository;
import com.careerpilot.auth.UserRole;
import com.careerpilot.company.Company;
import com.careerpilot.company.CompanyRepository;
import com.careerpilot.opportunity.Opportunity;
import com.careerpilot.opportunity.OpportunityRepository;
import com.careerpilot.student.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements ApplicationRunner {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final OpportunityRepository opportunityRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final CertificationRepository certificationRepository;
    private final InternshipRepository internshipRepository;
    private final NotificationRepository notificationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      CompanyRepository companyRepository,
                      OpportunityRepository opportunityRepository,
                      JobApplicationRepository jobApplicationRepository,
                      InterviewRepository interviewRepository,
                      OfferRepository offerRepository,
                      CertificationRepository certificationRepository,
                      InternshipRepository internshipRepository,
                      NotificationRepository notificationRepository,
                      StudentProfileRepository studentProfileRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.opportunityRepository = opportunityRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.offerRepository = offerRepository;
        this.certificationRepository = certificationRepository;
        this.internshipRepository = internshipRepository;
        this.notificationRepository = notificationRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            seedUsersAndProfiles();
        }

        seedDefaultCompanies();
        seedDefaultOpportunities();
    }

    private void seedUsersAndProfiles() {
        User studentUser = new User();
        studentUser.setName("Sanjeev Kumar");
        studentUser.setEmail("student@careerpilot.com");
        studentUser.setPassword(passwordEncoder.encode("password123"));
        studentUser.setRole(UserRole.STUDENT);
        studentUser = userRepository.save(studentUser);

        User companyUser = new User();
        companyUser.setName("ABC Technologies");
        companyUser.setEmail("company@careerpilot.com");
        companyUser.setPassword(passwordEncoder.encode("password123"));
        companyUser.setRole(UserRole.COMPANY);
        companyUser = userRepository.save(companyUser);

        User adminUser = new User();
        adminUser.setName("Platform Admin");
        adminUser.setEmail("admin@careerpilot.com");
        adminUser.setPassword(passwordEncoder.encode("password123"));
        adminUser.setRole(UserRole.ADMIN);
        userRepository.save(adminUser);

        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setUser(studentUser);
        studentProfile.setPhone("9876543210");
        studentProfile.setDateOfBirth("2001-05-18");
        studentProfile.setLocation("Chennai");
        studentProfile.setDegree("B.E. Computer Science");
        studentProfile.setCollege("SRM Institute of Science and Technology");
        studentProfile.setDepartment("CSE");
        studentProfile.setGraduationYear(2025);
        studentProfile.setCgpa(8.7);
        studentProfile.setSkills("Java, Spring Boot, MySQL, React, Docker");
        studentProfile.setLinkedinUrl("https://linkedin.com/in/sanjeev");
        studentProfile.setGithubUrl("https://github.com/sanjeev");
        studentProfile.setPortfolioUrl("https://portfolio.example.com");
        studentProfileRepository.save(studentProfile);

        Company company = new Company();
        company.setName("ABC Technologies");
        company.setIndustry("IT Services");
        company.setLocation("Chennai");
        company.setWebsite("https://www.abctechnologies.example");
        company.setDescription("A technology company focused on enterprise software and digital transformation.");
        company = companyRepository.save(company);

        Opportunity opportunity = new Opportunity();
        opportunity.setTitle("Software Developer");
        opportunity.setType("Full Time");
        opportunity.setLocation("Chennai");
        opportunity.setEmploymentType("Full Time");
        opportunity.setExperience("Fresher");
        opportunity.setSalaryRange("₹5-8 LPA");
        opportunity.setRequiredSkills("Java, Spring Boot, React, MySQL");
        opportunity.setDescription("Build and support cloud-native software products for enterprise customers.");
        opportunity.setCompany(company);
        opportunity.setApplicationDeadline(LocalDate.now().plusDays(20));
        opportunityRepository.save(opportunity);

        JobApplication app = new JobApplication();
        app.setStudentEmail(studentUser.getEmail());
        app.setOpportunity(opportunity);
        app.setCompanyName(company.getName());
        app.setRole(opportunity.getTitle());
        app.setStatus("APPLIED");
        app.setAppliedAt(LocalDateTime.now().minusDays(2));
        jobApplicationRepository.save(app);

        Interview interview = new Interview();
        interview.setStudentEmail(studentUser.getEmail());
        interview.setCompanyName(company.getName());
        interview.setRole(opportunity.getTitle());
        interview.setRound("Technical Interview");
        interview.setInterviewDateTime(LocalDateTime.now().plusDays(5));
        interview.setMode("Online");
        interview.setMeetingLink("https://meet.example.com/careerpilot");
        interviewRepository.save(interview);

        Offer offer = new Offer();
        offer.setStudentEmail(studentUser.getEmail());
        offer.setCompanyName(company.getName());
        offer.setRole(opportunity.getTitle());
        offer.setSalary("₹6 LPA");
        offer.setLocation("Chennai");
        offer.setOfferDate(LocalDate.now().minusDays(1));
        offer.setJoiningDate(LocalDate.now().plusMonths(2));
        offerRepository.save(offer);

        Certification certification = new Certification();
        certification.setStudentEmail(studentUser.getEmail());
        certification.setName("Java Programming");
        certification.setIssuingOrganization("Oracle");
        certification.setIssueDate(LocalDate.now().minusMonths(6));
        certification.setCredentialId("CERT12345");
        certification.setCertificateUrl("https://example.com/cert/java");
        certificationRepository.save(certification);

        Internship internship = new Internship();
        internship.setStudentEmail(studentUser.getEmail());
        internship.setCompanyName("ABC Software Pvt Ltd");
        internship.setRole("Java Developer Intern");
        internship.setLocation("Chennai");
        internship.setStartDate(LocalDate.now().minusMonths(4));
        internship.setEndDate(LocalDate.now().minusDays(5));
        internship.setDuration("3 Months");
        internship.setStatus("Completed");
        internship.setDescription("Worked on backend services and reporting tools.");
        internshipRepository.save(internship);

        Notification notification = new Notification();
        notification.setUserEmail(studentUser.getEmail());
        notification.setType("APPLICATION");
        notification.setMessage("ABC Technologies shortlisted you for Software Developer.");
        notificationRepository.save(notification);
    }

    private void seedDefaultCompanies() {
        var existingNames = companyRepository.findAll().stream()
                .map(company -> company.getName() == null ? "" : company.getName().trim().toLowerCase())
                .collect(java.util.stream.Collectors.toSet());

        java.util.List<Object[]> companySeed = java.util.List.of(
                new Object[] { "ABC Technologies", "IT Services", "Chennai", "https://www.abctechnologies.example", "A technology company focused on enterprise software and digital transformation." },
                new Object[] { "startech", "Product-based company", "Chennai", "", "passionate to achieve the goal" },
                new Object[] { "ShineTechnologies", "IT", "Mysuru", "", "Aspiring Software Development company passionate about building practical and scalable software solutions" },
                new Object[] { "SnowTechnologies", "Cloud & Data", "Bengaluru", "", "Cloud-first engineering company delivering data platforms and software products." },
                new Object[] { "HelloTechnologies", "Digital Solutions", "Hyderabad", "", "Customer-focused digital product company building scalable and modern technology experiences." }
        );

        for (Object[] seed : companySeed) {
            String name = String.valueOf(seed[0]);
            String industry = String.valueOf(seed[1]);
            String location = String.valueOf(seed[2]);
            String website = String.valueOf(seed[3]);
            String description = String.valueOf(seed[4]);

            if (existingNames.contains(name.trim().toLowerCase())) {
                continue;
            }

            Company company = new Company();
            company.setName(name);
            company.setIndustry(industry);
            company.setLocation(location);
            company.setWebsite(website);
            company.setDescription(description);
            companyRepository.save(company);
            existingNames.add(name.trim().toLowerCase());
        }
    }

    private void seedDefaultOpportunities() {
        var seededListings = java.util.List.<Object[]>of(
                new Object[] { "ABC Technologies", "Software Developer", "Full Time", "Chennai",
                        "Fresher", "Java, Spring Boot, React, MySQL", "₹5-8 LPA",
                        "Build and support cloud-native software products for enterprise customers." },
                new Object[] { "StarTech", "Business Development Associate", "Full Time", "Chennai",
                        "Fresher", "Sales, Strategy, Communication, CRM", "₹3-5 LPA",
                        "Support client expansion and growth through business development." },
                new Object[] { "ShineTechnologies", "Software Engineer", "Full Time", "Mysuru",
                        "Fresher", "Java, Spring Boot, React, Testing", "₹5-7 LPA",
                        "Build clean, maintainable web and mobile software experiences." }
        );
        var existingKeys = opportunityRepository.findAll().stream()
                .map(opportunity -> (opportunity.getTitle() + "|" + opportunity.getCompany().getName())
                        .trim().toLowerCase(java.util.Locale.ROOT))
                .collect(java.util.stream.Collectors.toSet());

        for (Object[] seed : seededListings) {
            String companyName = (String) seed[0];
            String title = (String) seed[1];
            String key = (title + "|" + companyName).toLowerCase(java.util.Locale.ROOT);
            if (existingKeys.contains(key)) {
                continue;
            }

            Company company = companyRepository.findFirstByNameIgnoreCaseOrderByIdAsc(companyName)
                    .orElseThrow(() -> new IllegalStateException("Seed company not found: " + companyName));
            Opportunity opportunity = new Opportunity();
            opportunity.setCompany(company);
            opportunity.setTitle(title);
            opportunity.setType((String) seed[2]);
            opportunity.setEmploymentType((String) seed[2]);
            opportunity.setLocation((String) seed[3]);
            opportunity.setExperience((String) seed[4]);
            opportunity.setRequiredSkills((String) seed[5]);
            opportunity.setSalaryRange((String) seed[6]);
            opportunity.setDescription((String) seed[7]);
            opportunity.setStatus("OPEN");
            opportunity.setApplicationDeadline(LocalDate.now().plusDays(30));
            opportunityRepository.save(opportunity);
            existingKeys.add(key);
        }
    }
}
