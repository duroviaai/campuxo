package com.collegeportal.modules.hod.service;

import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.hod.dto.response.HodStatsDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;

import java.util.List;

public interface HodService {
    HodStatsDTO getStats();
    List<FacultyResponseDTO> getDepartmentFaculty();
    List<StudentResponseDTO> getDepartmentStudents();
    List<CourseResponseDTO> getDepartmentCourses();
    List<StudentAttendanceOverviewDTO> getStudentAttendanceOverview(Long courseId, Long classId);
}
