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
    private String facultyName;
    private Integer studentCount;
}
