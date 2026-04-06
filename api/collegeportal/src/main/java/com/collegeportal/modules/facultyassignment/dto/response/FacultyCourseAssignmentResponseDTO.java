package com.collegeportal.modules.facultyassignment.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacultyCourseAssignmentResponseDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long classId;
    private String className;
    private String classSection;
    private Integer classYear;
    private String classDisplayName;
}
