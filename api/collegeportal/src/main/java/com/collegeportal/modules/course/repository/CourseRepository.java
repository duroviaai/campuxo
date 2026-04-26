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

    List<Course> findByProgramType(String programType);

    @Query("SELECT c FROM Course c WHERE c.programType = :programType AND (c.scheme IS NULL OR c.scheme = :scheme)")
    List<Course> findByProgramTypeAndScheme(@Param("programType") String programType, @Param("scheme") String scheme);

    @Query("SELECT DISTINCT c.programType FROM Course c WHERE c.programType IS NOT NULL ORDER BY c.programType")
    List<String> findDistinctProgramTypes();

    @Query("SELECT c FROM Course c WHERE " +
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

    @Modifying
    @Query(value = "DELETE FROM course_students WHERE course_id = :courseId", nativeQuery = true)
    void removeCourseStudents(@Param("courseId") Long courseId);

    @Modifying
    @Query(value = "DELETE FROM class_batch_courses WHERE course_id = :courseId", nativeQuery = true)
    void removeCourseClassBatches(@Param("courseId") Long courseId);

    @Query("SELECT DISTINCT c FROM Course c JOIN c.classBatches cb WHERE cb.id = :classBatchId")
    List<Course> findByClassBatchId(@org.springframework.data.repository.query.Param("classBatchId") Long classBatchId);

    @Query("SELECT COUNT(DISTINCT c) FROM Course c JOIN c.classBatches cb WHERE cb.name = :dept AND cb.parentBatchId = :parentBatchId")
    long countByDeptAndScheme(@Param("dept") String dept, @Param("parentBatchId") Long parentBatchId);

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.classBatches WHERE c.id = :id")
    java.util.Optional<Course> findByIdWithClassBatches(@Param("id") Long id);

    boolean existsByCodeAndDepartmentId(String code, Long departmentId);

    boolean existsByCodeAndDepartmentIdAndScheme(String code, Long departmentId, String scheme);

    java.util.Optional<Course> findByCodeAndDepartmentId(String code, Long departmentId);

    java.util.Optional<Course> findByCodeAndDepartmentIdAndScheme(String code, Long departmentId, String scheme);

    @Query("SELECT c FROM Course c WHERE c.department.id = :deptId ORDER BY c.name")
    java.util.List<Course> findByDepartmentId(@Param("deptId") Long deptId);

    @Query(value = "SELECT * FROM courses WHERE " +
           "(department_id = :deptId) OR " +
           "(department_id IS NULL AND program_type = :programType) " +
           "ORDER BY name", nativeQuery = true)
    java.util.List<Course> findByDepartmentIdOrProgramType(
            @Param("deptId") Long deptId,
            @Param("programType") String programType);

    @Query(value = "SELECT * FROM courses WHERE " +
           "((department_id = :deptId) OR (department_id IS NULL AND program_type = :programType)) " +
           "AND (:scheme IS NULL OR scheme = :scheme) " +
           "AND (:excludeClassStructureId IS NULL OR id NOT IN (" +
           "  SELECT course_id FROM class_structure_courses WHERE class_structure_id != :excludeClassStructureId" +
           ")) " +
           "ORDER BY name", nativeQuery = true)
    java.util.List<Course> findByDepartmentIdOrProgramTypeAndScheme(
            @Param("deptId") Long deptId,
            @Param("programType") String programType,
            @Param("scheme") String scheme,
            @Param("excludeClassStructureId") Long excludeClassStructureId);

    /** Count courses assigned to a faculty via the assignment table. */
    @Query("SELECT COUNT(DISTINCT a.course.id) FROM com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment a WHERE a.faculty.id = :facultyId")
    long countAssignedCoursesByFacultyId(@Param("facultyId") Long facultyId);

}
