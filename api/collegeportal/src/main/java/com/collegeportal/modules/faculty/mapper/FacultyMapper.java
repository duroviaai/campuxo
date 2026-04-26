package com.collegeportal.modules.faculty.mapper;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment;
import com.collegeportal.shared.enums.FacultyRole;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FacultyMapper {

    public Faculty toEntity(FacultyRequestDTO dto, User user) {
        return Faculty.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .department(dto.getDepartment())
                .phone(dto.getPhone())
                .designation(dto.getDesignation())
                .qualification(dto.getQualification())
                .experience(dto.getExperience())
                .subjects(dto.getSubjects())
                .joiningDate(dto.getJoiningDate())
                .user(user)
                .build();
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty) {
        return toResponseDTO(faculty, null, null);
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty, Integer courseCount) {
        return toResponseDTO(faculty, courseCount, null);
    }

    public FacultyResponseDTO toResponseDTO(Faculty faculty, Integer courseCount, List<FacultyCourseAssignment> assignments) {
        String fullName = (faculty.getFirstName() != null ? faculty.getFirstName() : "") +
                (faculty.getLastName() != null && !faculty.getLastName().isBlank()
                        ? " " + faculty.getLastName() : "");
        boolean isHod = faculty.getRole() == FacultyRole.hod;

        List<String> assignedClasses = null;
        if (assignments != null) {
            assignedClasses = assignments.stream()
                    .filter(a -> a.getClassStructure() != null)
                    .map(a -> {
                        var cs = a.getClassStructure();
                        return cs.getDepartment().getName()
                                + " " + cs.getBatch().getStartYear() + "–" + cs.getBatch().getEndYear()
                                + " Sem " + cs.getSemester();
                    })
                    .distinct()
                    .toList();
        }

        return FacultyResponseDTO.builder()
                .id(faculty.getId())
                .userId(faculty.getUser() != null ? faculty.getUser().getId() : null)
                .firstName(faculty.getFirstName())
                .lastName(faculty.getLastName())
                .fullName(fullName.isBlank() ? null : fullName.trim())
                .department(faculty.getDepartment())
                .departmentId(faculty.getDepartmentEntity() != null ? faculty.getDepartmentEntity().getId() : null)
                .phone(faculty.getPhone())
                .designation(faculty.getDesignation())
                .qualification(faculty.getQualification())
                .experience(faculty.getExperience())
                .subjects(faculty.getSubjects())
                .joiningDate(faculty.getJoiningDate())
                .email(faculty.getUser() != null ? faculty.getUser().getEmail() : null)
                .facultyId(faculty.getUser() != null ? faculty.getUser().getFacultyId() : null)
                .role(faculty.getRole() != null ? faculty.getRole().name() : FacultyRole.faculty.name())
                .status(faculty.getStatus() != null ? faculty.getStatus().name() : "active")
                .courseCount(courseCount)
                .hod(isHod)
                .assignedClasses(assignedClasses)
                .build();
    }
}
