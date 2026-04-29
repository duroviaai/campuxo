package com.collegeportal.modules.timetable.repository;

import com.collegeportal.modules.timetable.entity.TimetableEntry;
import com.collegeportal.modules.timetable.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {

    @Query("SELECT t FROM TimetableEntry t JOIN FETCH t.course JOIN FETCH t.classStructure LEFT JOIN FETCH t.faculty WHERE t.classStructure.id = :csId ORDER BY t.dayOfWeek, t.startTime")
    List<TimetableEntry> findByClassStructureId(@Param("csId") Long classStructureId);

    @Query("SELECT t FROM TimetableEntry t JOIN FETCH t.course JOIN FETCH t.classStructure LEFT JOIN FETCH t.faculty WHERE t.faculty.id = :facultyId ORDER BY t.dayOfWeek, t.startTime")
    List<TimetableEntry> findByFacultyId(@Param("facultyId") Long facultyId);

    @Query("""
        SELECT t FROM TimetableEntry t
        WHERE t.classStructure.id = :csId
          AND t.dayOfWeek = :day
          AND t.id <> :excludeId
          AND t.startTime < :endTime
          AND t.endTime > :startTime
        """)
    List<TimetableEntry> findConflicts(
        @Param("csId") Long classStructureId,
        @Param("day") DayOfWeek day,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeId") Long excludeId
    );
}
