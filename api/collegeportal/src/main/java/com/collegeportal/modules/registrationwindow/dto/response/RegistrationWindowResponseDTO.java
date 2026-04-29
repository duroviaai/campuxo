package com.collegeportal.modules.registrationwindow.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter @Builder
public class RegistrationWindowResponseDTO {

    private Long id;
    private Long batchId;
    private Integer batchStartYear;
    private Integer batchEndYear;
    private String batchScheme;
    private String role;
    private LocalDate openDate;
    private LocalDate closeDate;
    private Integer allowedYearOfStudy;
    private Boolean active;
    private Boolean currentlyOpen;
}
