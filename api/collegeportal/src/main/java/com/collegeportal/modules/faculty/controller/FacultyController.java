package com.collegeportal.modules.faculty.controller;

import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.service.FacultyService;
import com.collegeportal.modules.facultyassignment.dto.response.FacultyCourseAssignmentResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.shared.dto.PageResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    // ── Admin: list / CRUD ────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<PageResponseDTO<FacultyResponseDTO>> getAllFaculty(
            @PageableDefault(size = 10, sort = "id") Pageable pageable,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(facultyService.getFilteredFaculty(department, search, status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<FacultyResponseDTO> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<FacultyResponseDTO> createFaculty(@Valid @RequestBody FacultyRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facultyService.createFaculty(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<FacultyResponseDTO> updateFaculty(@PathVariable Long id,
                                                            @Valid @RequestBody FacultyRequestDTO request) {
        return ResponseEntity.ok(facultyService.updateFaculty(id, request));
    }

    /** Deactivate / reactivate without deleting. */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<FacultyResponseDTO> updateStatus(@PathVariable Long id,
                                                           @RequestBody Map<String, String> body) {
        FacultyRequestDTO req = new FacultyRequestDTO();
        req.setStatus(body.get("status"));
        return ResponseEntity.ok(facultyService.updateFaculty(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.noContent().build();
    }

    // ── Admin: course assignment ──────────────────────────────────────────────

    @GetMapping("/{id}/courses")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<CourseResponseDTO>> getAssignedCourses(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getAssignedCourses(id));
    }

    @PostMapping("/{id}/courses")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> assignCourses(@PathVariable Long id,
                                              @RequestBody Map<String, List<Long>> body) {
        facultyService.assignCourses(id, body.get("courseIds"));
        return ResponseEntity.ok().build();
    }

    /** Assign class structures to a course for this faculty. */
    @PostMapping("/{id}/courses/{courseId}/classes")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> assignClassesToCourse(@PathVariable Long id,
                                                      @PathVariable Long courseId,
                                                      @RequestBody Map<String, List<Long>> body) {
        facultyService.assignClassesToCourse(id, courseId, body.get("classIds"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/courses/{courseId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> removeCourse(@PathVariable Long id, @PathVariable Long courseId) {
        facultyService.removeCourse(id, courseId);
        return ResponseEntity.noContent().build();
    }

    // ── Faculty self-service ──────────────────────────────────────────────────

    @GetMapping("/me/courses")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<CourseResponseDTO>> getMyCourses() {
        return ResponseEntity.ok(facultyService.getMyCourses());
    }

    @GetMapping("/me/attendance")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<AttendanceResponseDTO>> getMyAttendance() {
        return ResponseEntity.ok(facultyService.getMyAttendance());
    }

    @GetMapping("/me/courses/{courseId}/students")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<StudentResponseDTO>> getCourseStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(facultyService.getCourseStudents(courseId));
    }

    @GetMapping("/me/assignments")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<FacultyCourseAssignmentResponseDTO>> getMyAssignments() {
        return ResponseEntity.ok(facultyService.getMyAssignments());
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<FacultyResponseDTO> getMyProfile() {
        return ResponseEntity.ok(facultyService.getMyProfile());
    }
}
