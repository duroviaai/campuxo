package com.collegeportal.modules.hod.controller;

import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.hod.dto.response.HodStatsDTO;
import com.collegeportal.modules.hod.service.HodService;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hod")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_HOD')")
public class HodController {

    private final HodService hodService;

    @GetMapping("/stats")
    public ResponseEntity<HodStatsDTO> getStats() {
        return ResponseEntity.ok(hodService.getStats());
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<FacultyResponseDTO>> getDepartmentFaculty() {
        return ResponseEntity.ok(hodService.getDepartmentFaculty());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentResponseDTO>> getDepartmentStudents() {
        return ResponseEntity.ok(hodService.getDepartmentStudents());
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponseDTO>> getDepartmentCourses() {
        return ResponseEntity.ok(hodService.getDepartmentCourses());
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<StudentAttendanceOverviewDTO>> getAttendanceOverview(
            @RequestParam Long courseId,
            @RequestParam Long classId) {
        return ResponseEntity.ok(hodService.getStudentAttendanceOverview(courseId, classId));
    }
}
