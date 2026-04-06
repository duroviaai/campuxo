package com.collegeportal.modules.auth.dto.request;

import com.collegeportal.shared.enums.RoleType;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDTO {

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotNull
    private RoleType role;

    // For students
    private String registrationNumber;

    // For faculty
    private String facultyId;
    
    @JsonSetter("role")
    public void setRole(String roleString) {
        if (roleString != null) {
            this.role = RoleType.from(roleString);
        }
    }
}
