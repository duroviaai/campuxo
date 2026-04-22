package com.collegeportal.modules.course.entity;

import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "courses", indexes = {
        @Index(name = "idx_course_program_type", columnList = "programType"),
        @Index(name = "idx_course_faculty", columnList = "faculty_id")
})
public class Course extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    private Integer credits;

    // e.g. BCA, BSc, BBA — groups courses into programs
    private String programType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    @ManyToMany
    @JoinTable(
            name = "course_students",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @Builder.Default
    private Set<Student> students = new HashSet<>();
}
