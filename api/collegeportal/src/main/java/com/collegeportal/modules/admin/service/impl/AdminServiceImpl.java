package com.collegeportal.modules.admin.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.admin.dto.response.AdminResponseDTO;
import com.collegeportal.modules.admin.dto.response.AdminStatsDTO;
import com.collegeportal.modules.admin.service.AdminService;
import com.collegeportal.modules.auth.entity.Role;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.RoleRepository;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.enums.FacultyRole;
import com.collegeportal.shared.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final FacultyCourseAssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final RoleRepository roleRepository;

    // ── User approval lifecycle ───────────────────────────────────────────────

    @Override
    public List<AdminResponseDTO> getPendingUsers(RoleType role) {
        List<User> users = role != null
                ? userRepository.findPendingApprovalUsersByRole(role)
                : userRepository.findPendingApprovalUsers();
        return users.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<AdminResponseDTO> getApprovedUsers(RoleType role) {
        List<User> users = role != null
                ? userRepository.findApprovedUsersByRole(role)
                : userRepository.findApprovedUsers();
        return users.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<AdminResponseDTO> getRejectedUsers() {
        return userRepository.findRejectedUsers().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdminResponseDTO approveUser(Long userId) {
        User user = getUser(userId);
        user.setApproved(true);
        user.setEnabled(true);
        user.setRejected(false);
        user.setRejectionReason(null);
        userRepository.save(user);
        AdminResponseDTO dto = toDTO(user);
        dto.setMessage("User approved successfully");
        return dto;
    }

    @Override
    @Transactional
    public void rejectUser(Long userId, String reason) {
        User user = getUser(userId);
        user.setApproved(false);
        user.setEnabled(false);
        user.setRejected(true);
        user.setRejectionReason(reason);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void revokeUser(Long userId) {
        User user = getUser(userId);
        user.setApproved(false);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = getUser(userId);
        facultyRepository.findByUser(user).ifPresent(faculty -> {
            assignmentRepository.deleteByFacultyId(faculty.getId());
            facultyRepository.delete(faculty);
        });
        studentRepository.findByUser(user).ifPresent(studentRepository::delete);
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void bulkApprove(List<Long> userIds) {
        userIds.forEach(this::approveUser);
    }

    @Override
    @Transactional
    public void bulkReject(List<Long> userIds, String reason) {
        userIds.forEach(id -> rejectUser(id, reason));
    }

    @Override
    public AdminStatsDTO getStats() {
        return jdbcTemplate.queryForObject(
            "SELECT (SELECT COUNT(*) FROM students) AS students," +
            "       (SELECT COUNT(*) FROM faculty)  AS faculty," +
            "       (SELECT COUNT(*) FROM courses)  AS courses," +
            "       (SELECT COUNT(*) FROM users WHERE approved = false) AS pending",
            (rs, n) -> AdminStatsDTO.builder()
                .totalStudents(rs.getLong("students"))
                .totalFaculty(rs.getLong("faculty"))
                .totalCourses(rs.getLong("courses"))
                .pendingApprovals(rs.getLong("pending"))
                .build()
        );
    }

    // ── HOD management ────────────────────────────────────────────────────────

    /**
     * Atomically promotes a faculty member to HOD for their department.
     * <p>
     * Steps:
     * 1. Resolve the faculty profile for the given userId.
     * 2. Validate the faculty has a department set.
     * 3. Demote the existing HOD in that department (if any).
     * 4. Promote the target faculty to HOD.
     * 5. Sync ROLE_HOD on the User entity for Spring Security.
     */
    @Override
    @Transactional
    public void assignHodRole(Long userId) {
        User user = getUser(userId);
        Faculty faculty = facultyRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("User does not have a faculty profile"));

        String department = faculty.getDepartment();
        if (department == null || department.isBlank()) {
            throw new BadRequestException("Faculty must have a department assigned before becoming HOD");
        }

        // Demote existing HOD in this department
        facultyRepository.findByDepartmentAndRole(department, FacultyRole.hod)
                .filter(existing -> !existing.getId().equals(faculty.getId()))
                .ifPresent(existing -> {
                    existing.setRole(FacultyRole.faculty);
                    facultyRepository.save(existing);
                    // Remove ROLE_HOD from old HOD's user
                    existing.getUser().getRoles().removeIf(r -> r.getName() == RoleType.ROLE_HOD);
                    userRepository.save(existing.getUser());
                });

        // Promote new HOD
        faculty.setRole(FacultyRole.hod);
        facultyRepository.save(faculty);

        // Sync ROLE_HOD on User for Spring Security
        Role hodRole = roleRepository.findByName(RoleType.ROLE_HOD)
                .orElseThrow(() -> new ResourceNotFoundException("ROLE_HOD not found"));
        user.getRoles().add(hodRole);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeHodRole(Long userId) {
        User user = getUser(userId);
        facultyRepository.findByUser(user).ifPresent(faculty -> {
            faculty.setRole(FacultyRole.faculty);
            facultyRepository.save(faculty);
        });
        user.getRoles().removeIf(r -> r.getName() == RoleType.ROLE_HOD);
        userRepository.save(user);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private AdminResponseDTO toDTO(User user) {
        return AdminResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .registrationNumber(user.getRegistrationNumber())
                .facultyId(user.getFacultyId())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()))
                .approved(user.isApproved())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
