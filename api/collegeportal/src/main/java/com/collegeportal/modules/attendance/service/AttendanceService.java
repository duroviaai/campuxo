package com.collegeportal.modules.attendance.service;

import com.collegeportal.modules.attendance.dto.request.AttendanceBatchRequestDTO;
import com.collegeportal.modules.attendance.dto.request.AttendanceRequestDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.shared.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    AttendanceResponseDTO markAttendance(AttendanceRequestDTO request);

    List<AttendanceResponseDTO> markAttendanceBatch(List<AttendanceBatchRequestDTO> requests);

    List<AttendanceResponseDTO> getAttendanceByCourseAndDate(Long courseId, LocalDate date);

    List<AttendanceResponseDTO> getAttendanceByCourseClassAndDate(Long courseId, Long classId, LocalDate date);

    PageResponseDTO<AttendanceResponseDTO> getMyAttendance(Pageable pageable);
}
