package com.collegeportal.modules.faculty.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FacultyRequestDTO {

    /** Full name — used on create when firstName/lastName are not split yet. */
    private String name;

    @Email
    private String email;

    private String facultyId;

    private String firstName;
    private String lastName;

    private String department;
    private String phone;
    private String designation;

    /** "active" | "inactive" — defaults to active on create. */
    private String status;
}
