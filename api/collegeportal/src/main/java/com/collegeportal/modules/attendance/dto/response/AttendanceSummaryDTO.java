package com.collegeportal.modules.attendance.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class AttendanceSummaryDTO {

    private Long studentId;
    private String studentName;
    private String courseCode;
    private String courseName;
    private int totalClasses;
    private int attendedClasses;
    private double attendancePercentage;
    private List<LocalDate> presentDates;
    private List<LocalDate> absentDates;
}
