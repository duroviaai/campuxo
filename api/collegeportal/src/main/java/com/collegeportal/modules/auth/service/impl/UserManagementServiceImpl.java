package com.collegeportal.modules.auth.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.dto.response.AuthResponseDTO;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.auth.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;

    @Override
    public List<User> getPendingApprovalUsers() {
        return userRepository.findPendingApprovalUsers();
    }

    @Override
    @Transactional
    public AuthResponseDTO approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setApproved(true);
        user.setEnabled(true);
        userRepository.save(user);

        return AuthResponseDTO.builder()
                .message("User approved successfully")
                .email(user.getEmail())
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDTO rejectUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepository.delete(user);

        return AuthResponseDTO.builder()
                .message("User registration rejected and removed")
                .build();
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}