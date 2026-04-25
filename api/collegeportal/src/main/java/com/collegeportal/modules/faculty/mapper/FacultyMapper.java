package com.collegeportal.modules.faculty.mapper;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.shared.enums.FacultyRole;
import org.springframework.stereotype.Component;

@Component
public class FacultyMapper {

    public Faculty toEntity(FacultyRequestDTO dto, User user) {
        return Faculty.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .department(dto.getDepartment())
                .phone(dto.getPhone())
                .designation(dto.getDesignation())
                .user(user)
                .build();
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty) {
        return toResponseDTO(faculty, null);
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty, Integer courseCount) {
        String fullName = (faculty.getFirstName() != null ? faculty.getFirstName() : "") +
                (faculty.getLastName() != null && !faculty.getLastName().isBlank()
                        ? " " + faculty.getLastName() : "");
        boolean isHod = faculty.getRole() == FacultyRole.hod;
        return FacultyResponseDTO.builder()
                .id(faculty.getId())
                .userId(faculty.getUser() != null ? faculty.getUser().getId() : null)
                .firstName(faculty.getFirstName())
                .lastName(faculty.getLastName())
                .fullName(fullName.isBlank() ? null : fullName.trim())
                .department(faculty.getDepartment())
                .phone(faculty.getPhone())
                .designation(faculty.getDesignation())
                .email(faculty.getUser() != null ? faculty.getUser().getEmail() : null)
                .facultyId(faculty.getUser() != null ? faculty.getUser().getFacultyId() : null)
                .role(faculty.getRole() != null ? faculty.getRole().name() : FacultyRole.faculty.name())
                .status(faculty.getStatus() != null ? faculty.getStatus().name() : "active")
                .courseCount(courseCount)
                .isHod(isHod)
                .build();
    }
}
