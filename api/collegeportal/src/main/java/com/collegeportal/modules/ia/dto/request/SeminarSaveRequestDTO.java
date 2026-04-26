package com.collegeportal.modules.ia.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class SeminarSaveRequestDTO {
    @NotNull private Long classStructureId;
    @NotNull private Long courseId;
    @NotNull @DecimalMin("1") private BigDecimal maxMarks;
    private LocalDate seminarDate;
    @NotEmpty private List<StudentSeminarDTO> records;

    @Data
    public static class StudentSeminarDTO {
        @NotNull private Long    studentId;
        @NotNull private Boolean done;
        @NotNull private Boolean scriptSubmitted;
        private BigDecimal marksObtained;
        private LocalDate  submittedDate;
    }
}
