package com.collegeportal.modules.hod.controller;

import com.collegeportal.modules.attendance.dto.response.AttendanceSummaryDTO;
import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.hod.dto.response.FacultyCourseAssignmentDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.department.repository.DepartmentRepository;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.hod.dto.request.HodUpdateProfileRequestDTO;
import com.collegeportal.modules.hod.dto.response.HodStatsDTO;
import com.collegeportal.modules.hod.service.HodService;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hod")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_HOD')")
public class HodController {

    private final HodService hodService;
    private final DepartmentRepository departmentRepository;

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

    @GetMapping("/students/by-class-structure")
    public ResponseEntity<List<StudentResponseDTO>> getStudentsByClassStructure(
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(hodService.getDepartmentStudentsByClassStructure(classStructureId));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponseDTO>> getDepartmentCourses() {
        return ResponseEntity.ok(hodService.getDepartmentCourses());
    }

    @GetMapping("/courses/by-class-structure")
    public ResponseEntity<List<CourseResponseDTO>> getCoursesByClassStructure(
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(hodService.getDeptCoursesByClassStructure(classStructureId));
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<StudentAttendanceOverviewDTO>> getAttendanceOverview(
            @RequestParam Long courseId,
            @RequestParam Long classId) {
        return ResponseEntity.ok(hodService.getStudentAttendanceOverview(courseId, classId));
    }

    /** Assign a faculty to a course (optionally scoped to a class structure). */
    @PostMapping("/faculty/{facultyId}/assign-course")
    public ResponseEntity<Void> assignFacultyToCourse(
            @PathVariable Long facultyId,
            @RequestBody Map<String, Long> body) {
        hodService.assignFacultyToCourse(facultyId, body.get("courseId"), body.get("classStructureId"));
        return ResponseEntity.ok().build();
    }

    /** Replace the faculty assigned to a course (remove old, assign new). */
    @PutMapping("/courses/{courseId}/faculty")
    public ResponseEntity<Void> changeFacultyForCourse(
            @PathVariable Long courseId,
            @RequestBody Map<String, Long> body) {
        hodService.changeFacultyForCourse(courseId, body.get("newFacultyId"), body.get("classStructureId"));
        return ResponseEntity.ok().build();
    }

    /** Students + attendance performance for a course scoped to a class structure. */
    @GetMapping("/courses/{courseId}/students-performance")
    public ResponseEntity<List<StudentAttendanceOverviewDTO>> getCourseStudentsPerformance(
            @PathVariable Long courseId,
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(hodService.getCourseStudentsPerformance(courseId, classStructureId));
    }

    /** Per-course attendance summary for a single student. */
    @GetMapping("/students/{studentId}/performance")
    public ResponseEntity<List<AttendanceSummaryDTO>> getStudentPerformance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(hodService.getStudentPerformance(studentId));
    }

    /** All course assignments for a faculty with class structure info. */
    @GetMapping("/faculty/{facultyId}/assignments")
    public ResponseEntity<List<FacultyCourseAssignmentDTO>> getFacultyAssignments(
            @PathVariable Long facultyId) {
        return ResponseEntity.ok(hodService.getFacultyAssignments(facultyId));
    }

    /** Remove a faculty from a course. */
    @DeleteMapping("/faculty/{facultyId}/courses/{courseId}")
    public ResponseEntity<Void> removeFacultyFromCourse(
            @PathVariable Long facultyId,
            @PathVariable Long courseId) {
        hodService.removeFacultyFromCourse(facultyId, courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dept")
    public ResponseEntity<Map<String, Object>> getDept() {
        HodStatsDTO stats = hodService.getStats();
        return departmentRepository.findByName(stats.getDepartment())
                .map(d -> ResponseEntity.ok(Map.<String, Object>of("id", d.getId(), "name", d.getName())))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Returns the HOD's own faculty profile (id, name, etc.) */
    @GetMapping("/me")
    public ResponseEntity<FacultyResponseDTO> getMe() {
        return ResponseEntity.ok(hodService.getHodProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<FacultyResponseDTO> updateMyProfile(
            @Valid @RequestBody HodUpdateProfileRequestDTO request) {
        return ResponseEntity.ok(hodService.updateHodProfile(request));
    }
}
