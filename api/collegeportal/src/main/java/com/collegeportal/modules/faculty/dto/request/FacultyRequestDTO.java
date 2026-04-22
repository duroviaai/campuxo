package com.collegeportal.modules.faculty.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FacultyRequestDTO {

    // Used for create (admin creates faculty directly)
    private String name;

    @Email
    private String email;

    private String facultyId;

    // Used for update
    private String firstName;

    private String lastName;

    private String department;
    private String phone;
}
