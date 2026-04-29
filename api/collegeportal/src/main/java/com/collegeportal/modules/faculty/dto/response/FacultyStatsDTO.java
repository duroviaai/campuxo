package com.collegeportal.modules.faculty.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacultyStatsDTO {
    private long totalCourses;
    private long totalStudents;
    private long totalClassStructures;
    private double overallAttendanceRate;
}
