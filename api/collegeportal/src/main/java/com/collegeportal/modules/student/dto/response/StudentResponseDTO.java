package com.collegeportal.modules.student.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

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
    private String registrationNumber;
    private LocalDate dateOfBirth;
    private Integer yearOfStudy;
    private String photoUrl;
    private String classBatchName;
    private Long classBatchId;
}
