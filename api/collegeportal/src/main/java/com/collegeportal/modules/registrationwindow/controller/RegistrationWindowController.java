package com.collegeportal.modules.registrationwindow.controller;

import com.collegeportal.modules.registrationwindow.dto.request.RegistrationWindowRequestDTO;
import com.collegeportal.modules.registrationwindow.dto.response.RegistrationWindowResponseDTO;
import com.collegeportal.modules.registrationwindow.service.RegistrationWindowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RegistrationWindowController {

    private final RegistrationWindowService windowService;

    // ── Admin endpoints ──────────────────────────────────────────────────────

    @GetMapping("/api/v1/admin/registration-windows")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<RegistrationWindowResponseDTO>> getAll() {
        return ResponseEntity.ok(windowService.getAll());
    }

    @GetMapping("/api/v1/admin/registration-windows/active")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<RegistrationWindowResponseDTO>> getActiveForRole(@RequestParam String role) {
        return ResponseEntity.ok(windowService.getActiveForRole(role));
    }

    @PostMapping("/api/v1/admin/registration-windows")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RegistrationWindowResponseDTO> create(@Valid @RequestBody RegistrationWindowRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(windowService.create(request));
    }

    @PutMapping("/api/v1/admin/registration-windows/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RegistrationWindowResponseDTO> update(@PathVariable Long id,
                                                                @Valid @RequestBody RegistrationWindowRequestDTO request) {
        return ResponseEntity.ok(windowService.update(id, request));
    }

    @DeleteMapping("/api/v1/admin/registration-windows/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        windowService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/v1/admin/registration-windows/{id}/toggle")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> toggleActive(@PathVariable Long id) {
        windowService.toggleActive(id);
        return ResponseEntity.noContent().build();
    }

    // ── Public endpoint ──────────────────────────────────────────────────────

    @GetMapping("/api/v1/registration-windows/open")
    public ResponseEntity<List<RegistrationWindowResponseDTO>> getOpenWindows(@RequestParam String role) {
        LocalDate today = LocalDate.now();
        List<RegistrationWindowResponseDTO> windows = windowService.getActiveForRole(role).stream()
                .filter(w -> !today.isBefore(w.getOpenDate()) && !today.isAfter(w.getCloseDate()))
                .toList();
        return ResponseEntity.ok(windows);
    }
}
