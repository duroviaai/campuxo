package com.collegeportal.modules.admin.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.admin.dto.response.AdminResponseDTO;
import com.collegeportal.modules.admin.dto.response.AdminStatsDTO;
import com.collegeportal.modules.admin.service.AdminService;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.UserRepository;
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
    @Transactional
    public AdminResponseDTO approveUser(Long userId) {
        User user = getUser(userId);
        user.setApproved(true);
        user.setEnabled(true);
        userRepository.save(user);
        AdminResponseDTO dto = toDTO(user);
        dto.setMessage("User approved successfully");
        return dto;
    }

    @Override
    @Transactional
    public void rejectUser(Long userId) {
        userRepository.delete(getUser(userId));
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
    public AdminStatsDTO getStats() {
        return jdbcTemplate.queryForObject(
            "SELECT (SELECT COUNT(*) FROM students) AS students," +
            "       (SELECT COUNT(*) FROM faculty) AS faculty," +
            "       (SELECT COUNT(*) FROM courses) AS courses," +
            "       (SELECT COUNT(*) FROM users WHERE approved = false) AS pending",
            (rs, n) -> AdminStatsDTO.builder()
                .totalStudents(rs.getLong("students"))
                .totalFaculty(rs.getLong("faculty"))
                .totalCourses(rs.getLong("courses"))
                .pendingApprovals(rs.getLong("pending"))
                .build()
        );
    }

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
