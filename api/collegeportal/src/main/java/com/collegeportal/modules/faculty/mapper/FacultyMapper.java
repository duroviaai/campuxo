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
                .user(user)
                .build();
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty) {
        return FacultyResponseDTO.builder()
                .id(faculty.getId())
                .firstName(faculty.getFirstName())
                .lastName(faculty.getLastName())
                .department(faculty.getDepartment())
                .email(faculty.getUser() != null ? faculty.getUser().getEmail() : null)
                .build();
    }
}
