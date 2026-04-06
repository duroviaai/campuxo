package com.collegeportal.modules.course.service;

import com.collegeportal.modules.course.dto.request.CourseRequestDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.shared.dto.PagedResponseDTO;

import java.util.List;

public interface CourseService {

    CourseResponseDTO updateCourse(Long id, CourseRequestDTO request);

    void deleteCourse(Long id);

    CourseResponseDTO createCourse(CourseRequestDTO request);

    PagedResponseDTO<CourseResponseDTO> getAllCourses(int page, int size);

    CourseResponseDTO getCourseById(Long id);

    List<com.collegeportal.modules.student.dto.response.StudentResponseDTO> getCourseStudents(Long id);

    List<CourseResponseDTO> getCoursesByProgram(String programType);

    List<String> getDistinctPrograms();

    CourseResponseDTO enrollStudent(Long courseId);

    void unenrollStudent(Long courseId);
}
