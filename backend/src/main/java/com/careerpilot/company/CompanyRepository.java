package com.careerpilot.company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CompanyRepository extends JpaRepository<Company,Long> {
    Optional<Company> findFirstByEmailIgnoreCaseOrderByIdAsc(String email);
    Optional<Company> findFirstByNameIgnoreCaseOrderByIdAsc(String name);
    Optional<Company> findFirstByEmailIsNullAndNameIgnoreCaseOrderByIdAsc(String name);
}