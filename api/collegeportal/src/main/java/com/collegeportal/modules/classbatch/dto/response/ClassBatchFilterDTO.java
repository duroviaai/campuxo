package com.collegeportal.modules.classbatch.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ClassBatchFilterDTO {
    private List<String> departments;   // distinct programTypes from Course
    private List<Integer> years;        // distinct years from ClassBatch
    private List<String> sections;      // distinct sections from ClassBatch
}
