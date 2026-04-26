package com.collegeportal.modules.classstructure.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ClassStructureResponseDTO {
    private Long    id;
    private Long    batchId;
    private Long    departmentId;
    private String  departmentName;
    private Long    specializationId;
    private String  specializationName;
    private Integer yearOfStudy;
    private Integer semester;
    private String  displayName; // e.g. "BCA 2023-2026 Sem 3 Year 1"
}
