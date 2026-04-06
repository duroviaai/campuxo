package com.collegeportal.modules.attendance.dto.request;

import com.collegeportal.shared.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class AttendanceRequestDTO {

    @NotNull
    private Long courseId;

    @NotNull
    private Long classId;

    @NotNull
    private Long studentId;

    @NotNull
    private AttendanceStatus status;

    @NotNull
    private LocalDate date;
}
