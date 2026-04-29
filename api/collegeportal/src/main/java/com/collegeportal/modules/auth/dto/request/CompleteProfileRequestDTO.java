package com.collegeportal.modules.auth.dto.request;

import com.collegeportal.shared.enums.RoleType;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CompleteProfileRequestDTO {

    @NotNull
    private RoleType role;

    // Student fields
    private String registrationNumber;
    private String phone;
    private LocalDate dateOfBirth;
    private String department;
    private Integer yearOfStudy;
    private Integer courseStartYear;
    private Integer courseEndYear;
    private Long specializationId;
    private String scheme;
    private Long classStructureId;

    // Faculty fields
    private String facultyId;
    private String designation;
    private String qualification;
    private Integer experience;
    private LocalDate joiningDate;

    @JsonSetter("role")
    public void setRole(String roleString) {
        if (roleString != null) this.role = RoleType.from(roleString);
    }
}
