package com.collegeportal.modules.student.mapper;

import com.collegeportal.modules.student.dto.request.StudentRequestDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {

    public Student toEntity(StudentRequestDTO dto) {
        return Student.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .dateOfBirth(dto.getDateOfBirth())
                .yearOfStudy(dto.getYearOfStudy())
                .courseStartYear(dto.getCourseStartYear())
                .courseEndYear(dto.getCourseEndYear())
                .photoUrl(dto.getPhotoUrl())
                .scheme(dto.getScheme())
                .build();
    }

    public void updateEntity(Student student, StudentRequestDTO dto) {
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setPhone(dto.getPhone());
        student.setDepartment(dto.getDepartment());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setYearOfStudy(dto.getYearOfStudy());
        student.setCourseStartYear(dto.getCourseStartYear());
        student.setCourseEndYear(dto.getCourseEndYear());
        student.setScheme(dto.getScheme());
        if (dto.getPhotoUrl() != null) student.setPhotoUrl(dto.getPhotoUrl());
    }

    public StudentResponseDTO toResponseDTO(Student student) {
        return StudentResponseDTO.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .phone(student.getPhone())
                .department(student.getDepartment())
                .fullName(student.getUser().getFullName())
                .email(student.getUser().getEmail())
                .registrationNumber(student.getUser().getRegistrationNumber())
                .dateOfBirth(student.getDateOfBirth())
                .yearOfStudy(student.getYearOfStudy() != null ? student.getYearOfStudy()
                        : student.getClassStructure() != null ? student.getClassStructure().getYearOfStudy()
                        : student.getClassBatch() != null ? student.getClassBatch().getYearOfStudy() : null)
                .courseStartYear(student.getCourseStartYear())
                .courseEndYear(student.getCourseEndYear())
                .photoUrl(student.getPhotoUrl())
                .scheme(student.getScheme())
                .specializationId(student.getSpecialization() != null ? student.getSpecialization().getId() : null)
                .specializationName(student.getSpecialization() != null ? student.getSpecialization().getName() : null)
                .classBatchName(student.getClassBatch() != null ? student.getClassBatch().getName() : null)
                .classBatchId(student.getClassBatch() != null ? student.getClassBatch().getId() : null)
                .classBatchStartYear(student.getClassBatch() != null ? student.getClassBatch().getStartYear() : null)
                .classBatchEndYear(student.getClassBatch() != null ? student.getClassBatch().getEndYear() : null)
                .classBatchDisplayName(student.getClassBatch() != null
                        ? student.getClassBatch().getName()
                            + (student.getYearOfStudy() != null ? " Y" + student.getYearOfStudy() : "")
                            + " " + student.getClassBatch().getStartYear() + "-" + student.getClassBatch().getEndYear()
                            + " (" + student.getClassBatch().getScheme() + ")"
                        : null)
                .classStructureId(student.getClassStructure() != null ? student.getClassStructure().getId() : null)
                .classStructureDisplay(student.getClassStructure() != null
                        ? student.getClassStructure().getDepartment().getName()
                            + " " + student.getClassStructure().getBatch().getStartYear()
                            + "-" + student.getClassStructure().getBatch().getEndYear()
                            + " · Year " + student.getClassStructure().getYearOfStudy()
                            + " Sem " + student.getClassStructure().getSemester()
                        : null)
                .semester(student.getClassStructure() != null ? student.getClassStructure().getSemester()
                        : student.getClassBatch() != null ? student.getClassBatch().getSemester() : null)
                .classBatchAssigned(student.getClassBatch() != null)
                .build();
    }
}
