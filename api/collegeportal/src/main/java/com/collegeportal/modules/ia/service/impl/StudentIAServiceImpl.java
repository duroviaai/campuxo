package com.collegeportal.modules.ia.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.batch.repository.BatchRepository;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.department.repository.DepartmentRepository;
import com.collegeportal.modules.ia.dto.response.StudentAssignmentResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentFinalMarksResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentSeminarResponseDTO;
import com.collegeportal.modules.ia.entity.InternalAssessment;
import com.collegeportal.modules.ia.repository.AssignmentRepository;
import com.collegeportal.modules.ia.repository.InternalAssessmentRepository;
import com.collegeportal.modules.ia.repository.SeminarRepository;
import com.collegeportal.modules.ia.service.StudentIAService;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentIAServiceImpl implements StudentIAService {

    private final InternalAssessmentRepository iaRepository;
    private final AssignmentRepository assignmentRepository;
    private final SeminarRepository seminarRepository;
    private final StudentRepository studentRepository;
    private final ClassStructureRepository classStructureRepository;
    private final BatchRepository batchRepository;
    private final DepartmentRepository departmentRepository;
    private final SecurityUtils securityUtils;

    private Student currentStudent() {
        return studentRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Long getMyClassStructureId() {
        Student student = currentStudent();
        var batch = student.getClassBatch();
        if (batch == null) return null;

        var dept = departmentRepository.findByName(batch.getName()).orElse(null);
        if (dept == null) return null;

        var batchEntity = batchRepository
                .findAll().stream()
                .filter(b -> b.getStartYear().equals(batch.getStartYear())
                          && b.getEndYear().equals(batch.getEndYear())
                          && b.getScheme().equals(batch.getScheme()))
                .findFirst().orElse(null);
        if (batchEntity == null) return null;

        Integer year     = batch.getYearOfStudy();
        Integer semester = batch.getSemester();
        if (year == null || semester == null) return null;

        return classStructureRepository
                .findByBatchIdAndDepartmentIdAndSpecializationIsNullAndYearOfStudyAndSemester(
                        batchEntity.getId(), dept.getId(), year, semester)
                .map(cs -> cs.getId())
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentIAResponseDTO getMyIAMarks(Long courseId, Long classStructureId) {
        Student student = currentStudent();
        List<InternalAssessment> records = iaRepository
                .findByClassStructureIdAndCourseId(classStructureId, courseId)
                .stream()
                .filter(ia -> ia.getStudent().getId().equals(student.getId()))
                .toList();

        Map<Integer, BigDecimal> marks    = new LinkedHashMap<>();
        Map<Integer, BigDecimal> maxMarks = new LinkedHashMap<>();
        Map<Integer, LocalDate>  dates    = new LinkedHashMap<>();
        records.forEach(ia -> {
            marks.put(ia.getIaNumber(), ia.getMarksObtained());
            maxMarks.put(ia.getIaNumber(), ia.getMaxMarks());
            if (ia.getIaDate() != null) dates.put(ia.getIaNumber(), ia.getIaDate());
        });

        BigDecimal finalMarks = records.isEmpty() ? null : records.get(0).getFinalMarks();
        LocalDate finalDate   = records.isEmpty() ? null : records.get(0).getFinalMarksCalculatedDate();

        return StudentIAResponseDTO.builder()
                .studentId(student.getId())
                .marks(marks)
                .maxMarks(maxMarks)
                .dates(dates)
                .finalMarks(finalMarks)
                .finalMarksCalculatedDate(finalDate)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentAssignmentResponseDTO getMyAssignment(Long courseId, Long classStructureId) {
        Student student = currentStudent();
        return assignmentRepository
                .findByStudentIdAndCourseIdAndClassStructureId(student.getId(), courseId, classStructureId)
                .map(a -> StudentAssignmentResponseDTO.builder()
                        .studentId(student.getId())
                        .submitted(a.getSubmitted())
                        .marksObtained(a.getMarksObtained())
                        .maxMarks(a.getMaxMarks())
                        .assignmentDate(a.getAssignmentDate())
                        .build())
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentSeminarResponseDTO getMySeminar(Long courseId, Long classStructureId) {
        Student student = currentStudent();
        return seminarRepository
                .findByStudentIdAndCourseIdAndClassStructureId(student.getId(), courseId, classStructureId)
                .map(s -> StudentSeminarResponseDTO.builder()
                        .studentId(student.getId())
                        .done(s.getDone())
                        .scriptSubmitted(s.getScriptSubmitted())
                        .marksObtained(s.getMarksObtained())
                        .maxMarks(s.getMaxMarks())
                        .seminarDate(s.getSeminarDate())
                        .build())
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinalMarksResponseDTO getMyFinalMarks(Long courseId, Long classStructureId) {
        Student student = currentStudent();
        List<InternalAssessment> records = iaRepository
                .findByClassStructureIdAndCourseId(classStructureId, courseId)
                .stream()
                .filter(ia -> ia.getStudent().getId().equals(student.getId()))
                .toList();

        if (records.isEmpty()) return null;

        Map<Integer, BigDecimal> iaMarks = new java.util.HashMap<>();
        records.forEach(ia -> iaMarks.put(ia.getIaNumber(), ia.getMarksObtained()));

        BigDecimal topTwoAvg = records.size() >= 2
                ? records.stream()
                        .map(InternalAssessment::getMarksObtained)
                        .sorted(Comparator.reverseOrder())
                        .limit(2)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP)
                : null;

        LocalDate calcDate = records.get(0).getFinalMarksCalculatedDate();

        return StudentFinalMarksResponseDTO.builder()
                .studentId(student.getId())
                .ia1Marks(iaMarks.getOrDefault(1, null))
                .ia2Marks(iaMarks.getOrDefault(2, null))
                .ia3Marks(iaMarks.getOrDefault(3, null))
                .topTwoAverage(topTwoAvg)
                .finalMarks(records.get(0).getFinalMarks() != null ? records.get(0).getFinalMarks() : topTwoAvg)
                .calculatedDate(calcDate)
                .build();
    }
}
