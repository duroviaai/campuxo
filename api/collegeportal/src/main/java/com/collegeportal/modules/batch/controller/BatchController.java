package com.collegeportal.modules.batch.controller;

import com.collegeportal.modules.batch.dto.request.BatchRequestDTO;
import com.collegeportal.modules.batch.dto.response.BatchResponseDTO;
import com.collegeportal.modules.batch.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<List<BatchResponseDTO>> getAll() {
        return ResponseEntity.ok(batchService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<BatchResponseDTO> create(@Valid @RequestBody BatchRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(batchService.create(req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        batchService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
