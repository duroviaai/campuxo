package com.collegeportal.modules.classbatch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClassBatchRequestDTO {

    @NotBlank
    private String name;

    @NotNull
    private Integer year;
}
