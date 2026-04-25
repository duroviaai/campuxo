package com.collegeportal.modules.facultyassignment.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacultyCourseAssignmentResponseDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long classStructureId;
    private String classDisplayName; // e.g. "BCA 2023-2026 Sem 3"
}
