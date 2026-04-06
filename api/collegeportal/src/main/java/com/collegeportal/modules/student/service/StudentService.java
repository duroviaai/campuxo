package com.collegeportal.modules.student.service;

import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.student.dto.request.StudentRequestDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.shared.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StudentService {

    StudentResponseDTO createStudent(StudentRequestDTO request);

    PageResponseDTO<StudentResponseDTO> getAllStudents(Pageable pageable);

    StudentResponseDTO getMyProfile();

    List<CourseResponseDTO> getMyCourses();
}
