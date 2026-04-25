package com.collegeportal.modules.facultyassignment.entity;

import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "faculty_course_assignments",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_fca_faculty_course_class",
        columnNames = {"faculty_id", "course_id", "class_structure_id"}
    )
)
public class FacultyCourseAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Nullable: a "base" assignment (no specific class) is allowed so that
     * the faculty→course link is visible before classes are assigned.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_structure_id")
    private ClassStructure classStructure;
}
