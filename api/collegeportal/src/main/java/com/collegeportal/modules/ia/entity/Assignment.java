package com.collegeportal.modules.ia.entity;

import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "assignments",
       uniqueConstraints = @UniqueConstraint(name = "uk_assignment",
               columnNames = {"student_id", "course_id", "class_structure_id"}))
public class Assignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_structure_id", nullable = false)
    private ClassStructure classStructure;

    @Column(nullable = false)
    @Builder.Default
    private Boolean submitted = false;

    @Column(name = "marks_obtained", precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "max_marks", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxMarks = BigDecimal.TEN;

    @Column(name = "assignment_date")
    private LocalDate assignmentDate;
}
