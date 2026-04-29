package com.collegeportal.modules.student.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudentAlertDTO {

    public enum Type     { ATTENDANCE_LOW, IA_PENDING, PROFILE_INCOMPLETE }
    public enum Severity { LOW, MEDIUM, HIGH }

    private Type     type;
    private String   message;
    private Long     courseId;
    private String   courseName;
    private Severity severity;
}
