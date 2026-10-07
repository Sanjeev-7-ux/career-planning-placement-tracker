
package com.careerpilot.opportunity;

import com.careerpilot.company.Company;
import com.careerpilot.company.CompanyRepository;
import com.careerpilot.auth.User;
import com.careerpilot.auth.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityRepository repo;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public OpportunityController(OpportunityRepository repo,
                                 CompanyRepository companyRepository,
                                 UserRepository userRepository) {
        this.repo = repo;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Opportunity> all() {
        return repo.findAll().stream()
                .filter(this::isOpen)
                .toList();
    }

    @GetMapping("/{id}")
    public Opportunity one(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/company/{companyId}")
    public List<Opportunity> byCompany(@PathVariable Long companyId) {
        return repo.findByCompanyId(companyId).stream()
                .filter(this::isOpen)
                .toList();
    }

    @PostMapping
    public Opportunity create(@RequestBody OpportunityRequest request, Authentication authentication) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found."));
        requireCompanyAccess(company, authentication);
        Opportunity item = new Opportunity();
        item.setCompany(company);
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setLocation(request.location());
        item.setType(request.type());
        item.setEmploymentType(request.employmentType());
        item.setExperience(request.experience());
        item.setSalaryRange(request.salaryRange());
        item.setRequiredSkills(request.requiredSkills());
        item.setApplicationDeadline(request.applicationDeadline());
        item.setStatus("OPEN");
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        Opportunity opportunity = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found."));
        requireCompanyAccess(opportunity.getCompany(), authentication);
        repo.delete(opportunity);
    }

    private void requireCompanyAccess(Company company, Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue.");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (isAdmin) return;

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found."));
        if (!user.getEmail().equalsIgnoreCase(company.getEmail())
                && (company.getEmail() != null || !user.getName().equalsIgnoreCase(company.getName()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage opportunities for your company.");
        }
    }

    private boolean isOpen(Opportunity opportunity) {
        LocalDate deadline = opportunity.getApplicationDeadline();
        return "OPEN".equalsIgnoreCase(opportunity.getStatus())
                && (deadline == null || !deadline.isBefore(LocalDate.now()));
    }

    public record OpportunityRequest(Long companyId,
                                    String title,
                                    String description,
                                    String location,
                                    String type,
                                    String employmentType,
                                    String experience,
                                    String salaryRange,
                                    String requiredSkills,
                                    java.time.LocalDate applicationDeadline) {}
}
