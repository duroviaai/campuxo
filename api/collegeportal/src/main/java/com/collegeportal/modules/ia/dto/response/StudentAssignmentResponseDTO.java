package com.collegeportal.modules.ia.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder
public class StudentAssignmentResponseDTO {
    private Long       studentId;
    private String     studentName;
    private String     registrationNumber;
    private Boolean    submitted;
    private BigDecimal marksObtained;
    private BigDecimal maxMarks;
    private LocalDate  assignmentDate;
}
