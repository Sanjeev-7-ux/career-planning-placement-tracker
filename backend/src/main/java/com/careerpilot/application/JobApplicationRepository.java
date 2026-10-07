package com.careerpilot.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStudentEmail(String email);
    List<JobApplication> findByOpportunityId(Long opportunityId);
    boolean existsByStudentEmailIgnoreCaseAndRoleIgnoreCaseAndOpportunityCompanyId(
            String studentEmail, String role, Long companyId);
}