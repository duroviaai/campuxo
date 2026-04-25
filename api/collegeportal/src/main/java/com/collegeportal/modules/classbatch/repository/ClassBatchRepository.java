package com.collegeportal.modules.classbatch.repository;

import com.collegeportal.modules.classbatch.entity.ClassBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClassBatchRepository extends JpaRepository<ClassBatch, Long> {

    @Query("SELECT DISTINCT c.name FROM ClassBatch c ORDER BY c.name")
    List<String> findDistinctNames();

    List<ClassBatch> findByName(String name);
}
