package com.collegeportal.modules.attendance.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ForbiddenException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.attendance.dto.request.AttendanceBatchRequestDTO;
import com.collegeportal.modules.attendance.dto.request.AttendanceRequestDTO;
import com.collegeportal.modules.attendance.dto.request.AttendanceUpdateRequestDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceSummaryDTO;
import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.attendance.entity.Attendance;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.notification.service.NotificationService;
import com.collegeportal.shared.enums.AttendanceStatus;
import com.collegeportal.shared.enums.NotificationType;
import com.collegeportal.modules.attendance.mapper.AttendanceMapper;
import com.collegeportal.modules.attendance.repository.AttendanceRepository;
import com.collegeportal.modules.attendance.service.AttendanceService;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.dto.PageResponseDTO;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final ClassBatchRepository classBatchRepository;
    private final ClassStructureRepository classStructureRepository;
    private final AttendanceMapper attendanceMapper;
    private final SecurityUtils securityUtils;
    private final FacultyRepository facultyRepository;
    private final FacultyCourseAssignmentRepository assignmentRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AttendanceResponseDTO markAttendance(AttendanceRequestDTO request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        ClassBatch classBatch = classBatchRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        if (attendanceRepository.existsByStudentIdAndCourseIdAndClassBatchIdAndDate(
                request.getStudentId(), request.getCourseId(), request.getClassId(), request.getDate())) {
            throw new BadRequestException("Attendance already marked for this student on this date");
        }

        Attendance attendance = Attendance.builder()
                .date(request.getDate())
                .status(request.getStatus())
                .student(student)
                .course(course)
                .classBatch(classBatch)
                .build();

        return attendanceMapper.toResponseDTO(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponseDTO updateAttendance(Long id, AttendanceUpdateRequestDTO request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + id));
        Faculty faculty = facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
        if (!assignmentRepository.existsByFacultyIdAndCourseId(faculty.getId(), attendance.getCourse().getId())) {
            throw new ForbiddenException("You are not assigned to this course");
        }
        attendance.setStatus(request.getStatus());
        return attendanceMapper.toResponseDTO(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public List<AttendanceResponseDTO> markAttendanceBatch(List<AttendanceBatchRequestDTO> requests) {
        if (requests.isEmpty()) return List.of();

        Long courseId = requests.get(0).getCourseId();
        LocalDate date = requests.get(0).getDate();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        List<Long> studentIds = requests.stream().map(AttendanceBatchRequestDTO::getStudentId).toList();
        Map<Long, Student> studentMap = studentRepository.findAllById(studentIds)
                .stream().collect(java.util.stream.Collectors.toMap(Student::getId, s -> s));

        // Resolve classId: use provided value or fall back to student's classBatch
        Long classId = requests.get(0).getClassId();
        ClassBatch classBatch;
        if (classId != null) {
            classBatch = classBatchRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));
        } else {
            // derive from first student's classBatch
            Student first = studentMap.get(requests.get(0).getStudentId());
            if (first == null || first.getClassBatch() == null)
                throw new BadRequestException("Cannot determine class for attendance — student has no class assigned");
            classBatch = first.getClassBatch();
        }

        final ClassBatch resolvedClass = classBatch;

        Map<Long, Attendance> existingByStudentId = attendanceRepository
                .findByCourseIdAndClassBatchIdAndDate(courseId, resolvedClass.getId(), date)
                .stream().collect(java.util.stream.Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        List<Attendance> toSave = requests.stream().map(req -> {
            Student student = studentMap.get(req.getStudentId());
            if (student == null) throw new ResourceNotFoundException("Student not found: " + req.getStudentId());
            // per-student class resolution
            ClassBatch studentClass = req.getClassId() != null ? resolvedClass
                    : (student.getClassBatch() != null ? student.getClassBatch() : resolvedClass);
            Attendance attendance = existingByStudentId.getOrDefault(req.getStudentId(),
                    Attendance.builder().student(student).course(course).classBatch(studentClass).build());
            attendance.setDate(req.getDate());
            attendance.setStatus(req.getStatus());
            attendance.setClassBatch(studentClass);
            return attendance;
        }).toList();

        List<Attendance> saved = attendanceRepository.saveAll(toSave);

        // Notify each student once per course
        saved.stream()
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getStudent().getId()))
                .forEach((studentId, records) -> {
                    Attendance first = records.get(0);
                    Student s = first.getStudent();
                    if (s.getUser() == null) return;
                    Course c = first.getCourse();
                    notificationService.send(s.getUser().getId(), NotificationType.ATTENDANCE_MARKED,
                            "Attendance Recorded",
                            "Your attendance for " + c.getName() + " on " + first.getDate()
                                    + " has been marked as " + first.getStatus() + ".",
                            "/student/attendance", c.getId(), "COURSE");
                    long total   = attendanceRepository.countByStudentIdAndCourseId(studentId, c.getId());
                    long present = attendanceRepository.countByStudentIdAndCourseIdAndStatus(
                            studentId, c.getId(), AttendanceStatus.PRESENT);
                    if (total > 0) {
                        double pct = Math.round((present * 100.0 / total) * 10.0) / 10.0;
                        if (pct < 75) {
                            notificationService.send(s.getUser().getId(), NotificationType.ATTENDANCE_LOW,
                                    "Attendance Warning",
                                    "Your attendance in " + c.getName() + " is now " + pct
                                            + "%. Minimum required is 75%.",
                                    "/student/attendance", c.getId(), "COURSE");
                        }
                    }
                });

        return saved.stream().map(attendanceMapper::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByCourseAndDate(Long courseId, LocalDate date) {
        if (!courseRepository.existsById(courseId)) throw new ResourceNotFoundException("Course not found");
        return attendanceRepository.findByCourseIdAndDate(courseId, date)
                .stream().map(attendanceMapper::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByCourseClassAndDate(Long courseId, Long classId, LocalDate date) {
        return attendanceRepository.findByCourseIdAndClassBatchIdAndDate(courseId, classId, date)
                .stream()
                .map(attendanceMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<AttendanceResponseDTO> getMyAttendance(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();

        return studentRepository.findByUser(currentUser)
                .map(student -> PageResponseDTO.from(
                        attendanceRepository.findByStudent(student, pageable).map(attendanceMapper::toResponseDTO)
                ))
                .orElse(PageResponseDTO.empty());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSummaryDTO> getMyAttendanceSummary() {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return buildSummary(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSummaryDTO> getStudentAttendanceSummary(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return buildSummary(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceOverviewDTO> getClassCourseOverview(Long classId, Long courseId) {
        classBatchRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        List<Student> students = studentRepository.findByClassBatchIdAndCourseId(classId, courseId);
        // Fallback: if no students found via course enrollment, return all students in the class
        if (students.isEmpty()) {
            students = studentRepository.findByClassBatchId(classId);
        }
        if (students.isEmpty()) return List.of();

        List<Long> studentIds = students.stream().map(Student::getId).toList();
        List<Attendance> allRecords = attendanceRepository.findByStudentIdInAndCourseId(studentIds, courseId);

        Map<Long, List<Attendance>> byStudent = allRecords.stream()
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getStudent().getId()));

        return students.stream().map(s -> {
            List<Attendance> records = byStudent.getOrDefault(s.getId(), List.of());
            List<LocalDate> presentDates = records.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .map(Attendance::getDate).sorted().toList();
            List<LocalDate> absentDates = records.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
                    .map(Attendance::getDate).sorted().toList();
            int total   = records.size();
            int attended = presentDates.size();
            double pct  = total == 0 ? 0.0 : Math.round((attended * 100.0 / total) * 10.0) / 10.0;
            return StudentAttendanceOverviewDTO.builder()
                    .studentId(s.getId())
                    .studentName(s.getFirstName() + " " + (s.getLastName() != null ? s.getLastName() : ""))
                    .registrationNumber(s.getUser() != null ? s.getUser().getRegistrationNumber() : null)
                    .email(s.getUser() != null ? s.getUser().getEmail() : null)
                    .totalClasses(total)
                    .attendedClasses(attended)
                    .attendancePercentage(pct)
                    .presentDates(presentDates)
                    .absentDates(absentDates)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceOverviewDTO> getOverviewByClassStructure(Long classStructureId, Long courseId) {
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found: " + classStructureId));

        // Find students whose classBatch matches this structure's department + yearOfStudy
        String deptName = cs.getDepartment().getName();
        Integer yearOfStudy = cs.getYearOfStudy();

        List<Student> students = studentRepository.findByClassBatchId(0L); // init empty
        // Get all classBatches matching dept name and yearOfStudy
        List<ClassBatch> matchingBatches = classBatchRepository.findByName(deptName).stream()
                .filter(b -> yearOfStudy.equals(b.getYearOfStudy()))
                .toList();

        if (matchingBatches.isEmpty()) return List.of();

        List<Long> batchIds = matchingBatches.stream().map(ClassBatch::getId).toList();
        students = batchIds.stream()
                .flatMap(bid -> studentRepository.findByClassBatchId(bid).stream())
                .distinct()
                .toList();

        if (students.isEmpty()) return List.of();

        List<Long> studentIds = students.stream().map(Student::getId).toList();
        List<Attendance> allRecords = attendanceRepository.findByStudentIdInAndCourseId(studentIds, courseId);
        Map<Long, List<Attendance>> byStudent = allRecords.stream()
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getStudent().getId()));

        return students.stream().map(s -> {
            List<Attendance> records = byStudent.getOrDefault(s.getId(), List.of());
            List<LocalDate> presentDates = records.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .map(Attendance::getDate).sorted().toList();
            List<LocalDate> absentDates = records.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
                    .map(Attendance::getDate).sorted().toList();
            int total    = records.size();
            int attended = presentDates.size();
            double pct   = total == 0 ? 0.0 : Math.round((attended * 100.0 / total) * 10.0) / 10.0;
            return StudentAttendanceOverviewDTO.builder()
                    .studentId(s.getId())
                    .studentName(s.getFirstName() + " " + (s.getLastName() != null ? s.getLastName() : ""))
                    .registrationNumber(s.getUser() != null ? s.getUser().getRegistrationNumber() : null)
                    .email(s.getUser() != null ? s.getUser().getEmail() : null)
                    .totalClasses(total)
                    .attendedClasses(attended)
                    .attendancePercentage(pct)
                    .presentDates(presentDates)
                    .absentDates(absentDates)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByCourseAndClassStructure(Long courseId, Long classStructureId, LocalDate date) {
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found: " + classStructureId));
        String deptName   = cs.getDepartment().getName();
        Integer yearOfStudy = cs.getYearOfStudy();
        List<Long> batchIds = classBatchRepository.findByName(deptName).stream()
                .filter(b -> yearOfStudy.equals(b.getYearOfStudy()))
                .map(ClassBatch::getId).toList();
        if (batchIds.isEmpty()) return List.of();
        return batchIds.stream()
                .flatMap(bid -> attendanceRepository.findByCourseIdAndClassBatchIdAndDate(courseId, bid, date).stream())
                .map(attendanceMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByCourseAndDateRange(
            Long courseId, LocalDate startDate, LocalDate endDate) {
        Faculty faculty = facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
        if (!assignmentRepository.existsByFacultyIdAndCourseId(faculty.getId(), courseId)) {
            throw new ForbiddenException("You are not assigned to this course");
        }
        return attendanceRepository.findByCourseIdAndDateBetween(courseId, startDate, endDate)
                .stream().map(attendanceMapper::toResponseDTO).toList();
    }

    private List<AttendanceSummaryDTO> buildSummary(Student student) {
        List<Attendance> all = attendanceRepository.findByStudent(student);
        Map<Course, List<Attendance>> byCourse = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(Attendance::getCourse));

        return byCourse.entrySet().stream().map(entry -> {
            Course course = entry.getKey();
            List<Attendance> records = entry.getValue();
            List<java.time.LocalDate> presentDates = records.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .map(Attendance::getDate).sorted().toList();
            List<java.time.LocalDate> absentDates = records.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
                    .map(Attendance::getDate).sorted().toList();
            int total = records.size();
            int attended = presentDates.size();
            double pct = total == 0 ? 0.0 : Math.round((attended * 100.0 / total) * 10.0) / 10.0;
            return AttendanceSummaryDTO.builder()
                    .studentId(student.getId())
                    .studentName(student.getFirstName() + (student.getLastName() != null ? " " + student.getLastName() : ""))
                    .courseCode(course.getCode())
                    .courseName(course.getName())
                    .totalClasses(total)
                    .attendedClasses(attended)
                    .attendancePercentage(pct)
                    .presentDates(presentDates)
                    .absentDates(absentDates)
                    .build();
        }).toList();
    }
}
