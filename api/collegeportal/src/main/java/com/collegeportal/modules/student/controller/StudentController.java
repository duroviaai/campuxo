package com.collegeportal.modules.student.controller;

import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.student.dto.request.StudentRequestDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.service.StudentService;
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

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<StudentResponseDTO> createStudent(@Valid @RequestBody StudentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<PageResponseDTO<StudentResponseDTO>> getAllStudents(
            @PageableDefault(size = 10, sort = "id") Pageable pageable,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Long classBatchId,
            @RequestParam(required = false) String search) {
        if (department != null || classBatchId != null || search != null) {
            return ResponseEntity.ok(studentService.getFilteredStudents(department, classBatchId, search, pageable));
        }
        return ResponseEntity.ok(studentService.getAllStudents(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<StudentResponseDTO> getMyProfile() {
        return ResponseEntity.ok(studentService.getMyProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<StudentResponseDTO> updateMyProfile(@Valid @RequestBody StudentRequestDTO request) {
        return ResponseEntity.ok(studentService.updateMyProfile(request));
    }

    @GetMapping("/me/courses")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<CourseResponseDTO>> getMyCourses() {
        return ResponseEntity.ok(studentService.getMyCourses());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<StudentResponseDTO> updateStudent(@PathVariable Long id,
                                                            @Valid @RequestBody StudentRequestDTO request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
