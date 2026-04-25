package com.collegeportal.modules.student.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudentRequestDTO {

    @NotBlank
    private String firstName;

    private String lastName;

    private String phone;

    private String department;

    private LocalDate dateOfBirth;

    private Integer yearOfStudy;

    private Integer courseStartYear;

    private Integer courseEndYear;

    private String photoUrl;

    private String scheme; // NEP or SEP

    private Long classBatchId;
}
