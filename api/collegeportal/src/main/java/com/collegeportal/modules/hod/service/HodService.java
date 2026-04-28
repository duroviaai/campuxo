package com.collegeportal.modules.hod.service;

import com.collegeportal.modules.attendance.dto.response.AttendanceSummaryDTO;
import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.hod.dto.response.FacultyCourseAssignmentDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.hod.dto.response.HodStatsDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;

import java.util.List;

public interface HodService {
    HodStatsDTO getStats();
    List<FacultyResponseDTO> getDepartmentFaculty();
    List<StudentResponseDTO> getDepartmentStudents();
    List<StudentResponseDTO> getDepartmentStudentsByClassStructure(Long classStructureId);
    List<CourseResponseDTO> getDepartmentCourses();
    List<CourseResponseDTO> getDeptCoursesByClassStructure(Long classStructureId);
    List<StudentAttendanceOverviewDTO> getStudentAttendanceOverview(Long courseId, Long classId);
    void assignFacultyToCourse(Long facultyId, Long courseId, Long classStructureId);
    void changeFacultyForCourse(Long courseId, Long newFacultyId, Long classStructureId);
    void removeFacultyFromCourse(Long facultyId, Long courseId);
    List<StudentAttendanceOverviewDTO> getCourseStudentsPerformance(Long courseId, Long classStructureId);
    List<AttendanceSummaryDTO> getStudentPerformance(Long studentId);
    List<FacultyCourseAssignmentDTO> getFacultyAssignments(Long facultyId);
    FacultyResponseDTO getHodProfile();
}
