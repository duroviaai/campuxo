package com.collegeportal.modules.ia.entity;

import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "internal_assessments",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_ia",
           columnNames = {"student_id", "course_id", "class_structure_id", "ia_number"}))
public class InternalAssessment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_structure_id", nullable = false)
    private ClassStructure classStructure;

    @Column(name = "ia_number", nullable = false)
    private Integer iaNumber;

    @Column(name = "marks_obtained", nullable = false, precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "max_marks", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxMarks = BigDecimal.valueOf(50);
}
