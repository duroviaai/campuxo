package com.collegeportal.modules.student.repository;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser(User user);

    boolean existsByUser(User user);

    List<Student> findByClassBatchId(Long classBatchId);
}
