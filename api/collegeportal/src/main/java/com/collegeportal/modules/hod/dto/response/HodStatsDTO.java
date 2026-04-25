package com.collegeportal.modules.hod.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HodStatsDTO {
    private long totalStudents;
    private long totalFaculty;
    private long totalCourses;
    private String department;
}
