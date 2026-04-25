package com.collegeportal.modules.department.controller;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.modules.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY', 'ROLE_STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
            departmentRepository.findAll().stream()
                .sorted((a, b) -> a.getName().compareTo(b.getName()))
                .map(d -> Map.<String, Object>of("id", d.getId(), "name", d.getName()))
                .toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> create(@RequestBody DepartmentRequest body) {
        String name = body.getName();
        if (name == null || name.isBlank()) throw new BadRequestException("Name is required");
        if (departmentRepository.existsByName(name.trim())) throw new BadRequestException("Department already exists");
        Department saved = departmentRepository.save(Department.builder().name(name.trim()).build());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", saved.getId(), "name", saved.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        departmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @lombok.Getter @lombok.Setter
    static class DepartmentRequest { private String name; }
}
