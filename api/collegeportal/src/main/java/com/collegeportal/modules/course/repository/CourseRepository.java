package com.collegeportal.modules.course.repository;

import com.collegeportal.modules.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByCode(String code);

    boolean existsByCode(String code);

    List<Course> findByStudentsId(Long studentId);

    List<Course> findByFacultyId(Long facultyId);

    List<Course> findByProgramType(String programType);

    @Query("SELECT DISTINCT c.programType FROM Course c WHERE c.programType IS NOT NULL ORDER BY c.programType")
    List<String> findDistinctProgramTypes();

    @Query("SELECT DISTINCT c FROM Course c JOIN c.students s WHERE s.classBatch.id = :classBatchId")
    List<Course> findByClassBatchId(@org.springframework.data.repository.query.Param("classBatchId") Long classBatchId);
}
