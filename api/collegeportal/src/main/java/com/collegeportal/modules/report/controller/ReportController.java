package com.collegeportal.modules.report.controller;

import com.collegeportal.modules.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/attendance/excel")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD', 'ROLE_FACULTY')")
    public ResponseEntity<byte[]> downloadAttendanceExcel(
            @RequestParam Long classStructureId,
            @RequestParam Long courseId) {
        byte[] data = reportService.generateAttendanceExcel(classStructureId, courseId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance_report.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/attendance/pdf")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD', 'ROLE_FACULTY')")
    public ResponseEntity<byte[]> downloadAttendancePdf(
            @RequestParam Long classStructureId,
            @RequestParam Long courseId) {
        byte[] data = reportService.generateAttendancePdf(classStructureId, courseId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @GetMapping("/students/excel")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<byte[]> downloadStudentList(
            @RequestParam(required = false) String department) {
        byte[] data = reportService.generateStudentListExcel(department);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
