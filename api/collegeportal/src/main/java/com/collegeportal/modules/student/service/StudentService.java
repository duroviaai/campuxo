package com.collegeportal.modules.student.service;

import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.student.dto.request.StudentRequestDTO;
import com.collegeportal.modules.student.dto.response.ClassmateResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentAlertDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentStatsDTO;
import com.collegeportal.shared.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentService {

    StudentResponseDTO getStudentById(Long id);

    StudentResponseDTO updateStudent(Long id, StudentRequestDTO request);

    void deleteStudent(Long id);

    StudentResponseDTO createStudent(StudentRequestDTO request);

    StudentResponseDTO adminCreateStudent(StudentRequestDTO request);

    PageResponseDTO<StudentResponseDTO> getAllStudents(Pageable pageable, String search, String department, Long classBatchId);

    StudentResponseDTO getMyProfile();

    StudentResponseDTO updateMyProfile(StudentRequestDTO request);

    StudentResponseDTO uploadPhoto(MultipartFile file);

    List<CourseResponseDTO> getMyCourses();

    List<CourseResponseDTO> getMyClassCourses();

    StudentStatsDTO getMyStats();

    List<ClassmateResponseDTO> getMyClassmates(Long courseId);

    List<StudentAlertDTO> getMyAlerts();
}
