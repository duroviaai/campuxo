package com.collegeportal.modules.course.controller;

import com.collegeportal.modules.course.dto.request.CourseRequestDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.service.CourseService;
import com.collegeportal.shared.dto.PagedResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<CourseResponseDTO> createCourse(@Valid @RequestBody CourseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STUDENT', 'ROLE_FACULTY')")
    public ResponseEntity<PagedResponseDTO<CourseResponseDTO>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String programType) {
        if (search != null || programType != null) {
            return ResponseEntity.ok(courseService.searchCourses(programType, search, page, size));
        }
        return ResponseEntity.ok(courseService.getAllCourses(page, size));
    }

    @GetMapping("/dept-counts")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<java.util.Map<String, Long>> getDeptCounts() {
        return ResponseEntity.ok(courseService.getDeptCourseCounts());
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Long> countByDeptAndScheme(
            @RequestParam String department,
            @RequestParam Long parentBatchId) {
        return ResponseEntity.ok(courseService.countByDeptAndScheme(department, parentBatchId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY', 'ROLE_STUDENT')")
    public ResponseEntity<CourseResponseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<com.collegeportal.modules.student.dto.response.StudentResponseDTO>> getCourseStudents(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseStudents(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<CourseResponseDTO> updateCourse(@PathVariable Long id,
                                                          @Valid @RequestBody CourseRequestDTO request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/programs")
    @PreAuthorize("hasAnyRole('ROLE_STUDENT', 'ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<String>> getPrograms() {
        return ResponseEntity.ok(courseService.getDistinctPrograms());
    }

    @GetMapping("/programs/{programType}")
    @PreAuthorize("hasAnyRole('ROLE_STUDENT', 'ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<CourseResponseDTO>> getCoursesByProgram(
            @PathVariable String programType,
            @RequestParam(required = false) String scheme) {
        if (scheme != null && !scheme.isBlank()) {
            return ResponseEntity.ok(courseService.getCoursesByProgramAndScheme(programType, scheme));
        }
        return ResponseEntity.ok(courseService.getCoursesByProgram(programType));
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<CourseResponseDTO> enrollStudent(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.enrollStudent(id));
    }

    @DeleteMapping("/{id}/enroll")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Void> unenrollStudent(@PathVariable Long id) {
        courseService.unenrollStudent(id);
        return ResponseEntity.noContent().build();
    }
}
