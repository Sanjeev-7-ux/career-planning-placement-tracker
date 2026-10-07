package com.careerpilot.opportunity;

import com.careerpilot.company.Company;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Opportunity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type;
    private String location;
    private String skills;
    private String requiredSkills;
    private String employmentType;
    private String experience;
    private String salaryRange;
    private Double stipendOrSalary;
    private LocalDate deadline;
    private LocalDate applicationDeadline;
    private String status = "OPEN";

    @ManyToOne(optional = false)
    private Company company;

    @Column(length = 2000)
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSkills() { return skills != null ? skills : requiredSkills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getRequiredSkills() { return requiredSkills != null ? requiredSkills : skills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public Double getStipendOrSalary() { return stipendOrSalary; }
    public void setStipendOrSalary(Double stipendOrSalary) { this.stipendOrSalary = stipendOrSalary; }

    public LocalDate getDeadline() { return deadline != null ? deadline : applicationDeadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public LocalDate getApplicationDeadline() { return applicationDeadline != null ? applicationDeadline : deadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
