package com.collegeportal.modules.classbatch.repository;

import com.collegeportal.modules.classbatch.entity.ClassBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClassBatchRepository extends JpaRepository<ClassBatch, Long> {

    @Query("SELECT DISTINCT c.year FROM ClassBatch c ORDER BY c.year")
    List<Integer> findDistinctYears();

    @Query("SELECT DISTINCT c.section FROM ClassBatch c ORDER BY c.section")
    List<String> findDistinctSections();

    List<ClassBatch> findByYear(Integer year);

    List<ClassBatch> findBySection(String section);

    List<ClassBatch> findByYearAndSection(Integer year, String section);
}
