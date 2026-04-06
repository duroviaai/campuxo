package com.collegeportal.modules.faculty.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacultyResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String department;
    private String email;
}
