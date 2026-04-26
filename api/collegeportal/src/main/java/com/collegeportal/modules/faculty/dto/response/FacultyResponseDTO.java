package com.collegeportal.modules.faculty.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class FacultyResponseDTO {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String department;
    private Long   departmentId;
    private String email;
    private String facultyId;
    private String phone;
    private String designation;
    private String qualification;
    private Integer experience;
    private String subjects;
    private LocalDate joiningDate;
    private String role;
    private String status;
    private Integer courseCount;
    private boolean hod;
    private List<String> assignedClasses;
}
