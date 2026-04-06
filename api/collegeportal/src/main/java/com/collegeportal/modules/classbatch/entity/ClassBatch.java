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
@Table(name = "class_batches", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"name", "section", "year"})
})
public class ClassBatch extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private Integer year;
}
