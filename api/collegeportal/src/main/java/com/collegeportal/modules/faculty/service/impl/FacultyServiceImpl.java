package com.collegeportal.modules.faculty.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.attendance.mapper.AttendanceMapper;
import com.collegeportal.modules.attendance.repository.AttendanceRepository;
import com.collegeportal.modules.auth.entity.Role;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.RoleRepository;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.mapper.FacultyMapper;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.faculty.service.FacultyService;
import com.collegeportal.modules.facultyassignment.dto.response.FacultyCourseAssignmentResponseDTO;
import com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.shared.dto.PageResponseDTO;
import com.collegeportal.shared.enums.FacultyStatus;
import com.collegeportal.shared.enums.RoleType;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final FacultyMapper facultyMapper;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceMapper attendanceMapper;
    private final SecurityUtils securityUtils;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final FacultyCourseAssignmentRepository assignmentRepository;
    private final ClassStructureRepository classStructureRepository;
    private final StudentMapper studentMapper;

    // ── Admin: CRUD ───────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<FacultyResponseDTO> getAllFaculty(Pageable pageable) {
        return PageResponseDTO.from(
                facultyRepository.findAll(pageable).map(f ->
                        facultyMapper.toResponseDTO(f, (int) courseRepository.countAssignedCoursesByFacultyId(f.getId())))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<FacultyResponseDTO> getFilteredFaculty(String department, String search, Pageable pageable) {
        return getFilteredFaculty(department, search, null, pageable);
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<FacultyResponseDTO> getFilteredFaculty(String department, String search,
                                                                   String status, Pageable pageable) {
        String d = department != null ? department.trim() : "";
        String s = search     != null ? search.trim()     : "";
        String st = status    != null ? status.trim()     : "";
        return PageResponseDTO.from(
                facultyRepository.findWithFilters(d, s, st, pageable)
                        .map(f -> facultyMapper.toResponseDTO(f,
                                (int) courseRepository.countAssignedCoursesByFacultyId(f.getId())))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDTO getFacultyById(Long id) {
        Faculty f = getFaculty(id);
        return facultyMapper.toResponseDTO(f, (int) courseRepository.countAssignedCoursesByFacultyId(id));
    }

    @Override
    @Transactional
    public FacultyResponseDTO createFaculty(FacultyRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }
        Role facultyRole = roleRepository.findByName(RoleType.ROLE_FACULTY)
                .orElseThrow(() -> new ResourceNotFoundException("ROLE_FACULTY not found"));

        String fullName = request.getName() != null ? request.getName().trim() : "";
        String[] parts  = fullName.split(" ", 2);

        User user = User.builder()
                .fullName(fullName)
                .email(request.getEmail())
                .facultyId(request.getFacultyId())
                .password(passwordEncoder.encode("changeme"))
                .enabled(true)
                .approved(true)
                .roles(Set.of(facultyRole))
                .build();
        user = userRepository.save(user);

        Faculty faculty = Faculty.builder()
                .firstName(parts[0])
                .lastName(parts.length > 1 ? parts[1] : "")
                .department(request.getDepartment())
                .phone(request.getPhone())
                .designation(request.getDesignation())
                .user(user)
                .build();
        return facultyMapper.toResponseDTO(facultyRepository.save(faculty), 0);
    }

    @Override
    @Transactional
    public FacultyResponseDTO updateFaculty(Long id, FacultyRequestDTO request) {
        Faculty faculty = getFaculty(id);
        if (request.getFirstName()   != null) faculty.setFirstName(request.getFirstName());
        if (request.getLastName()    != null) faculty.setLastName(request.getLastName());
        if (request.getDepartment()  != null) faculty.setDepartment(request.getDepartment());
        if (request.getPhone()       != null) faculty.setPhone(request.getPhone());
        if (request.getDesignation() != null) faculty.setDesignation(request.getDesignation());
        if (request.getStatus()      != null) {
            faculty.setStatus(FacultyStatus.valueOf(request.getStatus()));
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            String[] parts = request.getName().trim().split(" ", 2);
            faculty.setFirstName(parts[0]);
            faculty.setLastName(parts.length > 1 ? parts[1] : "");
        }
        return facultyMapper.toResponseDTO(facultyRepository.save(faculty),
                (int) courseRepository.countAssignedCoursesByFacultyId(id));
    }

    @Override
    @Transactional
    public void deleteFaculty(Long id) {
        Faculty faculty = getFaculty(id);
        long assignedCourses = courseRepository.countAssignedCoursesByFacultyId(id);
        if (assignedCourses > 0) {
            throw new BadRequestException(
                    "Cannot delete faculty: assigned to " + assignedCourses + " course(s). Remove assignments first.");
        }
        assignmentRepository.deleteByFacultyId(id);
        facultyRepository.delete(faculty);
    }

    // ── Admin: Course assignment (single source of truth) ────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAssignedCourses(Long facultyId) {
        getFaculty(facultyId); // existence check
        List<Long> courseIds = assignmentRepository.findDistinctCourseIdsByFacultyId(facultyId);
        return courseRepository.findAllById(courseIds).stream()
                .map(c -> courseMapper.toResponseDTO(c,
                        (int) courseRepository.countStudentsByCourseId(c.getId()), null))
                .toList();
    }

    @Override
    @Transactional
    public void assignCourses(Long facultyId, List<Long> courseIds) {
        Faculty faculty = getFaculty(facultyId);
        courseIds.forEach(courseId -> {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
            // Create a base assignment (no class structure) if none exists
            if (!assignmentRepository.existsByFacultyIdAndCourseId(facultyId, courseId)) {
                assignmentRepository.save(FacultyCourseAssignment.builder()
                        .faculty(faculty)
                        .course(course)
                        .classStructure(null)
                        .build());
            }
        });
    }

    @Override
    @Transactional
    public void removeCourse(Long facultyId, Long courseId) {
        getFaculty(facultyId); // existence check
        if (!assignmentRepository.existsByFacultyIdAndCourseId(facultyId, courseId)) {
            throw new BadRequestException("Course is not assigned to this faculty");
        }
        assignmentRepository.deleteByFacultyIdAndCourseId(facultyId, courseId);
    }

    @Override
    @Transactional
    public void assignClassesToCourse(Long facultyId, Long courseId, List<Long> classStructureIds) {
        Faculty faculty = getFaculty(facultyId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        classStructureIds.forEach(csId -> {
            if (!assignmentRepository.existsByFacultyIdAndCourseIdAndClassStructureId(facultyId, courseId, csId)) {
                ClassStructure cs = classStructureRepository.findById(csId)
                        .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found: " + csId));
                assignmentRepository.save(FacultyCourseAssignment.builder()
                        .faculty(faculty)
                        .course(course)
                        .classStructure(cs)
                        .build());
            }
        });
    }

    // ── Faculty self-service ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getMyCourses() {
        Faculty faculty = resolveCurrentFaculty();
        List<Long> courseIds = assignmentRepository.findDistinctCourseIdsByFacultyId(faculty.getId());
        return courseRepository.findAllById(courseIds).stream()
                .map(c -> courseMapper.toResponseDTO(c,
                        (int) courseRepository.countStudentsByCourseId(c.getId()), null))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getMyAttendance() {
        Faculty faculty = resolveCurrentFaculty();
        List<Long> courseIds = assignmentRepository.findDistinctCourseIdsByFacultyId(faculty.getId());
        List<Course> courses = courseRepository.findAllById(courseIds);
        return attendanceRepository.findByCourseIn(courses)
                .stream().map(attendanceMapper::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDTO getMyProfile() {
        Faculty f = resolveCurrentFaculty();
        return facultyMapper.toResponseDTO(f,
                (int) courseRepository.countAssignedCoursesByFacultyId(f.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyCourseAssignmentResponseDTO> getMyAssignments() {
        Faculty faculty = resolveCurrentFaculty();
        return assignmentRepository.findByFacultyId(faculty.getId()).stream()
                .filter(a -> a.getClassStructure() != null)
                .map(a -> {
                    ClassStructure cs = a.getClassStructure();
                    String display = cs.getDepartment().getName()
                            + " " + cs.getBatch().getStartYear() + "-" + cs.getBatch().getEndYear()
                            + " Sem " + cs.getSemester();
                    return FacultyCourseAssignmentResponseDTO.builder()
                            .id(a.getId())
                            .courseId(a.getCourse().getId())
                            .courseName(a.getCourse().getName())
                            .courseCode(a.getCourse().getCode())
                            .classStructureId(cs.getId())
                            .classDisplayName(display)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getCourseStudents(Long courseId) {
        Faculty faculty = resolveCurrentFaculty();
        if (!assignmentRepository.existsByFacultyIdAndCourseId(faculty.getId(), courseId)) {
            throw new BadRequestException("Course is not assigned to you");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        return course.getStudents().stream().map(studentMapper::toResponseDTO).toList();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Faculty getFaculty(Long id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
    }

    private Faculty resolveCurrentFaculty() {
        return facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
    }
}
