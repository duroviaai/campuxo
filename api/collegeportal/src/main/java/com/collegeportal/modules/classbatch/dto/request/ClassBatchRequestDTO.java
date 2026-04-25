package com.collegeportal.modules.classbatch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClassBatchRequestDTO {

    @NotBlank
    private String name; // department

    @NotNull
    private Integer startYear;

    @NotNull
    private Integer endYear;

    @NotBlank
    private String scheme; // NEP or SEP

    private Integer yearOfStudy; // 1, 2, 3

    private String specialization;

    private Long parentBatchId;

    private Integer semester;
}
