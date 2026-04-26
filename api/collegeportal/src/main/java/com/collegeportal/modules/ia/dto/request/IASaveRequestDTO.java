package com.collegeportal.modules.ia.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class IASaveRequestDTO {

    @NotNull
    private Long classStructureId;

    @NotNull
    private Long courseId;

    @Min(1) @Max(3)
    private int iaNumber;

    @NotNull @DecimalMin("1")
    private BigDecimal maxMarks;

    @NotEmpty
    private List<StudentMarkDTO> marks;

    @Data
    public static class StudentMarkDTO {
        @NotNull
        private Long studentId;

        @NotNull @DecimalMin("0")
        private BigDecimal marksObtained;
    }
}
