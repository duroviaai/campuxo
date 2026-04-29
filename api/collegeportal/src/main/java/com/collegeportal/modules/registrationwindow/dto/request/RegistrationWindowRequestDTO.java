package com.collegeportal.modules.registrationwindow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class RegistrationWindowRequestDTO {

    private Long batchId;

    @NotBlank
    private String role;

    @NotNull
    private LocalDate openDate;

    @NotNull
    private LocalDate closeDate;

    private Integer allowedYearOfStudy;

    private Boolean active;
}
