package com.collegeportal.modules.ia.controller;

import com.collegeportal.modules.ia.dto.request.IASaveRequestDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.service.IAService;
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
public class IAController {

    private final IAService iaService;

    @GetMapping
    public ResponseEntity<List<StudentIAResponseDTO>> getMarks(
            @RequestParam Long classStructureId,
            @RequestParam Long courseId) {
        return ResponseEntity.ok(iaService.getMarks(classStructureId, courseId));
    }

    @PostMapping
    public ResponseEntity<Void> saveMarks(@Valid @RequestBody IASaveRequestDTO request) {
        iaService.saveMarks(request);
        return ResponseEntity.noContent().build();
    }
}
