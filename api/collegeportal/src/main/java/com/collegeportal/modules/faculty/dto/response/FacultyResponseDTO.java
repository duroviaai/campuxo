package com.collegeportal.modules.faculty.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacultyResponseDTO {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String department;
    private String email;
    private String facultyId;
    private String phone;
    private String designation;
    private String role;       // "faculty" | "hod"
    private String status;     // "active" | "inactive"
    private Integer courseCount;
    private boolean isHod;
}
