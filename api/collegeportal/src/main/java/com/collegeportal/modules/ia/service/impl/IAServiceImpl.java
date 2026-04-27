package com.collegeportal.modules.ia.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.ia.dto.request.IASaveRequestDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentFinalMarksResponseDTO;
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
import java.math.RoundingMode;
import java.time.LocalDate;
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
            Map<Integer, LocalDate>  dates    = new LinkedHashMap<>();
            sRecords.forEach(ia -> {
                marks.put(ia.getIaNumber(), ia.getMarksObtained());
                maxMarks.put(ia.getIaNumber(), ia.getMaxMarks());
                if (ia.getIaDate() != null) dates.put(ia.getIaNumber(), ia.getIaDate());
            });
            
            BigDecimal finalMarks = sRecords.isEmpty() ? null : sRecords.get(0).getFinalMarks();
            LocalDate finalMarksDate = sRecords.isEmpty() ? null : sRecords.get(0).getFinalMarksCalculatedDate();
            
            return StudentIAResponseDTO.builder()
                    .studentId(s.getId())
                    .studentName(s.getFirstName() + " " + (s.getLastName() != null ? s.getLastName() : ""))
                    .registrationNumber(s.getUser() != null ? s.getUser().getRegistrationNumber() : null)
                    .marks(marks)
                    .maxMarks(maxMarks)
                    .dates(dates)
                    .finalMarks(finalMarks)
                    .finalMarksCalculatedDate(finalMarksDate)
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
            if (req.getIaDate() != null) ia.setIaDate(req.getIaDate());
            return ia;
        }).toList();

        iaRepository.saveAll(toSave);
    }

    @Override
    @Transactional
    public void calculateFinalMarksForAllStudents(Long classStructureId, Long courseId) {
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));

        List<Student> students = resolveStudents(cs);
        if (students.isEmpty()) return;

        List<InternalAssessment> records =
                iaRepository.findByClassStructureIdAndCourseId(classStructureId, courseId);

        Map<Long, List<InternalAssessment>> byStudent = records.stream()
                .collect(Collectors.groupingBy(ia -> ia.getStudent().getId()));

        List<InternalAssessment> toUpdate = new ArrayList<>();
        students.forEach(student -> {
            List<InternalAssessment> studentIAs = byStudent.getOrDefault(student.getId(), List.of());
            if (studentIAs.size() >= 2) {
                BigDecimal finalMarks = calculateTopTwoAverage(studentIAs);
                studentIAs.forEach(ia -> {
                    ia.setFinalMarks(finalMarks);
                    ia.setFinalMarksCalculatedDate(LocalDate.now());
                    toUpdate.add(ia);
                });
            }
        });

        if (!toUpdate.isEmpty()) {
            iaRepository.saveAll(toUpdate);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentFinalMarksResponseDTO> calculateAndGetFinalMarks(Long classStructureId, Long courseId) {
        ClassStructure cs = classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found"));

        List<Student> students = resolveStudents(cs);
        if (students.isEmpty()) return List.of();

        List<InternalAssessment> records =
                iaRepository.findByClassStructureIdAndCourseId(classStructureId, courseId);

        Map<Long, List<InternalAssessment>> byStudent = records.stream()
                .collect(Collectors.groupingBy(ia -> ia.getStudent().getId()));

        return students.stream().map(student -> {
            List<InternalAssessment> studentIAs = byStudent.getOrDefault(student.getId(), List.of());
            Map<Integer, BigDecimal> iaMarks = studentIAs.stream()
                    .collect(Collectors.toMap(InternalAssessment::getIaNumber, InternalAssessment::getMarksObtained));

            BigDecimal ia1 = iaMarks.getOrDefault(1, BigDecimal.ZERO);
            BigDecimal ia2 = iaMarks.getOrDefault(2, BigDecimal.ZERO);
            BigDecimal ia3 = iaMarks.getOrDefault(3, BigDecimal.ZERO);

            BigDecimal topTwoAvg = calculateTopTwoAverage(studentIAs);
            LocalDate calcDate = studentIAs.isEmpty() ? null : studentIAs.get(0).getFinalMarksCalculatedDate();

            return StudentFinalMarksResponseDTO.builder()
                    .studentId(student.getId())
                    .studentName(student.getFirstName() + " " + (student.getLastName() != null ? student.getLastName() : ""))
                    .registrationNumber(student.getUser() != null ? student.getUser().getRegistrationNumber() : null)
                    .ia1Marks(ia1)
                    .ia2Marks(ia2)
                    .ia3Marks(ia3)
                    .topTwoAverage(topTwoAvg)
                    .finalMarks(topTwoAvg)
                    .calculatedDate(calcDate)
                    .build();
        }).toList();
    }

    private BigDecimal calculateTopTwoAverage(List<InternalAssessment> studentIAs) {
        if (studentIAs.size() < 2) return null;

        return studentIAs.stream()
                .map(InternalAssessment::getMarksObtained)
                .sorted(Comparator.reverseOrder())
                .limit(2)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
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
