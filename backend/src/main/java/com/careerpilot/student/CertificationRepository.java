package com.careerpilot.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByStudentEmail(String studentEmail);
    Optional<Certification> findByIdAndStudentEmail(Long id, String studentEmail);
}
