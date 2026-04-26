package com.collegeportal.modules.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class AdminResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String registrationNumber;
    private String facultyId;
    private Set<String> roles;
    private boolean approved;
    private boolean enabled;
    private LocalDateTime createdAt;
    private String message;
    private String rejectionReason;
    private String department;
    private Long profileId; // student or faculty profile id
}
