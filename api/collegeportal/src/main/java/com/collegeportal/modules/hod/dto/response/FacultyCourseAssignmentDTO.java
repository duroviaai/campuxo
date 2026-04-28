package com.collegeportal.modules.hod.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacultyCourseAssignmentDTO {
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Integer credits;
    private Long classStructureId;
    private Integer yearOfStudy;
    private Integer semester;
    private String specialization;
    private Integer batchStartYear;
    private Integer batchEndYear;
    private String batchScheme;
}
