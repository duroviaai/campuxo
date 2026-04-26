package com.collegeportal.modules.faculty.service;

import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.facultyassignment.dto.response.FacultyCourseAssignmentResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.shared.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FacultyService {

    PageResponseDTO<FacultyResponseDTO> getAllFaculty(Pageable pageable);

    PageResponseDTO<FacultyResponseDTO> getFilteredFaculty(String department, String search, Pageable pageable);

    PageResponseDTO<FacultyResponseDTO> getFilteredFaculty(String department, String search, String status, Pageable pageable);

    FacultyResponseDTO getFacultyById(Long id);

    FacultyResponseDTO createFaculty(FacultyRequestDTO request);

    FacultyResponseDTO updateFaculty(Long id, FacultyRequestDTO request);

    void deleteFaculty(Long id);

    List<CourseResponseDTO> getMyCourses();

    List<AttendanceResponseDTO> getMyAttendance();

    List<FacultyCourseAssignmentResponseDTO> getMyAssignments();

    FacultyResponseDTO getMyProfile();

    List<CourseResponseDTO> getAssignedCourses(Long facultyId);

    void assignCourses(Long facultyId, List<Long> courseIds);

    void removeCourse(Long facultyId, Long courseId);

    void assignClassesToCourse(Long facultyId, Long courseId, List<Long> classStructureIds);

    List<StudentResponseDTO> getCourseStudents(Long courseId);
}
