package com.collegeportal.modules.ia.repository;

import com.collegeportal.modules.ia.entity.InternalAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InternalAssessmentRepository extends JpaRepository<InternalAssessment, Long> {

    List<InternalAssessment> findByClassStructureIdAndCourseId(Long classStructureId, Long courseId);

    @Query("SELECT ia FROM InternalAssessment ia WHERE ia.student.id = :studentId AND ia.course.id = :courseId")
    List<InternalAssessment> findByStudentIdAndCourseId(
            @Param("studentId") Long studentId, @Param("courseId") Long courseId);

    Optional<InternalAssessment> findByStudentIdAndCourseIdAndClassStructureIdAndIaNumber(
            Long studentId, Long courseId, Long classStructureId, Integer iaNumber);

    @Query("SELECT ia FROM InternalAssessment ia WHERE ia.student.id = :studentId AND ia.classStructure.id = :classStructureId")
    List<InternalAssessment> findByStudentIdAndClassStructureId(
            @Param("studentId") Long studentId, @Param("classStructureId") Long classStructureId);

    @Query("SELECT DISTINCT ia.course.id FROM InternalAssessment ia WHERE ia.student.id = :studentId")
    List<Long> findDistinctCourseIdsByStudentId(@Param("studentId") Long studentId);
}
