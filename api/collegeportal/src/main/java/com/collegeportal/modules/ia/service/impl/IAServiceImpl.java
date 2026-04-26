package com.collegeportal.modules.ia.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.ia.dto.request.IASaveRequestDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.entity.InternalAssessment;
import com.collegeportal.modules.ia.repository.InternalAssessmentRepository;
import com.collegeportal.modules.ia.service.IAService;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IAServiceImpl implements IAService {

    private final InternalAssessmentRepository iaRepository;
    private final ClassStructureRepository classStructureRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final ClassBatchRepository classBatchRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StudentIAResponseDTO> getMarks(Long classStructureId, Long courseId) {
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));

        List<Student> students = resolveStudents(cs);
        if (students.isEmpty()) return List.of();

        List<InternalAssessment> records =
                iaRepository.findByClassStructureIdAndCourseId(classStructureId, courseId);

        Map<Long, List<InternalAssessment>> byStudent = records.stream()
                .collect(Collectors.groupingBy(ia -> ia.getStudent().getId()));

        return students.stream().map(s -> {
            List<InternalAssessment> sRecords = byStudent.getOrDefault(s.getId(), List.of());
            Map<Integer, BigDecimal> marks    = new LinkedHashMap<>();
            Map<Integer, BigDecimal> maxMarks = new LinkedHashMap<>();
            sRecords.forEach(ia -> {
                marks.put(ia.getIaNumber(), ia.getMarksObtained());
                maxMarks.put(ia.getIaNumber(), ia.getMaxMarks());
            });
            return StudentIAResponseDTO.builder()
                    .studentId(s.getId())
                    .studentName(s.getFirstName() + " " + (s.getLastName() != null ? s.getLastName() : ""))
                    .registrationNumber(s.getUser() != null ? s.getUser().getRegistrationNumber() : null)
                    .marks(marks)
                    .maxMarks(maxMarks)
                    .build();
        }).toList();
    }

    @Override
    @Transactional
    public void saveMarks(IASaveRequestDTO req) {
        ClassStructure cs = classStructureRepository.findById(req.getClassStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        List<Long> studentIds = req.getMarks().stream()
                .map(IASaveRequestDTO.StudentMarkDTO::getStudentId).toList();
        Map<Long, Student> studentMap = studentRepository.findAllById(studentIds)
                .stream().collect(Collectors.toMap(Student::getId, s -> s));

        List<InternalAssessment> toSave = req.getMarks().stream().map(m -> {
            Student student = studentMap.get(m.getStudentId());
            if (student == null) throw new ResourceNotFoundException("Student not found: " + m.getStudentId());

            InternalAssessment ia = iaRepository
                    .findByStudentIdAndCourseIdAndClassStructureIdAndIaNumber(
                            m.getStudentId(), req.getCourseId(), req.getClassStructureId(), req.getIaNumber())
                    .orElse(InternalAssessment.builder()
                            .student(student).course(course).classStructure(cs)
                            .iaNumber(req.getIaNumber()).build());

            ia.setMarksObtained(m.getMarksObtained());
            ia.setMaxMarks(req.getMaxMarks());
            return ia;
        }).toList();

        iaRepository.saveAll(toSave);
    }

    private List<Student> resolveStudents(ClassStructure cs) {
        String deptName    = cs.getDepartment().getName();
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
