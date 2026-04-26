package com.collegeportal.modules.ia.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class StudentIAResponseDTO {
    private Long   studentId;
    private String studentName;
    private String registrationNumber;
    /** iaNumber (1/2/3) → marks obtained */
    private Map<Integer, BigDecimal> marks;
    /** iaNumber → max marks */
    private Map<Integer, BigDecimal> maxMarks;
}
