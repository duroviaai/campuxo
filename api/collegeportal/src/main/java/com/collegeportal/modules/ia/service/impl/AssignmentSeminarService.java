package com.collegeportal.modules.ia.service.impl;

import com.collegeportal.exception.custom.ForbiddenException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.ia.dto.request.AssignmentSaveRequestDTO;
import com.collegeportal.modules.ia.dto.request.SeminarSaveRequestDTO;
import com.collegeportal.modules.ia.dto.response.StudentAssignmentResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentSeminarResponseDTO;
import com.collegeportal.modules.ia.entity.Assignment;
import com.collegeportal.modules.ia.entity.Seminar;
import com.collegeportal.modules.ia.repository.AssignmentRepository;
import com.collegeportal.modules.ia.repository.SeminarRepository;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentSeminarService {

    private final AssignmentRepository assignmentRepository;
    private final SeminarRepository seminarRepository;
    private final ClassStructureRepository classStructureRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final ClassBatchRepository classBatchRepository;
    private final FacultyCourseAssignmentRepository assignmentFcaRepository;
    private final FacultyRepository facultyRepository;
    private final SecurityUtils securityUtils;

    private void assertFacultyCourseAccess(Long courseId) {
        boolean isFaculty = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_FACULTY"));
        if (!isFaculty) return;
        Faculty faculty = facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
        if (!assignmentFcaRepository.existsByFacultyIdAndCourseId(faculty.getId(), courseId)) {
            throw new ForbiddenException("You are not assigned to this course");
        }
    }

    // ── Assignment ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StudentAssignmentResponseDTO> getAssignments(Long classStructureId, Long courseId) {
        assertFacultyCourseAccess(courseId);
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));
        List<Student> students = resolveStudents(cs);
        Map<Long, Assignment> byStudent = assignmentRepository
                .findByClassStructureIdAndCourseId(classStructureId, courseId)
                .stream().collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        return students.stream().map(s -> {
            Assignment a = byStudent.get(s.getId());
            return StudentAssignmentResponseDTO.builder()
                    .studentId(s.getId())
                    .studentName(s.getFirstName() + " " + (s.getLastName() != null ? s.getLastName() : ""))
                    .registrationNumber(s.getUser() != null ? s.getUser().getRegistrationNumber() : null)
                    .submitted(a != null && Boolean.TRUE.equals(a.getSubmitted()))
                    .marksObtained(a != null ? a.getMarksObtained() : null)
                    .maxMarks(a != null ? a.getMaxMarks() : null)
                    .assignmentDate(a != null ? a.getAssignmentDate() : null)
                    .build();
        }).toList();
    }

    @Transactional
    public void saveAssignments(AssignmentSaveRequestDTO req) {
        assertFacultyCourseAccess(req.getCourseId());
        ClassStructure cs = classStructureRepository.findById(req.getClassStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Map<Long, Student> studentMap = studentRepository.findAllById(
                req.getRecords().stream().map(AssignmentSaveRequestDTO.StudentAssignmentDTO::getStudentId).toList())
                .stream().collect(Collectors.toMap(Student::getId, s -> s));

        List<Assignment> toSave = req.getRecords().stream().map(r -> {
            Student student = studentMap.get(r.getStudentId());
            if (student == null) throw new ResourceNotFoundException("Student not found: " + r.getStudentId());
            Assignment a = assignmentRepository
                    .findByStudentIdAndCourseIdAndClassStructureId(r.getStudentId(), req.getCourseId(), req.getClassStructureId())
                    .orElse(Assignment.builder().student(student).course(course).classStructure(cs).build());
            a.setSubmitted(r.getSubmitted());
            a.setMarksObtained(r.getMarksObtained());
            a.setMaxMarks(req.getMaxMarks());
            if (req.getAssignmentDate() != null) a.setAssignmentDate(req.getAssignmentDate());
            return a;
        }).toList();
        assignmentRepository.saveAll(toSave);
    }

    // ── Seminar ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StudentSeminarResponseDTO> getSeminars(Long classStructureId, Long courseId) {
        assertFacultyCourseAccess(courseId);
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));
        List<Student> students = resolveStudents(cs);
        Map<Long, Seminar> byStudent = seminarRepository
                .findByClassStructureIdAndCourseId(classStructureId, courseId)
                .stream().collect(Collectors.toMap(s -> s.getStudent().getId(), s -> s));

        return students.stream().map(s -> {
            Seminar sem = byStudent.get(s.getId());
            return StudentSeminarResponseDTO.builder()
                    .studentId(s.getId())
                    .studentName(s.getFirstName() + " " + (s.getLastName() != null ? s.getLastName() : ""))
                    .registrationNumber(s.getUser() != null ? s.getUser().getRegistrationNumber() : null)
                    .done(sem != null && Boolean.TRUE.equals(sem.getDone()))
                    .scriptSubmitted(sem != null && Boolean.TRUE.equals(sem.getScriptSubmitted()))
                    .marksObtained(sem != null ? sem.getMarksObtained() : null)
                    .maxMarks(sem != null ? sem.getMaxMarks() : null)
                    .seminarDate(sem != null ? sem.getSeminarDate() : null)
                    .submittedDate(sem != null ? sem.getSubmittedDate() : null)
                    .build();
        }).toList();
    }

    @Transactional
    public void saveSeminars(SeminarSaveRequestDTO req) {
        assertFacultyCourseAccess(req.getCourseId());
        ClassStructure cs = classStructureRepository.findById(req.getClassStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Map<Long, Student> studentMap = studentRepository.findAllById(
                req.getRecords().stream().map(SeminarSaveRequestDTO.StudentSeminarDTO::getStudentId).toList())
                .stream().collect(Collectors.toMap(Student::getId, s -> s));

        List<Seminar> toSave = req.getRecords().stream().map(r -> {
            Student student = studentMap.get(r.getStudentId());
            if (student == null) throw new ResourceNotFoundException("Student not found: " + r.getStudentId());
            Seminar sem = seminarRepository
                    .findByStudentIdAndCourseIdAndClassStructureId(r.getStudentId(), req.getCourseId(), req.getClassStructureId())
                    .orElse(Seminar.builder().student(student).course(course).classStructure(cs).build());
            sem.setDone(r.getDone());
            sem.setScriptSubmitted(r.getScriptSubmitted());
            sem.setMarksObtained(r.getMarksObtained());
            sem.setMaxMarks(req.getMaxMarks());
            if (req.getSeminarDate() != null) sem.setSeminarDate(req.getSeminarDate());
            if (r.getSubmittedDate() != null) sem.setSubmittedDate(r.getSubmittedDate());
            return sem;
        }).toList();
        seminarRepository.saveAll(toSave);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private List<Student> resolveStudents(ClassStructure cs) {
        String deptName = cs.getDepartment().getName();
        Integer yearOfStudy = cs.getYearOfStudy();
        List<Long> batchIds = classBatchRepository.findByName(deptName).stream()
                .filter(b -> yearOfStudy.equals(b.getYearOfStudy()))
                .map(ClassBatch::getId).toList();
        if (batchIds.isEmpty()) return List.of();
        return batchIds.stream()
                .flatMap(bid -> studentRepository.findByClassBatchId(bid).stream())
                .distinct().toList();
    }
}
