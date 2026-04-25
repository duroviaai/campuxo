package com.collegeportal.modules.course.entity;

import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "courses",
       uniqueConstraints = @UniqueConstraint(name = "uk_course_code_dept", columnNames = {"code", "department_id"}),
       indexes = {
           @Index(name = "idx_course_program_type", columnList = "programType"),
           @Index(name = "idx_courses_dept",         columnList = "department_id")
       })
public class Course extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    private Integer credits;

    private String programType;

    private String scheme;

    private String specialization;

    // department ownership
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToMany
    @JoinTable(
        name = "course_students",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @Builder.Default
    private Set<Student> students = new HashSet<>();

    // Legacy mapping — kept so existing attendance/faculty-assignment data is intact
    @ManyToMany
    @JoinTable(
        name = "class_batch_courses",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "class_batch_id")
    )
    @Builder.Default
    private Set<ClassBatch> classBatches = new HashSet<>();
}
