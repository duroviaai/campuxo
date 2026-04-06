package com.collegeportal.modules.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsDTO {
    private long totalStudents;
    private long totalFaculty;
    private long totalCourses;
    private long pendingApprovals;
}
