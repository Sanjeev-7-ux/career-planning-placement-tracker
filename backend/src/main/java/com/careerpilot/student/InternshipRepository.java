package com.careerpilot.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByStudentEmail(String studentEmail);
    Optional<Internship> findByIdAndStudentEmail(Long id, String studentEmail);
}
