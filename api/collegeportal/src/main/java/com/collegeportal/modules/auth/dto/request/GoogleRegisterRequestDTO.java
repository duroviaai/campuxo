package com.collegeportal.modules.auth.dto.request;

import com.collegeportal.shared.enums.RoleType;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleRegisterRequestDTO {

    @NotBlank
    private String accessToken;

    // Registration fields (mirrors RegisterRequestDTO minus email/password)
    @NotBlank
    private String fullName;

    private RoleType role;

    private String registrationNumber;
    private String phone;
    private java.time.LocalDate dateOfBirth;
    private String department;
    private Integer yearOfStudy;
    private Integer courseStartYear;
    private Integer courseEndYear;

    private String facultyId;
    private String designation;
    private String qualification;
    private Integer experience;
    private java.time.LocalDate joiningDate;

    @JsonSetter("role")
    public void setRole(String roleString) {
        if (roleString != null) {
            this.role = RoleType.from(roleString);
        }
    }

    public RegisterRequestDTO toRegisterRequest() {
        RegisterRequestDTO r = new RegisterRequestDTO();
        r.setFullName(fullName);
        r.setEmail("placeholder@google.com"); // overridden by service from Google token
        r.setPassword(java.util.UUID.randomUUID().toString());
        if (role != null) r.setRole(role.name()); // uses @JsonSetter string path
        r.setRegistrationNumber(registrationNumber);
        r.setPhone(phone);
        r.setDateOfBirth(dateOfBirth);
        r.setDepartment(department);
        r.setYearOfStudy(yearOfStudy);
        r.setCourseStartYear(courseStartYear);
        r.setCourseEndYear(courseEndYear);
        r.setFacultyId(facultyId);
        r.setDesignation(designation);
        r.setQualification(qualification);
        r.setExperience(experience);
        r.setJoiningDate(joiningDate);
        return r;
    }
}
