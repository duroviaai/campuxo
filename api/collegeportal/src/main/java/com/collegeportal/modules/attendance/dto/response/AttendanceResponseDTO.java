package com.collegeportal.modules.attendance.dto.response;

import com.collegeportal.shared.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class AttendanceResponseDTO {

    private Long id;
    private LocalDate date;
    private AttendanceStatus status;
    private String studentName;
    private String courseName;
    private String courseCode;
}
