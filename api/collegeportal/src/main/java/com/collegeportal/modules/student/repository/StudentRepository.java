package com.collegeportal.modules.student.repository;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser(User user);

    boolean existsByUser(User user);

    List<Student> findByClassBatchId(Long classBatchId);

    Page<Student> findByDepartment(String department, Pageable pageable);

    Page<Student> findByClassBatchId(Long classBatchId, Pageable pageable);

    Page<Student> findByDepartmentAndClassBatchId(String department, Long classBatchId, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Student> findAll(Pageable pageable);

    @Query(value = "SELECT s.* FROM students s JOIN users u ON u.id = s.user_id WHERE " +
           "(:dept IS NULL OR s.department = :dept) AND " +
           "(:classId IS NULL OR s.class_batch_id = :classId) AND " +
           "(:search IS NULL OR u.full_name ILIKE '%' || CAST(:search AS text) || '%' " +
           "OR u.email ILIKE '%' || CAST(:search AS text) || '%' " +
           "OR u.registration_number ILIKE '%' || CAST(:search AS text) || '%')",
           countQuery = "SELECT COUNT(*) FROM students s JOIN users u ON u.id = s.user_id WHERE " +
           "(:dept IS NULL OR s.department = :dept) AND " +
           "(:classId IS NULL OR s.class_batch_id = :classId) AND " +
           "(:search IS NULL OR u.full_name ILIKE '%' || CAST(:search AS text) || '%' " +
           "OR u.email ILIKE '%' || CAST(:search AS text) || '%' " +
           "OR u.registration_number ILIKE '%' || CAST(:search AS text) || '%')",
           nativeQuery = true)
    Page<Student> findWithFilters(
            @Param("dept")    String dept,
            @Param("classId") Long classId,
            @Param("search")  String search,
            Pageable pageable);
}
