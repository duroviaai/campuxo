package com.collegeportal.modules.course.controller;

import com.collegeportal.modules.batch.entity.Batch;
import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.attendance.repository.AttendanceRepository;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.entity.ClassStructureCourse;
import com.collegeportal.modules.classstructure.repository.ClassStructureCourseRepository;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.modules.department.repository.DepartmentRepository;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/courses")
@RequiredArgsConstructor
public class CourseAdminController {

    private final CourseRepository courseRepository;
    private final ClassStructureRepository classStructureRepository;
    private final ClassStructureCourseRepository cscRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseMapper courseMapper;
    private final AttendanceRepository attendanceRepository;
    private final FacultyCourseAssignmentRepository assignmentRepository;

    /** List courses assigned to a class structure (semester). */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CourseResponseDTO>> getByCsId(@RequestParam Long classStructureId) {
        return ResponseEntity.ok(
            cscRepository.findByClassStructureId(classStructureId).stream()
                .map(csc -> courseMapper.toResponseDTO(csc.getCourse(), 0, null))
                .toList()
        );
    }

    /** Create a new course and optionally assign it to a class structure. */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public ResponseEntity<CourseResponseDTO> create(@Valid @RequestBody CourseCreateRequest req) {
        Department dept = req.getDepartmentId() != null
                ? departmentRepository.findById(req.getDepartmentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found"))
                : null;

        // Derive scheme from the class structure's batch
        String scheme = null;
        if (req.getClassStructureId() != null) {
            ClassStructure cs = classStructureRepository.findById(req.getClassStructureId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class structure not found"));
            scheme = cs.getBatch().getScheme();
        }

        if (dept != null && scheme != null
                && courseRepository.existsByCodeAndDepartmentIdAndScheme(req.getCode(), req.getDepartmentId(), scheme))
            throw new BadRequestException("Course code '" + req.getCode() + "' already exists in this department for scheme " + scheme);

        Course course = courseRepository.save(Course.builder()
                .name(req.getName()).code(req.getCode()).credits(req.getCredits())
                .department(dept).scheme(scheme).build());

        if (req.getClassStructureId() != null) {
            doAssign(req.getClassStructureId(), course.getId());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(courseMapper.toResponseDTO(course, 0, null));
    }

    /** Assign an existing course to a class structure. */
    @PostMapping("/assign")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public ResponseEntity<Void> assign(@RequestParam Long classStructureId, @RequestParam Long courseId) {
        if (cscRepository.existsByClassStructureIdAndCourseId(classStructureId, courseId))
            throw new BadRequestException("Course already assigned to this semester");
        doAssign(classStructureId, courseId);
        return ResponseEntity.ok().build();
    }

    /** Unassign (remove mapping only — course record stays). */
    @DeleteMapping("/unassign")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public ResponseEntity<Void> unassign(@RequestParam Long classStructureId, @RequestParam Long courseId) {
        cscRepository.findByClassStructureIdAndCourseId(classStructureId, courseId)
                .ifPresent(cscRepository::delete);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete a course entirely.
     * Returns 409 + usage count if used elsewhere and confirmed=false.
     * Pass confirmed=true to force-delete.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean confirmed) {

        courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        long usages = cscRepository.countUsagesByCourseId(id);

        if (usages > 0 && !confirmed) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "usages", usages,
                    "message", "This course is used in " + usages + " semester(s). Confirm to delete."));
        }
        attendanceRepository.deleteByCourseId(id);
        assignmentRepository.deleteByCourseId(id);
        cscRepository.deleteByCourseId(id);
        courseRepository.removeCourseStudents(id);
        courseRepository.removeCourseClassBatches(id);
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** List all courses belonging to a department, filtered by scheme when classStructureId is provided. */
    @GetMapping("/by-dept")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FACULTY')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CourseResponseDTO>> getByDept(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) Long classStructureId) {
        if (departmentId == null && (departmentName == null || departmentName.isBlank()))
            return ResponseEntity.badRequest().build();

        String progType = departmentName;
        if (progType == null && departmentId != null)
            progType = departmentRepository.findById(departmentId).map(Department::getName).orElse(null);

        // Derive scheme from class structure to filter courses
        String scheme = null;
        if (classStructureId != null) {
            scheme = classStructureRepository.findById(classStructureId)
                    .map(cs -> cs.getBatch().getScheme()).orElse(null);
        }

        List<Course> courses = courseRepository.findByDepartmentIdOrProgramTypeAndScheme(departmentId, progType, scheme, classStructureId);
        return ResponseEntity.ok(
            courses.stream().map(c -> courseMapper.toResponseDTO(c, 0, null)).toList()
        );
    }

    /** Check if a course code already exists in a department for a given scheme. */
    @GetMapping("/check-code")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> checkCode(
            @RequestParam String code,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long classStructureId) {
        String scheme = null;
        if (classStructureId != null) {
            scheme = classStructureRepository.findById(classStructureId)
                    .map(cs -> cs.getBatch().getScheme()).orElse(null);
        }
        boolean exists = departmentId != null && scheme != null
                ? courseRepository.existsByCodeAndDepartmentIdAndScheme(code, departmentId, scheme)
                : departmentId != null
                ? courseRepository.existsByCodeAndDepartmentId(code, departmentId)
                : courseRepository.existsByCode(code);
        CourseResponseDTO existing = exists && departmentId != null && scheme != null
                ? courseRepository.findByCodeAndDepartmentIdAndScheme(code, departmentId, scheme)
                        .map(c -> courseMapper.toResponseDTO(c, 0, null)).orElse(null)
                : exists && departmentId != null
                ? courseRepository.findByCodeAndDepartmentId(code, departmentId)
                        .map(c -> courseMapper.toResponseDTO(c, 0, null)).orElse(null)
                : null;
        return ResponseEntity.ok(Map.of("exists", exists, "course",
                existing != null ? existing : Map.of()));
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private void doAssign(Long classStructureId, Long courseId) {
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("Class structure not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        cscRepository.save(ClassStructureCourse.builder().classStructure(cs).course(course).build());
    }

    @Getter @Setter
    static class CourseCreateRequest {
        @NotBlank private String name;
        @NotBlank private String code;
        private Integer credits;
        private Long departmentId;
        private Long classStructureId;
    }
}
