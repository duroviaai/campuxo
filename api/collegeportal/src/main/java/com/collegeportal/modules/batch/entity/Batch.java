package com.collegeportal.modules.batch.entity;

import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "batches",
       uniqueConstraints = @UniqueConstraint(columnNames = {"start_year", "end_year", "scheme"}))
public class Batch extends BaseEntity {

    @Column(name = "start_year", nullable = false)
    private Integer startYear;

    @Column(name = "end_year", nullable = false)
    private Integer endYear;

    @Column(nullable = false, length = 10)
    private String scheme;
}
