package com.collegeportal.modules.attendance.service;

import com.collegeportal.modules.attendance.dto.request.AttendanceBatchRequestDTO;
import com.collegeportal.modules.attendance.dto.request.AttendanceRequestDTO;
import com.collegeportal.modules.attendance.dto.request.AttendanceUpdateRequestDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceSummaryDTO;
import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.shared.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    AttendanceResponseDTO markAttendance(AttendanceRequestDTO request);

    AttendanceResponseDTO updateAttendance(Long id, AttendanceUpdateRequestDTO request);

    List<AttendanceResponseDTO> markAttendanceBatch(List<AttendanceBatchRequestDTO> requests);

    List<AttendanceResponseDTO> getAttendanceByCourseAndDate(Long courseId, LocalDate date);

    List<AttendanceResponseDTO> getAttendanceByCourseClassAndDate(Long courseId, Long classId, LocalDate date);

    PageResponseDTO<AttendanceResponseDTO> getMyAttendance(Pageable pageable);

    List<AttendanceSummaryDTO> getMyAttendanceSummary();

    List<AttendanceSummaryDTO> getStudentAttendanceSummary(Long studentId);

    /** Returns one row per student in the class for the given course — used by admin/faculty overview table */
    List<StudentAttendanceOverviewDTO> getClassCourseOverview(Long classId, Long courseId);

    /** Same overview but keyed by ClassStructure (admin courses flow) */
    List<StudentAttendanceOverviewDTO> getOverviewByClassStructure(Long classStructureId, Long courseId);

    /** Attendance records for a course on a date, scoped to a ClassStructure */
    List<AttendanceResponseDTO> getAttendanceByCourseAndClassStructure(Long courseId, Long classStructureId, LocalDate date);

    /** Attendance records for a course within a date range, scoped to the current faculty */
    List<AttendanceResponseDTO> getAttendanceByCourseAndDateRange(Long courseId, LocalDate startDate, LocalDate endDate);
}
