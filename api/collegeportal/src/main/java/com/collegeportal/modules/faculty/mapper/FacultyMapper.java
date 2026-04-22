package com.collegeportal.modules.faculty.mapper;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import org.springframework.stereotype.Component;

@Component
public class FacultyMapper {

    public Faculty toEntity(FacultyRequestDTO dto, User user) {
        return Faculty.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .department(dto.getDepartment())
                .phone(dto.getPhone())
                .user(user)
                .build();
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty) {
        return toResponseDTO(faculty, null);
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty, Integer courseCount) {
        String fullName = (faculty.getFirstName() != null ? faculty.getFirstName() : "") +
                (faculty.getLastName() != null && !faculty.getLastName().isBlank() ? " " + faculty.getLastName() : "");
        return FacultyResponseDTO.builder()
                .id(faculty.getId())
                .firstName(faculty.getFirstName())
                .lastName(faculty.getLastName())
                .fullName(fullName.isBlank() ? null : fullName.trim())
                .department(faculty.getDepartment())
                .phone(faculty.getPhone())
                .email(faculty.getUser() != null ? faculty.getUser().getEmail() : null)
                .facultyId(faculty.getUser() != null ? faculty.getUser().getFacultyId() : null)
                .courseCount(courseCount)
                .build();
    }
}
