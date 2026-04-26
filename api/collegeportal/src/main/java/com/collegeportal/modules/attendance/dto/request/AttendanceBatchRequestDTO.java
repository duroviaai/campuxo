package com.collegeportal.modules.attendance.dto.request;

import com.collegeportal.shared.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class AttendanceBatchRequestDTO {

    @NotNull
    private Long studentId;

    @NotNull
    private Long courseId;

    private Long classId; // optional — derived from student's classBatch if null

    @NotNull
    private LocalDate date;

    @NotNull
    private AttendanceStatus status;
}
