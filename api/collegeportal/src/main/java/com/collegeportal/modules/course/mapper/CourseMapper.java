package com.collegeportal.modules.course.mapper;

import com.collegeportal.modules.course.dto.request.CourseRequestDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.student.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toEntity(CourseRequestDTO dto, Faculty faculty) {
        return Course.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .credits(dto.getCredits())
                .programType(dto.getProgramType())
                .faculty(faculty)
                .build();
    }

    public CourseResponseDTO toResponseDTO(Course course) {
        return toResponseDTO(course, null);
    }

    public CourseResponseDTO toResponseDTO(Course course, Student currentStudent) {
        Faculty faculty = course.getFaculty();
        String facultyName = faculty != null
                ? faculty.getFirstName() + " " + faculty.getLastName()
                : null;

        Boolean enrolled = currentStudent != null
                ? course.getStudents().contains(currentStudent)
                : null;

        return CourseResponseDTO.builder()
                .id(course.getId())
                .name(course.getName())
                .code(course.getCode())
                .credits(course.getCredits())
                .programType(course.getProgramType())
                .facultyId(faculty != null ? faculty.getId() : null)
                .facultyName(facultyName)
                .studentCount(course.getStudents().size())
                .enrolled(enrolled)
                .build();
    }
}
