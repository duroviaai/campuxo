package com.collegeportal.modules.student.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ForbiddenException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.classbatch.service.ClassBatchService;
import com.collegeportal.modules.attendance.repository.AttendanceRepository;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.classstructure.repository.ClassStructureCourseRepository;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.ia.repository.InternalAssessmentRepository;
import com.collegeportal.modules.specialization.repository.SpecializationRepository;
import com.collegeportal.modules.student.dto.request.StudentRequestDTO;
import com.collegeportal.modules.student.dto.response.ClassmateResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentAlertDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentStatsDTO;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.modules.student.service.StudentService;
import com.collegeportal.shared.dto.PageResponseDTO;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final SecurityUtils securityUtils;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final ClassBatchRepository classBatchRepository;
    private final ClassBatchService classBatchService;
    private final AttendanceRepository attendanceRepository;
    private final FacultyCourseAssignmentRepository facultyAssignmentRepository;
    private final SpecializationRepository specializationRepository;
    private final InternalAssessmentRepository iaRepository;
    private final ClassStructureCourseRepository classStructureCourseRepository;
    private final ClassStructureRepository classStructureRepository;

    @Value("${app.upload.dir:uploads/photos}")
    private String uploadDir;

    @Value("${app.upload.base-url:/uploads/photos}")
    private String uploadBaseUrl;

    private Student findStudentById(Long id) {
        return studentRepository.findWithUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDTO getStudentById(Long id) {
        return studentMapper.toResponseDTO(findStudentById(id));
    }

    @Override
    @Transactional
    public StudentResponseDTO updateStudent(Long id, StudentRequestDTO request) {
        Student student = findStudentById(id);
        studentMapper.updateEntity(student, request);
        if (request.getSpecializationId() != null) {
            specializationRepository.findById(request.getSpecializationId())
                    .ifPresent(student::setSpecialization);
        } else {
            student.setSpecialization(null);
        }
        // resolve classBatch: prefer classStructureId (new system) over classBatchId (old system)
        if (request.getClassStructureId() != null) {
            ClassStructure cs = classStructureRepository.findById(request.getClassStructureId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found: " + request.getClassStructureId()));
            student.setClassStructure(cs);
            com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO batchDTO =
                classBatchService.resolveByClassStructure(request.getClassStructureId());
            ClassBatch batch = classBatchRepository.findById(batchDTO.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassBatch not found after resolve"));
            student.setClassBatch(batch);
            student.setScheme(batch.getScheme());
            student.setDepartment(batch.getName());
            if (batch.getYearOfStudy() != null) student.setYearOfStudy(batch.getYearOfStudy());
        } else if (request.getClassBatchId() != null) {
            student.setClassStructure(null);
            ClassBatch batch = classBatchRepository.findById(request.getClassBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassBatch not found with id: " + request.getClassBatchId()));
            student.setClassBatch(batch);
            student.setScheme(batch.getScheme());
            student.setDepartment(batch.getName());
            if (batch.getYearOfStudy() != null) student.setYearOfStudy(batch.getYearOfStudy());
        } else {
            student.setClassStructure(null);
            student.setClassBatch(null);
        }
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        attendanceRepository.deleteAll(attendanceRepository.findByStudent(student));
        courseRepository.removeStudentFromAllCourses(id);
        studentRepository.delete(student);
    }

    @Override
    @Transactional
    public StudentResponseDTO adminCreateStudent(StudentRequestDTO request) {
        Student student = studentMapper.toEntity(request);
        student.setUser(securityUtils.getCurrentUser());
        if (request.getSpecializationId() != null) {
            specializationRepository.findById(request.getSpecializationId())
                    .ifPresent(student::setSpecialization);
        }
        if (request.getClassStructureId() != null) {
            ClassStructure cs = classStructureRepository.findById(request.getClassStructureId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found: " + request.getClassStructureId()));
            student.setClassStructure(cs);
            com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO batchDTO =
                classBatchService.resolveByClassStructure(request.getClassStructureId());
            ClassBatch batch = classBatchRepository.findById(batchDTO.getId()).orElse(null);
            student.setClassBatch(batch);
            if (batch != null) {
                student.setScheme(batch.getScheme());
                student.setDepartment(batch.getName());
                if (batch.getYearOfStudy() != null) student.setYearOfStudy(batch.getYearOfStudy());
            }
        } else if (request.getClassBatchId() != null) {
            student.setClassStructure(null);
            ClassBatch batch = classBatchRepository.findById(request.getClassBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassBatch not found: " + request.getClassBatchId()));
            student.setClassBatch(batch);
            student.setScheme(batch.getScheme());
            if (student.getDepartment() == null) student.setDepartment(batch.getName());
            if (student.getYearOfStudy() == null) student.setYearOfStudy(batch.getYearOfStudy());
        }
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentResponseDTO createStudent(StudentRequestDTO request) {
        User currentUser = securityUtils.getCurrentUser();
        if (studentRepository.existsByUser(currentUser)) {
            throw new BadRequestException("Student profile already exists for this user");
        }
        Student student = studentMapper.toEntity(request);
        student.setUser(currentUser);
        if (request.getSpecializationId() != null) {
            specializationRepository.findById(request.getSpecializationId())
                    .ifPresent(student::setSpecialization);
        }
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<StudentResponseDTO> getAllStudents(Pageable pageable, String search, String department, Long classBatchId) {
        String s = search != null ? search.trim() : "";
        String d = department != null ? department.trim() : "";
        return PageResponseDTO.from(
                studentRepository.search(s, d, classBatchId, pageable).map(studentMapper::toResponseDTO)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDTO getMyProfile() {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return studentMapper.toResponseDTO(student);
    }

    @Override
    @Transactional
    public StudentResponseDTO updateMyProfile(StudentRequestDTO request) {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        studentMapper.updateEntity(student, request);
        if (request.getSpecializationId() != null) {
            specializationRepository.findById(request.getSpecializationId())
                    .ifPresent(student::setSpecialization);
        } else {
            student.setSpecialization(null);
        }
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentResponseDTO uploadPhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Photo file is required");
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) throw new BadRequestException("File must be an image");
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String orig = file.getOriginalFilename();
            String ext  = (orig != null && orig.contains(".")) ? orig.substring(orig.lastIndexOf('.')) : ".jpg";
            String filename = "student_" + student.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            student.setPhotoUrl(uploadBaseUrl + "/" + filename);
        } catch (IOException e) {
            throw new BadRequestException("Failed to save photo: " + e.getMessage());
        }
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getMyCourses() {
        User currentUser = securityUtils.getCurrentUser();
        return studentRepository.findByUser(currentUser)
                .map(student -> {
                    List<com.collegeportal.modules.course.entity.Course> courses =
                            courseRepository.findByStudentsId(student.getId());
                    if (courses.isEmpty()) return List.<CourseResponseDTO>of();

                    List<Long> courseIds = courses.stream()
                            .map(c -> c.getId()).toList();

                    record FacultyInfo(Long facultyId, String name, String designation) {}
                    java.util.Map<Long, FacultyInfo> facultyMap = new java.util.HashMap<>();
                    facultyAssignmentRepository.findFacultyDetailsByCourseIds(courseIds)
                            .forEach(row -> {
                                Long cId   = ((Number) row[0]).longValue();
                                Long fId   = ((Number) row[1]).longValue();
                                String fn  = (String) row[2];
                                String ln  = (String) row[3];
                                String des = (String) row[4];
                                String fullName = (ln != null && !ln.isBlank())
                                        ? fn + " " + ln : fn;
                                facultyMap.putIfAbsent(cId, new FacultyInfo(fId, fullName, des));
                            });

                    return courses.stream().map(c -> {
                        FacultyInfo fi = facultyMap.get(c.getId());
                        return courseMapper.toResponseDTO(
                                c,
                                (int) courseRepository.countStudentsByCourseId(c.getId()),
                                true,
                                fi != null ? fi.facultyId() : null,
                                fi != null ? fi.name()      : null,
                                fi != null ? fi.designation() : null);
                    }).toList();
                })
                .orElse(List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getMyClassCourses() {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        List<com.collegeportal.modules.course.entity.Course> courses;

        if (student.getClassStructure() != null) {
            courses = classStructureCourseRepository
                    .findByClassStructureId(student.getClassStructure().getId())
                    .stream()
                    .map(csc -> csc.getCourse())
                    .toList();
        } else if (student.getClassBatch() != null) {
            courses = courseRepository.findByClassBatchId(student.getClassBatch().getId());
        } else if (student.getDepartment() != null) {
            courses = classStructureCourseRepository.findCoursesByDepartmentName(student.getDepartment());
        } else {
            return List.of();
        }

        return courses.stream().map(c -> {
            boolean enrolled = courseRepository.countEnrollment(c.getId(), student.getId()) > 0;
            return courseMapper.toResponseDTO(c,
                    (int) courseRepository.countStudentsByCourseId(c.getId()), enrolled);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentStatsDTO getMyStats() {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        List<com.collegeportal.modules.attendance.entity.Attendance> records =
                attendanceRepository.findByStudent(student);

        List<Long> enrolledCourseIds = courseRepository.findByStudentsId(student.getId())
                .stream().map(c -> c.getId()).toList();

        int totalClasses = records.size();
        int totalPresent = (int) records.stream()
                .filter(a -> a.getStatus() == com.collegeportal.shared.enums.AttendanceStatus.PRESENT)
                .count();
        double overallPct = totalClasses == 0 ? 0.0
                : Math.round((totalPresent * 100.0 / totalClasses) * 10.0) / 10.0;

        java.util.Map<Long, long[]> perCourse = new java.util.HashMap<>();
        for (com.collegeportal.modules.attendance.entity.Attendance a : records) {
            long courseId = a.getCourse().getId();
            perCourse.computeIfAbsent(courseId, k -> new long[]{0, 0});
            perCourse.get(courseId)[1]++;
            if (a.getStatus() == com.collegeportal.shared.enums.AttendanceStatus.PRESENT)
                perCourse.get(courseId)[0]++;
        }
        int coursesAtRisk = (int) perCourse.values().stream()
                .filter(v -> v[1] > 0 && (v[0] * 100.0 / v[1]) < 75)
                .count();

        Integer semester = student.getClassBatch() != null ? student.getClassBatch().getSemester() : null;

        return StudentStatsDTO.builder()
                .totalClasses(totalClasses)
                .totalPresent(totalPresent)
                .overallAttendancePercentage(overallPct)
                .coursesAtRisk(coursesAtRisk)
                .totalEnrolledCourses(enrolledCourseIds.size())
                .yearOfStudy(student.getYearOfStudy())
                .semester(semester)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAlertDTO> getMyAlerts() {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        List<StudentAlertDTO> alerts = new java.util.ArrayList<>();
        List<com.collegeportal.modules.course.entity.Course> courses =
                courseRepository.findByStudentsId(student.getId());

        // 1. Attendance alerts
        List<com.collegeportal.modules.attendance.entity.Attendance> records =
                attendanceRepository.findByStudent(student);
        java.util.Map<Long, long[]> perCourse = new java.util.HashMap<>();
        for (com.collegeportal.modules.attendance.entity.Attendance a : records) {
            long cId = a.getCourse().getId();
            perCourse.computeIfAbsent(cId, k -> new long[]{0, 0});
            perCourse.get(cId)[1]++;
            if (a.getStatus() == com.collegeportal.shared.enums.AttendanceStatus.PRESENT)
                perCourse.get(cId)[0]++;
        }
        for (com.collegeportal.modules.course.entity.Course c : courses) {
            long[] v = perCourse.get(c.getId());
            if (v == null || v[1] == 0) continue;
            double pct = v[0] * 100.0 / v[1];
            if (pct < 75) {
                alerts.add(StudentAlertDTO.builder()
                        .type(StudentAlertDTO.Type.ATTENDANCE_LOW)
                        .message(pct < 50
                                ? String.format("%s: attendance critical at %.0f%%", c.getName(), pct)
                                : String.format("%s: attendance at risk at %.0f%%", c.getName(), pct))
                        .courseId(c.getId()).courseName(c.getName())
                        .severity(pct < 50 ? StudentAlertDTO.Severity.HIGH : StudentAlertDTO.Severity.MEDIUM)
                        .build());
            }
        }

        // 2. Profile incomplete
        if (student.getPhone() == null || student.getDateOfBirth() == null || student.getYearOfStudy() == null) {
            alerts.add(StudentAlertDTO.builder()
                    .type(StudentAlertDTO.Type.PROFILE_INCOMPLETE)
                    .message("Your profile is incomplete. Please fill in missing details.")
                    .severity(StudentAlertDTO.Severity.MEDIUM)
                    .build());
        }

        // 3. IA pending — enrolled courses with no IA records
        java.util.Set<Long> iaCourseIds = new java.util.HashSet<>(
                iaRepository.findDistinctCourseIdsByStudentId(student.getId()));
        for (com.collegeportal.modules.course.entity.Course c : courses) {
            if (!iaCourseIds.contains(c.getId())) {
                alerts.add(StudentAlertDTO.builder()
                        .type(StudentAlertDTO.Type.IA_PENDING)
                        .message(String.format("%s: IA marks not yet entered", c.getName()))
                        .courseId(c.getId()).courseName(c.getName())
                        .severity(StudentAlertDTO.Severity.LOW)
                        .build());
            }
        }

        return alerts;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassmateResponseDTO> getMyClassmates(Long courseId) {
        User currentUser = securityUtils.getCurrentUser();
        Student me = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        if (courseRepository.countEnrollment(courseId, me.getId()) == 0) {
            throw new ForbiddenException("You are not enrolled in this course");
        }
        return studentRepository.findByCourseId(courseId).stream()
                .filter(s -> !s.getId().equals(me.getId()))
                .map(s -> ClassmateResponseDTO.builder()
                        .id(s.getId())
                        .firstName(s.getFirstName())
                        .lastName(s.getLastName())
                        .department(s.getDepartment())
                        .yearOfStudy(s.getYearOfStudy())
                        .photoUrl(s.getPhotoUrl())
                        .build())
                .toList();
    }
}
