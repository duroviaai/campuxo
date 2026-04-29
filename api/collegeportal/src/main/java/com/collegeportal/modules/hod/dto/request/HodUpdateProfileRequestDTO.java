package com.collegeportal.modules.hod.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class HodUpdateProfileRequestDTO {
    private String phone;
    private String designation;
    private String qualification;
    private Integer experience;
    private String subjects;
    private LocalDate joiningDate;
}
