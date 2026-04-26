package com.collegeportal.modules.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private Integer credits;

    private String programType;

    private String scheme;

    private Long classBatchId;

    // facultyId removed — course-faculty link is now exclusively via FacultyCourseAssignment

    private String specialization;
}
