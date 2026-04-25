package com.collegeportal.modules.classbatch.entity;

import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "class_batches")
public class ClassBatch extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private Integer startYear;

    private Integer endYear;

    private String scheme;

    private Integer yearOfStudy; // 1, 2, 3

    private String specialization;

    private Long parentBatchId;

    private Integer semester;

    // Legacy column — kept to satisfy NOT NULL DB constraint until column is manually dropped
    @Column(name = "year", nullable = false)
    private Integer year;
}
