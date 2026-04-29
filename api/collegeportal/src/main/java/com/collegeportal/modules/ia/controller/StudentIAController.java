package com.collegeportal.modules.ia.controller;

import com.collegeportal.modules.ia.dto.response.StudentAssignmentResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentFinalMarksResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentSeminarResponseDTO;
import com.collegeportal.modules.ia.service.StudentIAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students/me/ia")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_STUDENT')")
public class StudentIAController {

    private final StudentIAService studentIAService;

    @GetMapping("/class-structure-id")
    public ResponseEntity<Long> getMyClassStructureId() {
        return ResponseEntity.ok(studentIAService.getMyClassStructureId());
    }

    @GetMapping
    public ResponseEntity<StudentIAResponseDTO> getMyIAMarks(
            @RequestParam Long courseId,
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(studentIAService.getMyIAMarks(courseId, classStructureId));
    }

    @GetMapping("/assignments")
    public ResponseEntity<StudentAssignmentResponseDTO> getMyAssignment(
            @RequestParam Long courseId,
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(studentIAService.getMyAssignment(courseId, classStructureId));
    }

    @GetMapping("/seminars")
    public ResponseEntity<StudentSeminarResponseDTO> getMySeminar(
            @RequestParam Long courseId,
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(studentIAService.getMySeminar(courseId, classStructureId));
    }

    @GetMapping("/final-marks")
    public ResponseEntity<StudentFinalMarksResponseDTO> getMyFinalMarks(
            @RequestParam Long courseId,
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(studentIAService.getMyFinalMarks(courseId, classStructureId));
    }
}
