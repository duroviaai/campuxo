package com.collegeportal.modules.student.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRequestDTO {

    @NotBlank
    private String firstName;

    private String lastName;

    private String phone;

    private String department;
}
