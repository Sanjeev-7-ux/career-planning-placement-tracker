
package com.careerpilot.company;

import com.careerpilot.auth.User;
import com.careerpilot.auth.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyRepository repo;
    private final UserRepository userRepository;

    public CompanyController(CompanyRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Company> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Company one(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping
    public Company create(@RequestBody Company company, Authentication authentication) {
        User user = currentUser(authentication);
        Company existing = repo.findFirstByEmailIgnoreCaseOrderByIdAsc(user.getEmail())
                .or(() -> repo.findFirstByEmailIsNullAndNameIgnoreCaseOrderByIdAsc(user.getName()))
                .orElse(null);
        Company saved = existing == null ? new Company() : existing;
        saved.setName(company.getName());
        saved.setEmail(user.getEmail());
        saved.setIndustry(company.getIndustry());
        saved.setLocation(company.getLocation());
        saved.setWebsite(company.getWebsite());
        saved.setLogoUrl(company.getLogoUrl());
        saved.setDescription(company.getDescription());
        return repo.save(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        Company company = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found."));
        User user = currentUser(authentication);
        if (!isAdmin(authentication) && !owns(company, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own company profile.");
        }
        repo.delete(company);
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found."));
    }

    private boolean owns(Company company, User user) {
        return user.getEmail().equalsIgnoreCase(company.getEmail())
                || (company.getEmail() == null && user.getName().equalsIgnoreCase(company.getName()));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
