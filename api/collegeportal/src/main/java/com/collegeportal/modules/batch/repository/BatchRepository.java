package com.collegeportal.modules.batch.repository;

import com.collegeportal.modules.batch.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    boolean existsByStartYearAndEndYearAndScheme(Integer startYear, Integer endYear, String scheme);

    @Query(value = """
        SELECT b.id, b.start_year, b.end_year, b.scheme,
               COUNT(DISTINCT cs.department_id) AS dept_count,
               COUNT(DISTINCT csc.course_id)    AS course_count
        FROM batches b
        LEFT JOIN class_structure cs  ON cs.batch_id = b.id
        LEFT JOIN class_structure_courses csc ON csc.class_structure_id = cs.id
        GROUP BY b.id, b.start_year, b.end_year, b.scheme
        ORDER BY b.start_year DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithStats();
}
