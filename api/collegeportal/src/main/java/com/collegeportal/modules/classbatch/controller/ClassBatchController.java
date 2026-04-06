package com.collegeportal.modules.classbatch.controller;

import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.classbatch.service.ClassBatchService;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassBatchController {

    private final ClassBatchService classBatchService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<ClassBatchResponseDTO>> getAllClasses() {
        return ResponseEntity.ok(classBatchService.getAllClasses());
    }

    @GetMapping("/{classId}/students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    public ResponseEntity<List<StudentResponseDTO>> getStudentsByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(classBatchService.getStudentsByClass(classId));
    }
}
