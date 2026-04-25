package com.collegeportal.modules.classstructure.controller;

import com.collegeportal.modules.classstructure.dto.request.ClassStructureRequestDTO;
import com.collegeportal.modules.classstructure.dto.response.ClassStructureResponseDTO;
import com.collegeportal.modules.classstructure.service.ClassStructureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/class-structure")
@RequiredArgsConstructor
public class ClassStructureController {

    private final ClassStructureService classStructureService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ClassStructureResponseDTO>> get(
            @RequestParam Long batchId,
            @RequestParam Long deptId,
            @RequestParam(required = false) Long specId) {
        return ResponseEntity.ok(classStructureService.getByBatchDeptSpec(batchId, deptId, specId));
    }

    /** Auto-creates the semester record if it doesn't exist yet (idempotent). */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ClassStructureResponseDTO> getOrCreate(
            @Valid @RequestBody ClassStructureRequestDTO req) {
        return ResponseEntity.ok(classStructureService.getOrCreate(req));
    }
}
