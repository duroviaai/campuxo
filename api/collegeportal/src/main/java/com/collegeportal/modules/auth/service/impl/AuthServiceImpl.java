package com.collegeportal.modules.auth.service.impl;

import java.time.LocalDateTime;
import java.util.List;
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

import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.classbatch.service.ClassBatchService;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.modules.batch.entity.Batch;
import com.collegeportal.modules.batch.repository.BatchRepository;
import com.collegeportal.modules.registrationwindow.service.RegistrationWindowService;
import java.time.LocalDate;
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
import com.collegeportal.modules.specialization.entity.Specialization;
import com.collegeportal.modules.specialization.repository.SpecializationRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.security.jwt.JwtTokenProvider;
import com.collegeportal.modules.email.EmailService;
import com.collegeportal.modules.notification.service.NotificationService;
import com.collegeportal.shared.enums.NotificationType;
import com.collegeportal.shared.enums.RoleType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

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
    private final SpecializationRepository specializationRepository;
    private final ClassBatchService classBatchService;
    private final ClassBatchRepository classBatchRepository;
    private final ClassStructureRepository classStructureRepository;
    private final BatchRepository batchRepository;
    private final RegistrationWindowService registrationWindowService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiration;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean isStudentProfileComplete(User user) {
        return studentRepository.findByUser(user)
                .map(s -> s.getPhone() != null && s.getDepartment() != null
                        && s.getDateOfBirth() != null && s.getYearOfStudy() != null)
                .orElse(false);
    }

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

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
                .enabled(false)
                .approved(false)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        List<User> admins = userRepository.findApprovedUsersByRole(RoleType.ROLE_ADMIN);
        for (User admin : admins) {
            notificationService.send(admin.getId(), NotificationType.NEW_REGISTRATION,
                    "New Registration",
                    request.getFullName() + " has registered as "
                            + request.getRole().name().replace("ROLE_", "") + ". Review pending approvals.",
                    "/admin/approvals", savedUser.getId(), "USER");
        }

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
            Student.StudentBuilder builder = Student.builder()
                    .firstName(parts[0])
                    .lastName(parts.length > 1 ? parts[1] : "")
                    .phone(request.getPhone())
                    .dateOfBirth(request.getDateOfBirth())
                    .department(request.getDepartment())
                    .yearOfStudy(request.getYearOfStudy())
                    .courseStartYear(request.getCourseStartYear())
                    .courseEndYear(request.getCourseEndYear())
                    .scheme(request.getScheme())
                    .user(savedUser);
            if (request.getSpecializationId() != null) {
                Specialization spec = specializationRepository.findById(request.getSpecializationId()).orElse(null);
                builder.specialization(spec);
            }
            if (request.getClassStructureId() != null) {
                classStructureRepository.findById(request.getClassStructureId())
                        .ifPresent(builder::classStructure);
                try {
                    ClassBatchResponseDTO batchDTO =
                        classBatchService.resolveByClassStructure(request.getClassStructureId());
                    classBatchRepository.findById(batchDTO.getId()).ifPresent(batch -> {
                        builder.classBatch(batch);
                        if (request.getScheme() == null) builder.scheme(batch.getScheme());
                        builder.courseStartYear(batch.getStartYear());
                        builder.courseEndYear(batch.getEndYear());
                    });
                } catch (Exception ignored) {}
            }
            studentRepository.save(builder.build());
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
                if (request.getBatchId() != null && request.getYearOfStudy() != null) {
                    Batch batch = batchRepository.findById(request.getBatchId())
                            .orElseThrow(() -> new BadRequestException("Batch not found: " + request.getBatchId()));
                    int batchDuration = batch.getEndYear() - batch.getStartYear();
                    int currentYear = LocalDate.now().getYear();
                    int expectedYear = currentYear - batch.getStartYear() + 1;
                    expectedYear = Math.max(1, Math.min(batchDuration, expectedYear));
                    if (!request.getYearOfStudy().equals(expectedYear)) {
                        throw new BadRequestException(
                                "For batch " + batch.getStartYear() + "-" + batch.getEndYear() +
                                ", you must register as Year " + expectedYear);
                    }
                    boolean open = registrationWindowService.isRegistrationOpen(
                            request.getBatchId(), "ROLE_STUDENT", request.getYearOfStudy());
                    if (!open) {
                        throw new BadRequestException(
                                "Registration is not currently open for this batch and year of study");
                    }
                }
            }
            case ROLE_FACULTY -> {
                if (request.getFacultyId() == null || request.getFacultyId().trim().isEmpty()) {
                    throw new BadRequestException("Faculty ID is required for faculty members");
                }
                if (userRepository.findByFacultyId(request.getFacultyId()).isPresent()) {
                    throw new BadRequestException("Faculty ID already exists");
                }
                boolean anyOpen = registrationWindowService.getActiveForRole("ROLE_FACULTY")
                        .stream().anyMatch(w -> w.getCurrentlyOpen());
                if (!anyOpen) {
                    throw new BadRequestException("Faculty registration is not currently open");
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

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));

        userRepository.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken);

        return AuthResponseDTO.builder()
                .message("Password reset link has been sent to your email")
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

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
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            student.setPhone(req.getPhone());
            student.setDepartment(req.getDepartment());
            student.setDateOfBirth(req.getDateOfBirth());
            student.setYearOfStudy(req.getYearOfStudy());
            student.setCourseStartYear(req.getCourseStartYear());
            student.setCourseEndYear(req.getCourseEndYear());
            if (req.getScheme() != null) student.setScheme(req.getScheme());
            if (req.getSpecializationId() != null) {
                specializationRepository.findById(req.getSpecializationId())
                        .ifPresent(student::setSpecialization);
            }
            if (req.getRegistrationNumber() != null && !req.getRegistrationNumber().isBlank()) {
                user.setRegistrationNumber(req.getRegistrationNumber());
                userRepository.save(user);
            }
            if (req.getClassStructureId() != null) {
                classStructureRepository.findById(req.getClassStructureId())
                        .ifPresent(student::setClassStructure);
                try {
                    ClassBatchResponseDTO batchDTO =
                        classBatchService.resolveByClassStructure(req.getClassStructureId());
                    classBatchRepository.findById(batchDTO.getId()).ifPresent(batch -> {
                        student.setClassBatch(batch);
                        student.setCourseStartYear(batch.getStartYear());
                        student.setCourseEndYear(batch.getEndYear());
                    });
                } catch (Exception ignored) {}
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

    @Override
    @Transactional
    public AuthResponseDTO refresh(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token expired");
        }

        String newAccessToken = jwtTokenProvider.generateTokenForEmail(user.getEmail());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken();
        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusSeconds(refreshExpiration / 1000));
        userRepository.save(user);

        return AuthResponseDTO.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .refreshToken(newRefreshToken)
                .build();
    }

    private AuthResponseDTO buildAuthResponse(User user, String token) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        boolean profileComplete = !roles.contains("ROLE_STUDENT") || isStudentProfileComplete(user);

        String rt = jwtTokenProvider.generateRefreshToken();
        user.setRefreshToken(rt);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusSeconds(refreshExpiration / 1000));
        userRepository.save(user);

        return AuthResponseDTO.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getFullName())
                .email(user.getEmail())
                .roles(roles)
                .message("Login successful")
                .profileComplete(profileComplete)
                .refreshToken(rt)
                .build();
    }
}
