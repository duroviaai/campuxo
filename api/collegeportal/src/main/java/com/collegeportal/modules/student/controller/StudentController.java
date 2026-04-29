package com.collegeportal.modules.student.controller;

import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.student.dto.request.StudentRequestDTO;
import com.collegeportal.modules.student.dto.response.ClassmateResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentAlertDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentStatsDTO;
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
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<StudentResponseDTO> adminCreateStudent(@Valid @RequestBody StudentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.adminCreateStudent(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<PageResponseDTO<StudentResponseDTO>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Long classBatchId,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(studentService.getAllStudents(pageable, search, department, classBatchId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<StudentResponseDTO> getMyProfile() {
        return ResponseEntity.ok(studentService.getMyProfile());
    }

    @GetMapping("/me/profile-status")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<java.util.Map<String, Boolean>> getProfileStatus() {
        StudentResponseDTO profile = studentService.getMyProfile();
        boolean complete = profile.getPhone() != null && profile.getDepartment() != null
                && profile.getDateOfBirth() != null && profile.getYearOfStudy() != null
                && profile.getCourseStartYear() != null && profile.getCourseEndYear() != null;
        return ResponseEntity.ok(java.util.Map.of("profileComplete", complete));
    }

    @PostMapping(value = "/me/photo", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<StudentResponseDTO> uploadPhoto(@RequestParam("photo") MultipartFile photo) {
        return ResponseEntity.ok(studentService.uploadPhoto(photo));
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

    @GetMapping("/me/class/courses")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<CourseResponseDTO>> getMyClassCourses() {
        return ResponseEntity.ok(studentService.getMyClassCourses());
    }

    @GetMapping("/me/stats")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<StudentStatsDTO> getMyStats() {
        return ResponseEntity.ok(studentService.getMyStats());
    }

    @GetMapping("/me/alerts")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<StudentAlertDTO>> getMyAlerts() {
        return ResponseEntity.ok(studentService.getMyAlerts());
    }

    @GetMapping("/me/courses/{courseId}/classmates")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<ClassmateResponseDTO>> getMyClassmates(@PathVariable Long courseId) {
        return ResponseEntity.ok(studentService.getMyClassmates(courseId));
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
