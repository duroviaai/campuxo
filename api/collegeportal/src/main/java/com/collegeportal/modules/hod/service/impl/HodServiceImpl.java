package com.collegeportal.modules.hod.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.attendance.dto.response.AttendanceSummaryDTO;
import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.hod.dto.response.FacultyCourseAssignmentDTO;
import com.collegeportal.modules.attendance.service.AttendanceService;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.mapper.FacultyMapper;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.classstructure.repository.ClassStructureCourseRepository;
import com.collegeportal.modules.department.repository.DepartmentRepository;
import com.collegeportal.modules.hod.dto.response.HodStatsDTO;
import com.collegeportal.modules.hod.dto.request.HodUpdateProfileRequestDTO;
import com.collegeportal.modules.hod.service.HodService;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.modules.notification.service.NotificationService;
import com.collegeportal.shared.enums.FacultyRole;
import com.collegeportal.shared.enums.NotificationType;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HodServiceImpl implements HodService {

    private final SecurityUtils securityUtils;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final FacultyMapper facultyMapper;
    private final StudentMapper studentMapper;
    private final CourseMapper courseMapper;
    private final AttendanceService attendanceService;
    private final ClassStructureRepository classStructureRepository;
    private final ClassBatchRepository classBatchRepository;
    private final FacultyCourseAssignmentRepository assignmentRepository;
    private final ClassStructureCourseRepository cscRepository;
    private final DepartmentRepository departmentRepository;
    private final NotificationService notificationService;

    /**
     * Resolves the HOD by looking up the faculty profile of the current user
     * and verifying their role is HOD in the faculty table — the DB source of truth.
     */
    private Faculty resolveHod() {
        Faculty faculty = facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("HOD faculty profile not found"));
        if (faculty.getRole() != FacultyRole.hod) {
            throw new ResourceNotFoundException("Current user is not an HOD");
        }
        return faculty;
    }

    /** Returns all courses belonging to the HOD's department (by FK or legacy programType). */
    private List<Course> findDeptCourses(String deptName) {
        return departmentRepository.findByName(deptName)
                .map(d -> {
                    List<Course> byDept = courseRepository.findByDepartmentId(d.getId());
                    if (!byDept.isEmpty()) return byDept;
                    // fallback for legacy courses stored with programType only
                    return courseRepository.findByProgramType(deptName);
                })
                .orElseGet(() -> courseRepository.findByProgramType(deptName));
    }

    @Override
    @Transactional(readOnly = true)
    public HodStatsDTO getStats() {
        String dept = resolveHod().getDepartment();
        long students = studentRepository.search("", dept, null, Pageable.unpaged()).getTotalElements();
        long faculty  = facultyRepository.findWithFilters(dept, "", Pageable.unpaged()).getTotalElements();
        long courses  = findDeptCourses(dept).size();
        return HodStatsDTO.builder()
                .department(dept)
                .totalStudents(students)
                .totalFaculty(faculty)
                .totalCourses(courses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyResponseDTO> getDepartmentFaculty() {
        String dept = resolveHod().getDepartment();
        return facultyRepository.findWithFilters(dept, "", Pageable.unpaged())
                .map(f -> facultyMapper.toResponseDTO(f,
                        (int) courseRepository.countAssignedCoursesByFacultyId(f.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getDepartmentStudents() {
        String dept = resolveHod().getDepartment();
        return studentRepository.search("", dept, null, Pageable.unpaged())
                .map(studentMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getDepartmentStudentsByClassStructure(Long classStructureId) {
        resolveHod();
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));
        String deptName = cs.getDepartment().getName();
        Integer year = cs.getYearOfStudy();

        // Primary: query students directly by department + yearOfStudy (reliable)
        List<Student> students =
                studentRepository.search("", deptName, null, Pageable.unpaged())
                        .stream()
                        .filter(s -> year.equals(s.getYearOfStudy()))
                        .toList();

        // Fallback: if yearOfStudy not set on students, try via ClassBatch
        if (students.isEmpty()) {
            List<Long> batchIds = classBatchRepository.findByName(deptName).stream()
                    .filter(b -> year.equals(b.getYearOfStudy()))
                    .map(ClassBatch::getId).toList();
            students = batchIds.stream()
                    .flatMap(bid -> studentRepository.findByClassBatchId(bid).stream())
                    .distinct()
                    .toList();
        }

        // Last resort: return all dept students for this year ignoring yearOfStudy filter
        if (students.isEmpty()) {
            students = studentRepository.search("", deptName, null, Pageable.unpaged()).stream().toList();
        }

        return students.stream().map(studentMapper::toResponseDTO).toList();
    }

    private java.util.Map<Long, FacultyCourseAssignment> facultyMapForCourses(List<Long> courseIds) {
        if (courseIds.isEmpty()) return java.util.Collections.emptyMap();
        return courseIds.stream()
                .flatMap(id -> assignmentRepository.findByCourseId(id).stream())
                .collect(java.util.stream.Collectors.toMap(
                        a -> a.getCourse().getId(), a -> a, (a, b) -> a));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getDepartmentCourses() {
        String dept = resolveHod().getDepartment();
        List<Course> courses = findDeptCourses(dept);
        java.util.Map<Long, FacultyCourseAssignment> facultyMap = facultyMapForCourses(
                courses.stream().map(Course::getId).toList());
        return courses.stream().map(c -> {
            FacultyCourseAssignment a = facultyMap.get(c.getId());
            return courseMapper.toResponseDTO(c,
                    (int) courseRepository.countStudentsByCourseId(c.getId()), null,
                    a != null ? a.getFaculty().getId() : null,
                    a != null ? a.getFaculty().getFirstName() : null);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getDeptCoursesByClassStructure(Long classStructureId) {
        resolveHod();
        List<Course> courses = cscRepository.findByClassStructureId(classStructureId).stream()
                .map(csc -> csc.getCourse()).toList();
        java.util.Map<Long, FacultyCourseAssignment> facultyMap = facultyMapForCourses(
                courses.stream().map(Course::getId).toList());
        return courses.stream().map(c -> {
            FacultyCourseAssignment a = facultyMap.get(c.getId());
            return courseMapper.toResponseDTO(c,
                    (int) courseRepository.countStudentsByCourseId(c.getId()), null,
                    a != null ? a.getFaculty().getId() : null,
                    a != null ? a.getFaculty().getFirstName() : null);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceOverviewDTO> getStudentAttendanceOverview(Long courseId, Long classId) {
        return attendanceService.getClassCourseOverview(classId, courseId);
    }

    @Override
    @Transactional
    public void assignFacultyToCourse(Long facultyId, Long courseId, Long classStructureId) {
        Faculty hod = resolveHod();
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        if (!hod.getDepartment().equals(faculty.getDepartment())) {
            throw new BadRequestException("Faculty does not belong to your department");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (classStructureId != null) {
            ClassStructure cs = classStructureRepository.findById(classStructureId)
                    .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));
            if (!assignmentRepository.existsByFacultyIdAndCourseIdAndClassStructureId(facultyId, courseId, classStructureId)) {
                assignmentRepository.save(FacultyCourseAssignment.builder()
                        .faculty(faculty).course(course).classStructure(cs).build());
            }
        } else {
            if (!assignmentRepository.existsByFacultyIdAndCourseId(facultyId, courseId)) {
                assignmentRepository.save(FacultyCourseAssignment.builder()
                        .faculty(faculty).course(course).classStructure(null).build());
            }
        }
        if (faculty.getUser() != null) {
            notificationService.send(faculty.getUser().getId(), NotificationType.COURSE_ASSIGNED,
                    "Course Assigned",
                    "You have been assigned to teach " + course.getName() + ".",
                    "/faculty/courses", course.getId(), "COURSE");
        }
    }

    @Override
    @Transactional
    public void changeFacultyForCourse(Long courseId, Long newFacultyId, Long classStructureId) {
        Faculty hod = resolveHod();
        Faculty newFaculty = facultyRepository.findById(newFacultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        if (!hod.getDepartment().equals(newFaculty.getDepartment())) {
            throw new BadRequestException("Faculty does not belong to your department");
        }
        // Capture old assignments before deleting
        List<FacultyCourseAssignment> oldAssignments = assignmentRepository.findByCourseId(courseId);
        assignmentRepository.deleteByCourseId(courseId);
        // Assign new faculty
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        ClassStructure cs = classStructureId != null
                ? classStructureRepository.findById(classStructureId)
                        .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"))
                : null;
        assignmentRepository.save(FacultyCourseAssignment.builder()
                .faculty(newFaculty).course(course).classStructure(cs).build());
        oldAssignments.forEach(a -> {
            Faculty old = a.getFaculty();
            if (old.getUser() != null && !old.getId().equals(newFaculty.getId())) {
                notificationService.send(old.getUser().getId(), NotificationType.COURSE_REMOVED,
                        "Course Unassigned",
                        "You have been removed from " + course.getName() + ".",
                        "/faculty/courses", course.getId(), "COURSE");
            }
        });
        if (newFaculty.getUser() != null) {
            notificationService.send(newFaculty.getUser().getId(), NotificationType.COURSE_ASSIGNED,
                    "Course Assigned",
                    "You have been assigned to teach " + course.getName() + ".",
                    "/faculty/courses", course.getId(), "COURSE");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceOverviewDTO> getCourseStudentsPerformance(
            Long courseId, Long classStructureId) {
        resolveHod();
        return attendanceService.getOverviewByClassStructure(classStructureId, courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDTO getHodProfile() {
        Faculty hod = resolveHod();
        return facultyMapper.toResponseDTO(hod,
                (int) courseRepository.countAssignedCoursesByFacultyId(hod.getId()));
    }

    @Override
    @Transactional
    public FacultyResponseDTO updateHodProfile(HodUpdateProfileRequestDTO request) {
        Faculty hod = resolveHod();
        if (request.getPhone()         != null) hod.setPhone(request.getPhone());
        if (request.getDesignation()   != null) hod.setDesignation(request.getDesignation());
        if (request.getQualification() != null) hod.setQualification(request.getQualification());
        if (request.getExperience()    != null) hod.setExperience(request.getExperience());
        if (request.getSubjects()      != null) hod.setSubjects(request.getSubjects());
        if (request.getJoiningDate()   != null) hod.setJoiningDate(request.getJoiningDate());
        Faculty saved = facultyRepository.save(hod);
        return facultyMapper.toResponseDTO(saved,
                (int) courseRepository.countAssignedCoursesByFacultyId(saved.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyCourseAssignmentDTO> getFacultyAssignments(Long facultyId) {
        Faculty hod = resolveHod();
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        if (!hod.getDepartment().equals(faculty.getDepartment())) {
            throw new BadRequestException("Faculty does not belong to your department");
        }
        return assignmentRepository.findByFacultyIdWithDetails(facultyId).stream().map(a -> {
            ClassStructure cs = a.getClassStructure();
            return FacultyCourseAssignmentDTO.builder()
                    .courseId(a.getCourse().getId())
                    .courseName(a.getCourse().getName())
                    .courseCode(a.getCourse().getCode())
                    .credits(a.getCourse().getCredits())
                    .classStructureId(cs != null ? cs.getId() : null)
                    .yearOfStudy(cs != null ? cs.getYearOfStudy() : null)
                    .semester(cs != null ? cs.getSemester() : null)
                    .specialization(cs != null && cs.getSpecialization() != null ? cs.getSpecialization().getName() : null)
                    .batchStartYear(cs != null ? cs.getBatch().getStartYear() : null)
                    .batchEndYear(cs != null ? cs.getBatch().getEndYear() : null)
                    .batchScheme(cs != null ? cs.getBatch().getScheme() : null)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSummaryDTO> getStudentPerformance(Long studentId) {
        Faculty hod = resolveHod();
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (!hod.getDepartment().equals(student.getDepartment())) {
            throw new BadRequestException("Student does not belong to your department");
        }
        return attendanceService.getStudentAttendanceSummary(studentId);
    }

    @Override
    @Transactional
    public void removeFacultyFromCourse(Long facultyId, Long courseId) {
        Faculty hod = resolveHod();
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        if (!hod.getDepartment().equals(faculty.getDepartment())) {
            throw new BadRequestException("Faculty does not belong to your department");
        }
        if (!assignmentRepository.existsByFacultyIdAndCourseId(facultyId, courseId)) {
            throw new BadRequestException("Course is not assigned to this faculty");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (faculty.getUser() != null) {
            notificationService.send(faculty.getUser().getId(), NotificationType.COURSE_REMOVED,
                    "Course Unassigned",
                    "You have been removed from " + course.getName() + ".",
                    "/faculty/courses", course.getId(), "COURSE");
        }
        assignmentRepository.deleteByFacultyIdAndCourseId(facultyId, courseId);
    }
}
