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

    @NotNull
    private Long classId;

    @NotNull
    private LocalDate date;

    @NotNull
    private AttendanceStatus status;
}
