package com.collegeportal.modules.faculty.service;

import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.facultyassignment.dto.response.FacultyCourseAssignmentResponseDTO;
import com.collegeportal.shared.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FacultyService {

    PageResponseDTO<FacultyResponseDTO> getAllFaculty(Pageable pageable);

    FacultyResponseDTO getFacultyById(Long id);

    FacultyResponseDTO createFaculty(FacultyRequestDTO request);

    FacultyResponseDTO updateFaculty(Long id, FacultyRequestDTO request);

    void deleteFaculty(Long id);

    List<CourseResponseDTO> getMyCourses();

    List<AttendanceResponseDTO> getMyAttendance();

    List<FacultyCourseAssignmentResponseDTO> getMyAssignments();
}
