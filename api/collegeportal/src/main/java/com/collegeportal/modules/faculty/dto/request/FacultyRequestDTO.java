package com.collegeportal.modules.faculty.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class FacultyRequestDTO {

    private String name;

    @Email
    private String email;

    private String facultyId;
    private String firstName;
    private String lastName;

    private String department;
    private Long   departmentId;
    private String phone;
    private String designation;
    private String qualification;
    private Integer experience;
    private String subjects;
    private LocalDate joiningDate;

    private String status;
}
