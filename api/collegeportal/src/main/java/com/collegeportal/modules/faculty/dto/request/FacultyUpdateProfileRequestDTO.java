package com.collegeportal.modules.faculty.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class FacultyUpdateProfileRequestDTO {
    private String phone;
    private String designation;
    private String qualification;
    private Integer experience;
    private String subjects;
    private LocalDate joiningDate;
}
