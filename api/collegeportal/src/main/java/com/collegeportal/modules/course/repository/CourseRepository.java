package com.collegeportal.modules.course.repository;

import com.collegeportal.modules.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByCode(String code);

    boolean existsByCode(String code);

    List<Course> findByStudentsId(Long studentId);

    List<Course> findByFacultyId(Long facultyId);
}
