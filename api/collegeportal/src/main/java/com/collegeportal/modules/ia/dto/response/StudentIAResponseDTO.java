package com.collegeportal.modules.ia.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data @Builder
public class StudentIAResponseDTO {
    private Long   studentId;
    private String studentName;
    private String registrationNumber;
    private Map<Integer, BigDecimal> marks;
    private Map<Integer, BigDecimal> maxMarks;
    private Map<Integer, LocalDate>  dates;
}
