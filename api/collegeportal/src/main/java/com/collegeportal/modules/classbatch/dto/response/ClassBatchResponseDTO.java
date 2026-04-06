package com.collegeportal.modules.classbatch.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClassBatchResponseDTO {
    private Long id;
    private String name;
    private String section;
    private Integer year;
    private String displayName;
}
