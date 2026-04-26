package com.collegeportal.modules.auth.service.impl;

import java.time.LocalDateTime;
import java.util.Map;
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
import org.springframework.web.client.RestTemplate;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.dto.request.CompleteProfileRequestDTO;
import com.collegeportal.modules.auth.dto.request.ForgotPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.request.GoogleAuthRequestDTO;
import com.collegeportal.modules.auth.dto.request.LoginRequestDTO;
import com.collegeportal.modules.auth.dto.request.RegisterRequestDTO;
import com.collegeportal.modules.auth.dto.request.ResetPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.response.AuthResponseDTO;
import com.collegeportal.modules.auth.entity.Role;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.RoleRepository;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.auth.service.AuthService;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.modules.department.repository.DepartmentRepository;
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
    private final DepartmentRepository departmentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

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
            Department deptEntity = request.getDepartment() != null
                    ? departmentRepository.findByName(request.getDepartment()).orElse(null) : null;
            facultyRepository.save(Faculty.builder()
                    .firstName(parts[0])
                    .lastName(parts.length > 1 ? parts[1] : "")
                    .phone(request.getPhone())
                    .department(request.getDepartment())
                    .departmentEntity(deptEntity)
                    .designation(request.getDesignation())
                    .qualification(request.getQualification())
                    .experience(request.getExperience())
                    .joiningDate(request.getJoiningDate())
                    .user(savedUser)
                    .build());
        } else if (request.getRole() == RoleType.ROLE_STUDENT) {
            String[] parts = request.getFullName().trim().split(" ", 2);
            studentRepository.save(Student.builder()
                    .firstName(parts[0])
                    .lastName(parts.length > 1 ? parts[1] : "")
                    .phone(request.getPhone())
                    .dateOfBirth(request.getDateOfBirth())
                    .department(request.getDepartment())
                    .yearOfStudy(request.getYearOfStudy())
                    .courseStartYear(request.getCourseStartYear())
                    .courseEndYear(request.getCourseEndYear())
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

    private Map<?, ?> fetchGoogleUserInfo(String accessToken) {
        String url = "https://www.googleapis.com/oauth2/v3/userinfo";
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            var entity = new org.springframework.http.HttpEntity<>(headers);
            Map<?, ?> payload = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Map.class).getBody();
            if (payload == null || payload.containsKey("error")) throw new BadRequestException("Invalid Google token");
            return payload;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Invalid Google token");
        }
    }

    @Override
    @Transactional
    public AuthResponseDTO googleRegister(String accessToken, RegisterRequestDTO request) {
        Map<?, ?> payload = fetchGoogleUserInfo(accessToken);
        String email = (String) payload.get("email");
        String name  = (String) payload.get("name");
        if (email == null) throw new BadRequestException("Google token missing email");
        // Override with verified Google email/name
        request.setEmail(email);
        if (name != null && (request.getFullName() == null || request.getFullName().isBlank()))
            request.setFullName(name);
        return register(request);
    }

    @Override
    @Transactional
    public AuthResponseDTO googleAuth(GoogleAuthRequestDTO request) {
        Map<?, ?> payload = fetchGoogleUserInfo(request.getIdToken());
        String email = (String) payload.get("email");
        String name  = (String) payload.get("name");
        if (email == null) throw new BadRequestException("Google token missing email");

        // Check if user exists
        boolean isNew = userRepository.findByEmail(email).isEmpty();
        if (isNew) {
            return AuthResponseDTO.builder()
                    .newUser(true)
                    .email(email)
                    .username(name)
                    .build();
        }

        User user = userRepository.findByEmail(email).get();
        if (!user.isEnabled()) throw new BadRequestException("Your account is pending admin approval");

        String token = jwtTokenProvider.generateTokenForEmail(email);
        AuthResponseDTO response = buildAuthResponse(user, token);
        response.setNewUser(false);
        return response;
    }

    @Override
    @Transactional
    public AuthResponseDTO completeProfile(String email, CompleteProfileRequestDTO req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name()).collect(Collectors.toSet());

        if (roles.contains("ROLE_STUDENT")) {
            if (req.getPhone() == null || req.getPhone().isBlank())
                throw new BadRequestException("Phone number is required");
            if (req.getDepartment() == null || req.getDepartment().isBlank())
                throw new BadRequestException("Department is required");
            if (req.getDateOfBirth() == null)
                throw new BadRequestException("Date of birth is required");
            if (req.getYearOfStudy() == null)
                throw new BadRequestException("Year of study is required");
            if (req.getCourseStartYear() == null || req.getCourseEndYear() == null)
                throw new BadRequestException("Course start and end year are required");
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            student.setPhone(req.getPhone());
            student.setDepartment(req.getDepartment());
            student.setDateOfBirth(req.getDateOfBirth());
            student.setYearOfStudy(req.getYearOfStudy());
            student.setCourseStartYear(req.getCourseStartYear());
            student.setCourseEndYear(req.getCourseEndYear());
            if (req.getRegistrationNumber() != null && !req.getRegistrationNumber().isBlank()) {
                user.setRegistrationNumber(req.getRegistrationNumber());
                userRepository.save(user);
            }
            studentRepository.save(student);
        } else if (roles.contains("ROLE_FACULTY")) {
            if (req.getPhone() == null || req.getPhone().isBlank())
                throw new BadRequestException("Phone number is required");
            if (req.getDepartment() == null || req.getDepartment().isBlank())
                throw new BadRequestException("Department is required");
            if (req.getDesignation() == null || req.getDesignation().isBlank())
                throw new BadRequestException("Designation is required");
            if (req.getQualification() == null || req.getQualification().isBlank())
                throw new BadRequestException("Qualification is required");
            if (req.getJoiningDate() == null)
                throw new BadRequestException("Joining date is required");
            Faculty faculty = facultyRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
            faculty.setPhone(req.getPhone());
            faculty.setDepartment(req.getDepartment());
            if (req.getDepartment() != null) {
                departmentRepository.findByName(req.getDepartment()).ifPresent(faculty::setDepartmentEntity);
            }
            faculty.setDesignation(req.getDesignation());
            faculty.setQualification(req.getQualification());
            faculty.setExperience(req.getExperience());
            faculty.setJoiningDate(req.getJoiningDate());
            if (req.getFacultyId() != null && !req.getFacultyId().isBlank()) {
                user.setFacultyId(req.getFacultyId());
                userRepository.save(user);
            }
            facultyRepository.save(faculty);
        } else {
            throw new BadRequestException("Profile completion not applicable for this role");
        }

        String token = jwtTokenProvider.generateTokenForEmail(email);
        return buildAuthResponse(user, token);
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
