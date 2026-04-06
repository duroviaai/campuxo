package com.collegeportal.modules.course.mapper;

import com.collegeportal.modules.course.dto.request.CourseRequestDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.faculty.entity.Faculty;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toEntity(CourseRequestDTO dto, Faculty faculty) {
        return Course.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .credits(dto.getCredits())
                .faculty(faculty)
                .build();
    }

    public CourseResponseDTO toResponseDTO(Course course) {
        Faculty faculty = course.getFaculty();
        String facultyName = faculty != null
                ? faculty.getFirstName() + " " + faculty.getLastName()
                : null;

        return CourseResponseDTO.builder()
                .id(course.getId())
                .name(course.getName())
                .code(course.getCode())
                .credits(course.getCredits())
                .facultyName(facultyName)
                .studentCount(course.getStudents().size())
                .build();
    }
}
