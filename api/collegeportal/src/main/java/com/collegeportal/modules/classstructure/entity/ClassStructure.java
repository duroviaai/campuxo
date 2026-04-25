package com.collegeportal.modules.classstructure.entity;

import com.collegeportal.modules.batch.entity.Batch;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.modules.specialization.entity.Specialization;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "class_structure",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_class_structure",
           columnNames = {"batch_id", "department_id", "specialization_id", "year_of_study", "semester"}))
public class ClassStructure extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialization_id")
    private Specialization specialization;

    @Column(name = "year_of_study", nullable = false)
    private Integer yearOfStudy;

    @Column(nullable = false)
    private Integer semester;
}
