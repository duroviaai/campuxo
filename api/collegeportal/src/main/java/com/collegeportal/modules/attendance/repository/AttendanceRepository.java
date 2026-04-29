package com.collegeportal.modules.attendance.repository;

import com.collegeportal.modules.attendance.entity.Attendance;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @EntityGraph(attributePaths = {"student", "course"})
    List<Attendance> findByStudent(Student student);

    @EntityGraph(attributePaths = {"student", "course"})
    Page<Attendance> findByStudent(Student student, Pageable pageable);

    boolean existsByStudentIdAndCourseIdAndClassBatchIdAndDate(Long studentId, Long courseId, Long classBatchId, LocalDate date);

    @EntityGraph(attributePaths = {"student", "course"})
    List<Attendance> findByCourseIdAndClassBatchIdAndDate(Long courseId, Long classBatchId, LocalDate date);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.course.id = :courseId AND a.date = :date")
    List<Attendance> findByCourseIdAndDate(@Param("courseId") Long courseId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.student.id IN :studentIds AND a.course.id = :courseId")
    List<Attendance> findByStudentIdInAndCourseId(@Param("studentIds") List<Long> studentIds, @Param("courseId") Long courseId);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.course WHERE a.student.id = :studentId AND a.course.id = :courseId")
    List<Attendance> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("SELECT DISTINCT a.course.id FROM Attendance a WHERE a.student.id = :studentId")
    Set<Long> findCourseIdsByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.course IN :courses")
    List<Attendance> findByCourseIn(@Param("courses") List<Course> courses);

    void deleteByCourseId(Long courseId);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.course.id = :courseId AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date ASC, a.student.id ASC")
    List<Attendance> findByCourseIdAndDateBetween(
            @Param("courseId") Long courseId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /** Present count / total count across all courses in the given list. Returns [presentCount, totalCount]. */
    @Query("SELECT SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), COUNT(a) FROM Attendance a WHERE a.course.id IN :courseIds")
    Object[] findAttendanceRateByCourseIds(@Param("courseIds") List<Long> courseIds);

    long countByStudentIdAndCourseId(Long studentId, Long courseId);

    long countByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, com.collegeportal.shared.enums.AttendanceStatus status);
}
