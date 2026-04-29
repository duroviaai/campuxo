package com.collegeportal.modules.timetable.controller;

import com.collegeportal.modules.timetable.dto.request.TimetableEntryRequestDTO;
import com.collegeportal.modules.timetable.dto.response.TimetableEntryResponseDTO;
import com.collegeportal.modules.timetable.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<TimetableEntryResponseDTO>> getMyTimetable() {
        return ResponseEntity.ok(timetableService.getMyTimetable());
    }

    @GetMapping("/faculty/me")
    @PreAuthorize("hasAnyRole('ROLE_FACULTY', 'ROLE_HOD')")
    public ResponseEntity<List<TimetableEntryResponseDTO>> getMyFacultyTimetable() {
        return ResponseEntity.ok(timetableService.getMyFacultyTimetable());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<List<TimetableEntryResponseDTO>> getByClassStructure(
            @RequestParam Long classStructureId) {
        return ResponseEntity.ok(timetableService.getByClassStructure(classStructureId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<TimetableEntryResponseDTO> create(
            @Valid @RequestBody TimetableEntryRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<TimetableEntryResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody TimetableEntryRequestDTO request) {
        return ResponseEntity.ok(timetableService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HOD')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        timetableService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
