package com.collegeportal.modules.course.repository;

import com.collegeportal.modules.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

    @Query("SELECT c FROM Course c LEFT JOIN c.faculty f WHERE " +
           "(COALESCE(:programType, '') = '' OR c.programType = :programType) AND " +
           "(COALESCE(:search, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Course> search(
            @Param("programType") String programType,
            @Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(c) FROM Course c WHERE c.programType = :programType")
    long countByProgramType(@Param("programType") String programType);

    @Query("SELECT COUNT(s) FROM Course c JOIN c.students s WHERE c.id = :courseId")
    long countStudentsByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(s) FROM Course c JOIN c.students s WHERE c.id = :courseId AND s.id = :studentId")
    long countEnrollment(@Param("courseId") Long courseId, @Param("studentId") Long studentId);

    @Modifying
    @Query(value = "DELETE FROM course_students WHERE student_id = :studentId", nativeQuery = true)
    void removeStudentFromAllCourses(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT c FROM Course c JOIN c.students s WHERE s.classBatch.id = :classBatchId")
    List<Course> findByClassBatchId(@org.springframework.data.repository.query.Param("classBatchId") Long classBatchId);
}
