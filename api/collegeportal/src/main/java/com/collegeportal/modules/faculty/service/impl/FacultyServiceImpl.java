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
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.mapper.FacultyMapper;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.facultyassignment.dto.response.FacultyCourseAssignmentResponseDTO;
import com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.faculty.service.FacultyService;
import com.collegeportal.shared.dto.PageResponseDTO;
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
    private final StudentMapper studentMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<FacultyResponseDTO> getAllFaculty(Pageable pageable) {
        return PageResponseDTO.from(
                facultyRepository.findAll(pageable).map(facultyMapper::toResponseDTO)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<FacultyResponseDTO> getFilteredFaculty(String department, String search, Pageable pageable) {
        String d = department != null ? department.trim() : "";
        String s = search != null ? search.trim() : "";
        return PageResponseDTO.from(
                facultyRepository.findWithFilters(d, s, pageable)
                        .map(f -> {
                            int count = courseRepository.findByFacultyId(f.getId()).size();
                            return facultyMapper.toResponseDTO(f, count);
                        })
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDTO getFacultyById(Long id) {
        return facultyMapper.toResponseDTO(
                facultyRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id))
        );
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
        String[] parts = fullName.split(" ", 2);
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
                .user(user)
                .build();
        return facultyMapper.toResponseDTO(facultyRepository.save(faculty));
    }

    @Override
    @Transactional
    public FacultyResponseDTO updateFaculty(Long id, FacultyRequestDTO request) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
        if (request.getFirstName() != null) faculty.setFirstName(request.getFirstName());
        if (request.getLastName() != null) faculty.setLastName(request.getLastName());
        if (request.getDepartment() != null) faculty.setDepartment(request.getDepartment());
        if (request.getPhone() != null) faculty.setPhone(request.getPhone());
        if (request.getName() != null && !request.getName().isBlank()) {
            String[] parts = request.getName().trim().split(" ", 2);
            faculty.setFirstName(parts[0]);
            faculty.setLastName(parts.length > 1 ? parts[1] : "");
        }
        return facultyMapper.toResponseDTO(facultyRepository.save(faculty));
    }

    @Override
    @Transactional
    public void deleteFaculty(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
        facultyRepository.delete(faculty);
    }

    @Override
    @Transactional
    public List<CourseResponseDTO> getMyCourses() {
        Faculty faculty = resolveCurrentFaculty();
        ensureAssignmentsSynced(faculty);
        // Include courses assigned via faculty field that may have no assignment records yet
        java.util.Set<Long> assignedCourseIds = assignmentRepository.findByFacultyId(faculty.getId())
                .stream().map(a -> a.getCourse().getId()).collect(java.util.stream.Collectors.toSet());
        List<Course> directCourses = courseRepository.findByFacultyId(faculty.getId());
        directCourses.stream()
                .filter(c -> !assignedCourseIds.contains(c.getId()))
                .forEach(c -> assignedCourseIds.add(c.getId()));
        return courseRepository.findAllById(assignedCourseIds).stream()
                .map(c -> courseMapper.toResponseDTO(c, (int) courseRepository.countStudentsByCourseId(c.getId()), null))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getMyAttendance() {
        Faculty faculty = resolveCurrentFaculty();
        List<Course> courses = courseRepository.findByFacultyId(faculty.getId());
        return attendanceRepository.findByCourseIn(courses)
                .stream().map(attendanceMapper::toResponseDTO).toList();
    }

    private Faculty resolveCurrentFaculty() {
        return facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDTO getMyProfile() {
        return facultyMapper.toResponseDTO(resolveCurrentFaculty());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAssignedCourses(Long facultyId) {
        facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + facultyId));
        // Merge: courses via assignment table + courses directly linked via faculty field
        java.util.Set<Long> ids = new java.util.LinkedHashSet<>();
        assignmentRepository.findByFacultyId(facultyId).forEach(a -> ids.add(a.getCourse().getId()));
        courseRepository.findByFacultyId(facultyId).forEach(c -> ids.add(c.getId()));
        return courseRepository.findAllById(ids).stream()
                .map(c -> courseMapper.toResponseDTO(c, (int) courseRepository.countStudentsByCourseId(c.getId()), null))
                .toList();
    }

    @Override
    @Transactional
    public void assignCourses(Long facultyId, List<Long> courseIds) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + facultyId));
        courseIds.forEach(courseId -> {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
            course.setFaculty(faculty);
            courseRepository.save(course);

            // Create FacultyCourseAssignment for each distinct class batch enrolled in this course
            course.getStudents().stream()
                    .map(s -> s.getClassBatch())
                    .filter(b -> b != null)
                    .distinct()
                    .forEach(batch -> {
                        if (!assignmentRepository.existsByFacultyIdAndCourseIdAndClassBatchId(
                                facultyId, courseId, batch.getId())) {
                            FacultyCourseAssignment assignment = FacultyCourseAssignment.builder()
                                    .faculty(faculty)
                                    .course(course)
                                    .classBatch(batch)
                                    .build();
                            assignmentRepository.save(assignment);
                        }
                    });
        });
    }

    @Override
    @Transactional
    public void removeCourse(Long facultyId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        boolean directlyAssigned = course.getFaculty() != null && course.getFaculty().getId().equals(facultyId);
        boolean assignmentExists = assignmentRepository.findByFacultyId(facultyId).stream()
                .anyMatch(a -> a.getCourse().getId().equals(courseId));
        if (!directlyAssigned && !assignmentExists) {
            throw new BadRequestException("Course is not assigned to this faculty");
        }
        if (directlyAssigned) {
            course.setFaculty(null);
            courseRepository.save(course);
        }
        assignmentRepository.deleteByFacultyIdAndCourseId(facultyId, courseId);
    }

    @Override
    @Transactional
    public List<FacultyCourseAssignmentResponseDTO> getMyAssignments() {
        Faculty faculty = resolveCurrentFaculty();
        ensureAssignmentsSynced(faculty);
        return assignmentRepository.findByFacultyId(faculty.getId()).stream()
                .map(a -> FacultyCourseAssignmentResponseDTO.builder()
                        .id(a.getId())
                        .courseId(a.getCourse().getId())
                        .courseName(a.getCourse().getName())
                        .courseCode(a.getCourse().getCode())
                        .classId(a.getClassBatch().getId())
                        .className(a.getClassBatch().getName())
                        .classSection(a.getClassBatch().getSection())
                        .classYear(a.getClassBatch().getYear())
                        .classDisplayName(a.getClassBatch().getName() + " Yr" + a.getClassBatch().getYear() + " - Sec " + a.getClassBatch().getSection())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getCourseStudents(Long courseId) {
        Faculty faculty = resolveCurrentFaculty();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        boolean isAssigned = (course.getFaculty() != null && course.getFaculty().getId().equals(faculty.getId()))
                || assignmentRepository.findByFacultyId(faculty.getId()).stream()
                        .anyMatch(a -> a.getCourse().getId().equals(courseId));
        if (!isAssigned) throw new BadRequestException("Course is not assigned to you");
        return course.getStudents().stream().map(studentMapper::toResponseDTO).toList();
    }

    private void ensureAssignmentsSynced(Faculty faculty) {
        if (!assignmentRepository.findByFacultyId(faculty.getId()).isEmpty()) return;
        courseRepository.findByFacultyId(faculty.getId()).forEach(course ->
            course.getStudents().stream()
                .map(s -> s.getClassBatch())
                .filter(b -> b != null)
                .distinct()
                .forEach(batch -> {
                    if (!assignmentRepository.existsByFacultyIdAndCourseIdAndClassBatchId(
                            faculty.getId(), course.getId(), batch.getId())) {
                        assignmentRepository.save(FacultyCourseAssignment.builder()
                                .faculty(faculty)
                                .course(course)
                                .classBatch(batch)
                                .build());
                    }
                })
        );
    }
}