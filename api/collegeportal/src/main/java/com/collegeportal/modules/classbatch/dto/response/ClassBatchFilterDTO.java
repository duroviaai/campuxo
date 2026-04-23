package com.collegeportal.modules.classbatch.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ClassBatchFilterDTO {
    private List<String> departments;
    private List<Integer> years;
}
