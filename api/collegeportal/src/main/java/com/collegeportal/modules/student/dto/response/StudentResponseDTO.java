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
    private Integer courseStartYear;
    private Integer courseEndYear;
    private String photoUrl;
    private String scheme;
    private Long specializationId;
    private String specializationName;
    private String classBatchName;
    private Long classBatchId;
    private String classBatchDisplayName;
    private Integer classBatchStartYear;
    private Integer classBatchEndYear;
    private Long classStructureId;
    private String classStructureDisplay;
}
