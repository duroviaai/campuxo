package com.collegeportal.modules.attendance.controller;

import com.collegeportal.modules.attendance.dto.request.AttendanceBatchRequestDTO;
import com.collegeportal.modules.attendance.dto.request.AttendanceRequestDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceSummaryDTO;
import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.attendance.service.AttendanceService;
import com.collegeportal.shared.dto.PageResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<AttendanceResponseDTO> markAttendance(@Valid @RequestBody AttendanceRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.markAttendance(request));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<AttendanceResponseDTO>> markAttendanceBatch(
            @Valid @RequestBody List<AttendanceBatchRequestDTO> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.markAttendanceBatch(requests));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceByCourseAndDate(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByCourseAndDate(courseId, date));
    }

    @GetMapping("/course/{courseId}/class/{classId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceByCourseClassAndDate(
            @PathVariable Long courseId,
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByCourseClassAndDate(courseId, classId, date));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<PageResponseDTO<AttendanceResponseDTO>> getMyAttendance(
            @PageableDefault(size = 10, sort = "date") Pageable pageable) {
        return ResponseEntity.ok(attendanceService.getMyAttendance(pageable));
    }

    @GetMapping("/me/summary")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<AttendanceSummaryDTO>> getMyAttendanceSummary() {
        return ResponseEntity.ok(attendanceService.getMyAttendanceSummary());
    }

    @GetMapping("/student/{studentId}/summary")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<AttendanceSummaryDTO>> getStudentAttendanceSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummary(studentId));
    }

    @GetMapping("/class/{classId}/course/{courseId}/overview")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<StudentAttendanceOverviewDTO>> getClassCourseOverview(
            @PathVariable Long classId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getClassCourseOverview(classId, courseId));
    }
}
