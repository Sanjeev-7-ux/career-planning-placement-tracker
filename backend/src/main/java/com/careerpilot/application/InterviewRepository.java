package com.careerpilot.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByStudentEmail(String studentEmail);
    List<Interview> findByCompanyName(String companyName);
}
