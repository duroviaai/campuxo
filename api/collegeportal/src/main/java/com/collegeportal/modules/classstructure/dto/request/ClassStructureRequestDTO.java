package com.collegeportal.modules.classstructure.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ClassStructureRequestDTO {

    @NotNull
    private Long batchId;

    @NotNull
    private Long departmentId;

    private Long specializationId; // nullable

    @NotNull @Min(1) @Max(3)
    private Integer yearOfStudy;

    @NotNull @Min(1) @Max(6)
    private Integer semester;
}
