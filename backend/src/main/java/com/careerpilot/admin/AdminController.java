package com.careerpilot.admin;

import com.careerpilot.application.InterviewRepository;
import com.careerpilot.application.JobApplicationRepository;
import com.careerpilot.application.OfferRepository;
import com.careerpilot.auth.UserRepository;
import com.careerpilot.company.CompanyRepository;
import com.careerpilot.opportunity.OpportunityRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final OpportunityRepository opportunityRepository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;

    public AdminController(UserRepository userRepository,
                          CompanyRepository companyRepository,
                          OpportunityRepository opportunityRepository,
                          JobApplicationRepository applicationRepository,
                          InterviewRepository interviewRepository,
                          OfferRepository offerRepository) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.offerRepository = offerRepository;
    }

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        return Map.of(
                "totalStudents", userRepository.findAll().stream().filter(user -> user.getRole().name().equals("STUDENT")).count(),
                "totalCompanies", companyRepository.count(),
                "totalJobs", opportunityRepository.count(),
                "totalApplications", applicationRepository.count(),
                "totalInterviews", interviewRepository.count(),
                "totalOffers", offerRepository.count()
        );
    }
}
