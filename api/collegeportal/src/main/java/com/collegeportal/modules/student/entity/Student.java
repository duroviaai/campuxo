package com.collegeportal.modules.student.entity;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_student_department", columnList = "department"),
        @Index(name = "idx_student_class_batch", columnList = "class_batch_id"),
        @Index(name = "idx_student_user", columnList = "user_id")
})
public class Student extends BaseEntity {

    @Column(nullable = false)
    private String firstName;

    private String lastName;

    private String phone;

    private String department;

    private LocalDate dateOfBirth;

    private Integer yearOfStudy;

    private Integer courseStartYear;

    private Integer courseEndYear;

    private String photoUrl;

    @Column(length = 10)
    private String scheme; // NEP or SEP

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_batch_id")
    private ClassBatch classBatch;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;
}
