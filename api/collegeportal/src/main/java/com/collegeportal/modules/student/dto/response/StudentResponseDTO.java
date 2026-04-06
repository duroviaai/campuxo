package com.collegeportal.modules.student.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudentResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String phone;
    private String department;
    private String fullName;
    private String email;
}
