package com.collegeportal.modules.auth.service.impl;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.dto.request.ForgotPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.request.LoginRequestDTO;
import com.collegeportal.modules.auth.dto.request.RegisterRequestDTO;
import com.collegeportal.modules.auth.dto.request.ResetPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.response.AuthResponseDTO;
import com.collegeportal.modules.auth.entity.Role;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.RoleRepository;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.auth.service.AuthService;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.security.jwt.JwtTokenProvider;
import com.collegeportal.shared.enums.RoleType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    private boolean isStudentProfileComplete(User user) {
        return studentRepository.findByUser(user)
                .map(s -> s.getPhone() != null && s.getDepartment() != null
                        && s.getDateOfBirth() != null && s.getYearOfStudy() != null
                        && s.getCourseStartYear() != null && s.getCourseEndYear() != null)
                .orElse(false);
    }

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        // Validate role-specific fields
        validateRoleSpecificFields(request);

        Role requestedRole = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .registrationNumber(request.getRegistrationNumber())
                .facultyId(request.getFacultyId())
                .roles(Set.of(requestedRole))
                .enabled(false) // Requires admin approval
                .approved(false)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        // Create role-specific profile
        if (request.getRole() == RoleType.ROLE_FACULTY) {
            String[] parts = request.getFullName().trim().split(" ", 2);
            facultyRepository.save(Faculty.builder()
                    .firstName(parts[0])
                    .lastName(parts.length > 1 ? parts[1] : "")
                    .user(savedUser)
                    .build());
        } else if (request.getRole() == RoleType.ROLE_STUDENT) {
            String[] parts = request.getFullName().trim().split(" ", 2);
            studentRepository.save(Student.builder()
                    .firstName(parts[0])
                    .lastName(parts.length > 1 ? parts[1] : "")
                    .user(savedUser)
                    .build());
        }

        return AuthResponseDTO.builder()
                .message("Registration submitted successfully. Please wait for admin approval.")
                .email(user.getEmail())
                .build();
    }

    private void validateRoleSpecificFields(RegisterRequestDTO request) {
        if (request.getRole() == null) {
            throw new BadRequestException("Role is required");
        }
        
        switch (request.getRole()) {
            case ROLE_STUDENT -> {
                if (request.getRegistrationNumber() == null || request.getRegistrationNumber().trim().isEmpty()) {
                    throw new BadRequestException("Registration number is required for students");
                }
                if (userRepository.findByRegistrationNumber(request.getRegistrationNumber()).isPresent()) {
                    throw new BadRequestException("Registration number already exists");
                }
            }
            case ROLE_FACULTY -> {
                if (request.getFacultyId() == null || request.getFacultyId().trim().isEmpty()) {
                    throw new BadRequestException("Faculty ID is required for faculty members");
                }
                if (userRepository.findByFacultyId(request.getFacultyId()).isPresent()) {
                    throw new BadRequestException("Faculty ID already exists");
                }
            }
            case ROLE_ADMIN -> throw new BadRequestException("Admin registration is not allowed");
            default -> throw new BadRequestException("Invalid role specified");
        }
    }

    @Override
    @Transactional
    public AuthResponseDTO forgotPassword(ForgotPasswordRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token expires in 1 hour
        
        userRepository.save(user);

        // TODO: Send email with reset link
        // For now, we'll return the token in the response (in production, this should be sent via email)
        return AuthResponseDTO.builder()
                .message("Password reset link has been sent to your email")
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        // Check if token is expired
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        userRepository.save(user);

        return AuthResponseDTO.builder()
                .message("Password has been reset successfully")
                .build();
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        try {
            // Find user by email (since we removed username)
            User user = userRepository.findByEmail(request.getUsername())
                    .orElseThrow(() -> new BadRequestException("Invalid credentials"));

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtTokenProvider.generateToken(authentication);

            return buildAuthResponse(user, token);
        } catch (LockedException e) {
            throw new BadRequestException("Your account is pending admin approval");
        } catch (DisabledException e) {
            throw new BadRequestException("Your account has been disabled");
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid credentials");
        }
    }

    private AuthResponseDTO buildAuthResponse(User user, String token) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        boolean profileComplete = !roles.contains("ROLE_STUDENT") || isStudentProfileComplete(user);

        return AuthResponseDTO.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getFullName())
                .email(user.getEmail())
                .roles(roles)
                .message("Login successful")
                .profileComplete(profileComplete)
                .build();
    }
}
