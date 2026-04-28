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
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<List<ClassStructureResponseDTO>> get(
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Long specId) {
        if (batchId == null && deptId == null) {
            return ResponseEntity.ok(classStructureService.getAll());
        }
        return ResponseEntity.ok(classStructureService.getByBatchDeptSpec(batchId, deptId, specId));
    }

    /** Auto-creates the semester record if it doesn't exist yet (idempotent). */
    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<ClassStructureResponseDTO> getOrCreate(
            @Valid @RequestBody ClassStructureRequestDTO req) {
        return ResponseEntity.ok(classStructureService.getOrCreate(req));
    }
}
