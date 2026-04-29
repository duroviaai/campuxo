package com.collegeportal.modules.attendance.dto.request;

import com.collegeportal.shared.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class AttendanceUpdateRequestDTO {

    @NotNull
    private AttendanceStatus status;
}
