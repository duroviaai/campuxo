package com.collegeportal.modules.course.mapper;

import com.collegeportal.modules.course.dto.request.CourseRequestDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toEntity(CourseRequestDTO dto) {
        return Course.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .credits(dto.getCredits())
                .programType(dto.getProgramType())
                .scheme(dto.getScheme())
                .specialization(dto.getSpecialization())
                .build();
    }

    /** Backward-compat overload used by callers that still pass a Faculty arg. */
    public Course toEntity(CourseRequestDTO dto, Object ignoredFaculty) {
        return toEntity(dto);
    }

    public CourseResponseDTO toResponseDTO(Course course, int studentCount, Boolean enrolled) {
        return toResponseDTO(course, studentCount, enrolled, null, null);
    }

    public CourseResponseDTO toResponseDTO(Course course, int studentCount, Boolean enrolled,
                                           Long facultyId, String facultyName) {
        return toResponseDTO(course, studentCount, enrolled, facultyId, facultyName, null);
    }

    public CourseResponseDTO toResponseDTO(Course course, int studentCount, Boolean enrolled,
                                           Long facultyId, String facultyName, String facultyDesignation) {
        return CourseResponseDTO.builder()
                .id(course.getId())
                .name(course.getName())
                .code(course.getCode())
                .credits(course.getCredits())
                .programType(course.getProgramType())
                .facultyId(facultyId)
                .facultyName(facultyName)
                .facultyDesignation(facultyDesignation)
                .studentCount(studentCount)
                .enrolled(enrolled)
                .specialization(course.getSpecialization())
                .build();
    }
}
