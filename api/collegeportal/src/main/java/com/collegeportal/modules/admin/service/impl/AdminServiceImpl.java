package com.collegeportal.modules.admin.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.admin.dto.response.AdminResponseDTO;
import com.collegeportal.modules.admin.dto.response.AdminStatsDTO;
import com.collegeportal.modules.admin.service.AdminService;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<AdminResponseDTO> getPendingUsers() {
        return userRepository.findPendingApprovalUsers()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
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
    public AdminResponseDTO rejectUser(Long userId) {
        User user = getUser(userId);
        user.setApproved(false);
        user.setEnabled(false);
        userRepository.save(user);
        AdminResponseDTO dto = toDTO(user);
        dto.setMessage("User rejected successfully");
        return dto;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Override
    public AdminStatsDTO getStats() {
        return AdminStatsDTO.builder()
                .totalStudents(studentRepository.count())
                .totalFaculty(facultyRepository.count())
                .totalCourses(courseRepository.count())
                .pendingApprovals(userRepository.findPendingApprovalUsers().size())
                .build();
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
                .build();
    }
}
