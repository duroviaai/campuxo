package com.collegeportal.modules.batch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class BatchRequestDTO {

    @NotNull
    private Integer startYear;

    @NotNull
    private Integer endYear;

    @NotBlank
    private String scheme;
}
