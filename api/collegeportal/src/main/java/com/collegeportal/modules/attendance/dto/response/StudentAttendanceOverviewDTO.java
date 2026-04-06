package com.collegeportal.modules.attendance.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class StudentAttendanceOverviewDTO {

    private Long studentId;
    private String studentName;
    private String registrationNumber;
    private String email;

    // overall stats
    private int totalClasses;
    private int attendedClasses;
    private double attendancePercentage;

    // full date lists (used for day-level drill-down)
    private List<LocalDate> presentDates;
    private List<LocalDate> absentDates;
}
