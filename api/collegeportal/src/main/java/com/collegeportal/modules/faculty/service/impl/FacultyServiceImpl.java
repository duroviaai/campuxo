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
import com.collegeportal.modules.faculty.dto.request.FacultyRequestDTO;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.mapper.FacultyMapper;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.facultyassignment.dto.response.FacultyCourseAssignmentResponseDTO;
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

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<FacultyResponseDTO> getAllFaculty(Pageable pageable) {
        return PageResponseDTO.from(
                facultyRepository.findAll(pageable).map(facultyMapper::toResponseDTO)
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
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getMyCourses() {
        Faculty faculty = resolveCurrentFaculty();
        return courseRepository.findByFacultyId(faculty.getId())
                .stream().map(courseMapper::toResponseDTO).toList();
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
    public List<FacultyCourseAssignmentResponseDTO> getMyAssignments() {
        Faculty faculty = resolveCurrentFaculty();
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
                        .classDisplayName(a.getClassBatch().getName() + " Year " + a.getClassBatch().getYear() + " - Sec " + a.getClassBatch().getSection())
                        .build())
                .toList();
    }
}