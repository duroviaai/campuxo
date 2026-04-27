package com.collegeportal.modules.ia.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder
public class StudentFinalMarksResponseDTO {
    private Long studentId;
    private String studentName;
    private String registrationNumber;
    private BigDecimal ia1Marks;
    private BigDecimal ia2Marks;
    private BigDecimal ia3Marks;
    private BigDecimal topTwoAverage;
    private BigDecimal finalMarks;
    private LocalDate calculatedDate;
}
