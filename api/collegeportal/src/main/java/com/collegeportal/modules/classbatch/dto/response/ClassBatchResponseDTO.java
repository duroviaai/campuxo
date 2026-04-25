package com.collegeportal.modules.classbatch.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClassBatchResponseDTO {
    private Long id;
    private String name;
    private Integer startYear;
    private Integer endYear;
    private String scheme;
    private String displayName;
    private Integer yearOfStudy;
    private String specialization;
    private Long parentBatchId;
    private Integer semester;
}
