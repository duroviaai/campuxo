package com.collegeportal.modules.student.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClassmateResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String department;
    private Integer yearOfStudy;
    private String photoUrl;
}
