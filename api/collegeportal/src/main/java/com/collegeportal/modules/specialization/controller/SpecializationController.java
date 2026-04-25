package com.collegeportal.modules.specialization.controller;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.modules.department.repository.DepartmentRepository;
import com.collegeportal.modules.specialization.entity.Specialization;
import com.collegeportal.modules.specialization.repository.SpecializationRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/specializations")
@RequiredArgsConstructor
public class SpecializationController {

    private final SpecializationRepository specializationRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY', 'ROLE_STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getAll(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) String scheme) {

        List<Specialization> list;
        if (deptId != null) {
            list = scheme != null
                    ? specializationRepository.findByDepartmentRefIdAndScheme(deptId, scheme)
                    : specializationRepository.findByDepartmentRefId(deptId);
        } else if (department != null && scheme != null) {
            list = specializationRepository.findByDepartmentAndScheme(department, scheme);
        } else if (department != null) {
            list = specializationRepository.findByDepartment(department);
        } else {
            list = specializationRepository.findAll();
        }

        return ResponseEntity.ok(list.stream().map(s -> Map.<String, Object>of(
                "id", s.getId(), "name", s.getName(),
                "department", s.getDepartment(), "scheme", s.getScheme())).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> create(@RequestBody SpecializationRequest body) {
        if (body.getName() == null || body.getName().isBlank()) throw new BadRequestException("Name is required");
        if (body.getDepartment() == null || body.getDepartment().isBlank()) throw new BadRequestException("Department is required");
        if (body.getScheme() == null || body.getScheme().isBlank()) throw new BadRequestException("Scheme is required");
        if (specializationRepository.existsByNameAndDepartmentAndScheme(
                body.getName().trim(), body.getDepartment().trim(), body.getScheme().trim()))
            throw new BadRequestException("Specialization already exists");

        Department deptRef = body.getDeptId() != null
                ? departmentRepository.findById(body.getDeptId()).orElse(null) : null;

        specializationRepository.save(Specialization.builder()
                .name(body.getName().trim())
                .department(body.getDepartment().trim())
                .scheme(body.getScheme().trim())
                .departmentRef(deptRef)
                .build());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        specializationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Getter @Setter
    static class SpecializationRequest {
        private String name;
        private String department;
        private String scheme;
        private Long   deptId;
    }
}
