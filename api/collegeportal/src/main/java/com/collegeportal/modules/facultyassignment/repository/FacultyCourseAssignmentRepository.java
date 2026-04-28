package com.collegeportal.modules.facultyassignment.repository;

import com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FacultyCourseAssignmentRepository extends JpaRepository<FacultyCourseAssignment, Long> {

    List<FacultyCourseAssignment> findByFacultyId(Long facultyId);

    @Query("SELECT a FROM FacultyCourseAssignment a " +
           "LEFT JOIN FETCH a.course " +
           "LEFT JOIN FETCH a.classStructure cs " +
           "LEFT JOIN FETCH cs.batch " +
           "LEFT JOIN FETCH cs.specialization " +
           "WHERE a.faculty.id = :facultyId")
    List<FacultyCourseAssignment> findByFacultyIdWithDetails(@Param("facultyId") Long facultyId);

    List<FacultyCourseAssignment> findByCourseId(Long courseId);

    boolean existsByFacultyIdAndCourseId(Long facultyId, Long courseId);

    boolean existsByFacultyIdAndCourseIdAndClassStructureId(Long facultyId, Long courseId, Long classStructureId);

    @Modifying
    @Query("DELETE FROM FacultyCourseAssignment a WHERE a.faculty.id = :facultyId AND a.course.id = :courseId")
    void deleteByFacultyIdAndCourseId(@Param("facultyId") Long facultyId, @Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM FacultyCourseAssignment a WHERE a.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM FacultyCourseAssignment a WHERE a.faculty.id = :facultyId")
    void deleteByFacultyId(@Param("facultyId") Long facultyId);

    /** All distinct course IDs assigned to a faculty member. */
    @Query("SELECT DISTINCT a.course.id FROM FacultyCourseAssignment a WHERE a.faculty.id = :facultyId")
    List<Long> findDistinctCourseIdsByFacultyId(@Param("facultyId") Long facultyId);

    /** All distinct course IDs assigned to ANY faculty (except the given one). */
    @Query("SELECT DISTINCT a.course.id FROM FacultyCourseAssignment a WHERE a.faculty.id <> :excludeFacultyId")
    List<Long> findCourseIdsAssignedToOtherFaculty(@Param("excludeFacultyId") Long excludeFacultyId);

    /** Returns [courseId, facultyFullName, facultyId] tuples for the given course IDs. */
    @Query("SELECT a.course.id, a.faculty.firstName, a.faculty.id FROM FacultyCourseAssignment a WHERE a.course.id IN :courseIds")
    List<Object[]> findFacultyNamesByCourseIds(@Param("courseIds") List<Long> courseIds);
}
