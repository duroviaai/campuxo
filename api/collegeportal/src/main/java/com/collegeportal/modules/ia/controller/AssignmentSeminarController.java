package com.collegeportal.modules.ia.controller;

import com.collegeportal.modules.ia.dto.request.AssignmentSaveRequestDTO;
import com.collegeportal.modules.ia.dto.request.SeminarSaveRequestDTO;
import com.collegeportal.modules.ia.dto.response.StudentAssignmentResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentSeminarResponseDTO;
import com.collegeportal.modules.ia.service.impl.AssignmentSeminarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ia")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AssignmentSeminarController {

    private final AssignmentSeminarService service;

    @GetMapping("/assignments")
    public ResponseEntity<List<StudentAssignmentResponseDTO>> getAssignments(
            @RequestParam Long classStructureId, @RequestParam Long courseId) {
        return ResponseEntity.ok(service.getAssignments(classStructureId, courseId));
    }

    @PostMapping("/assignments")
    public ResponseEntity<Void> saveAssignments(@Valid @RequestBody AssignmentSaveRequestDTO req) {
        service.saveAssignments(req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seminars")
    public ResponseEntity<List<StudentSeminarResponseDTO>> getSeminars(
            @RequestParam Long classStructureId, @RequestParam Long courseId) {
        return ResponseEntity.ok(service.getSeminars(classStructureId, courseId));
    }

    @PostMapping("/seminars")
    public ResponseEntity<Void> saveSeminars(@Valid @RequestBody SeminarSaveRequestDTO req) {
        service.saveSeminars(req);
        return ResponseEntity.noContent().build();
    }
}
