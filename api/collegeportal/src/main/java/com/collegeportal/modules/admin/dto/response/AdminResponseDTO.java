package com.collegeportal.modules.admin.dto.response;

import lombok.Builder;
import lombok.Data;

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
    private String message;
}
