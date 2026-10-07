package com.careerpilot.application;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;
    private String companyName;
    private String role;
    private String round;
    private LocalDateTime interviewDateTime;
    private String mode;
    private String meetingLink;
    private String status = "SCHEDULED";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public LocalDateTime getInterviewDateTime() { return interviewDateTime; }
    public void setInterviewDateTime(LocalDateTime interviewDateTime) { this.interviewDateTime = interviewDateTime; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
