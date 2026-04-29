package com.collegeportal.modules.student.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentStatsDTO {
    private int totalEnrolledCourses;
    private int totalClasses;
    private int totalPresent;
    private double overallAttendancePercentage;
    private int coursesAtRisk;
    private Integer yearOfStudy;
    private Integer semester;
}
