package com.collegeportal.modules.ia.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class AssignmentSaveRequestDTO {
    @NotNull private Long classStructureId;
    @NotNull private Long courseId;
    @NotNull @DecimalMin("1") private BigDecimal maxMarks;
    private LocalDate assignmentDate;
    @NotEmpty private List<StudentAssignmentDTO> records;

    @Data
    public static class StudentAssignmentDTO {
        @NotNull private Long    studentId;
        @NotNull private Boolean submitted;
        private BigDecimal marksObtained;
    }
}
