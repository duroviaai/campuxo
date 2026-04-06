package com.collegeportal.modules.course.service;

import com.collegeportal.modules.course.dto.request.CourseRequestDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.shared.dto.PagedResponseDTO;
public interface CourseService {

    CourseResponseDTO createCourse(CourseRequestDTO request);

    PagedResponseDTO<CourseResponseDTO> getAllCourses(int page, int size);

    CourseResponseDTO enrollStudent(Long courseId);
}
