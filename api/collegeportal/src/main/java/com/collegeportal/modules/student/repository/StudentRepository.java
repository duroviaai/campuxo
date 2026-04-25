package com.collegeportal.modules.student.repository;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @EntityGraph(attributePaths = {"user", "classBatch"})
    Optional<Student> findByUser(User user);

    boolean existsByUser(User user);

    @EntityGraph(attributePaths = {"user", "classBatch"})
    List<Student> findByClassBatchId(Long classBatchId);

    Page<Student> findByDepartment(String department, Pageable pageable);

    Page<Student> findByClassBatchId(Long classBatchId, Pageable pageable);

    Page<Student> findByDepartmentAndClassBatchId(String department, Long classBatchId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "classBatch"})
    @Query("SELECT s FROM Student s JOIN Course c ON s MEMBER OF c.students WHERE c.id = :courseId")
    List<Student> findByCourseId(@Param("courseId") Long courseId);

    @EntityGraph(attributePaths = {"user", "classBatch"})
    @Query("SELECT s FROM Student s JOIN Course c ON s MEMBER OF c.students WHERE s.classBatch.id = :classId AND c.id = :courseId")
    List<Student> findByClassBatchIdAndCourseId(@Param("classId") Long classId, @Param("courseId") Long courseId);

    @EntityGraph(attributePaths = "user")
    Page<Student> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "classBatch"})
    @Query("SELECT s FROM Student s WHERE " +
           "(COALESCE(:search, '') = '' OR LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.user.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (COALESCE(:department, '') = '' OR s.department = :department) " +
           "AND (:classBatchId IS NULL OR s.classBatch.id = :classBatchId)")
    Page<Student> search(@Param("search") String search,
                         @Param("department") String department,
                         @Param("classBatchId") @Nullable Long classBatchId,
                         Pageable pageable);

    @EntityGraph(attributePaths = {"user", "classBatch"})
    Optional<Student> findWithUserById(Long id);
}
