package com.collegeportal.modules.attendance.repository;

import com.collegeportal.modules.attendance.entity.Attendance;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudent(Student student);

    List<Attendance> findByCourse(Course course);

    Page<Attendance> findByStudent(Student student, Pageable pageable);

    boolean existsByStudentIdAndCourseIdAndClassBatchIdAndDate(Long studentId, Long courseId, Long classBatchId, LocalDate date);

    List<Attendance> findByCourseIdAndClassBatchIdAndDate(Long courseId, Long classBatchId, LocalDate date);

    List<Attendance> findByCourseIn(List<Course> courses);
}
