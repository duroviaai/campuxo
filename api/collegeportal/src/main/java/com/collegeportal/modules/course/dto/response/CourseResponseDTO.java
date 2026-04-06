package com.collegeportal.modules.course.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseResponseDTO {

    private Long id;
    private String name;
    private String code;
    private Integer credits;
    private Long facultyId;
    private String facultyName;
    private Integer studentCount;
    private String programType;
    private Boolean enrolled; // true if the requesting student is enrolled
}
