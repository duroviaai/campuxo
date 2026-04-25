package com.collegeportal.modules.classbatch.controller;

import com.collegeportal.modules.classbatch.dto.request.ClassBatchRequestDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchFilterDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.classbatch.service.ClassBatchService;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassBatchController {

    private final ClassBatchService classBatchService;

    @GetMapping("/departments")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<String>> getAllDepartments() {
        return ResponseEntity.ok(classBatchService.getAllDepartments());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<ClassBatchResponseDTO>> getAllClasses() {
        return ResponseEntity.ok(classBatchService.getAllClasses());
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ClassBatchResponseDTO> createClass(@Valid @RequestBody ClassBatchRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classBatchService.createClass(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ClassBatchResponseDTO> updateClass(@PathVariable Long id,
                                                             @Valid @RequestBody ClassBatchRequestDTO request) {
        return ResponseEntity.ok(classBatchService.updateClass(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        classBatchService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filters")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<ClassBatchFilterDTO> getFilters() {
        return ResponseEntity.ok(classBatchService.getFilters());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<ClassBatchResponseDTO>> getClassesByYearAndSection(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(classBatchService.getClassesByYearAndSection(year, section));
    }

    @GetMapping("/{classId}/students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<StudentResponseDTO>> getStudentsByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(classBatchService.getStudentsByClass(classId));
    }

    @GetMapping("/{classId}/courses")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<CourseResponseDTO>> getCoursesByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(classBatchService.getCoursesByClass(classId));
    }

    @PostMapping("/{classId}/courses")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> assignCoursesToClass(@PathVariable Long classId,
                                                     @RequestBody java.util.Map<String, java.util.List<Long>> body) {
        classBatchService.assignCoursesToClass(classId, body.get("courseIds"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{classId}/courses/{courseId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> removeCourseFromClass(@PathVariable Long classId,
                                                      @PathVariable Long courseId) {
        classBatchService.removeCourseFromClass(classId, courseId);
        return ResponseEntity.noContent().build();
    }
}
