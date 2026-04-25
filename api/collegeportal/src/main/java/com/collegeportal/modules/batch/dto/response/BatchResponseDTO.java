package com.collegeportal.modules.batch.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class BatchResponseDTO {
    private Long    id;
    private Integer startYear;
    private Integer endYear;
    private String  scheme;
    private long    totalDepartments;
    private long    totalCourses;
}
