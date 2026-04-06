package com.collegeportal.modules.facultyassignment.entity;

import com.collegeportal.modules.classbatch.entity.ClassBatch;
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
@Table(name = "faculty_course_assignments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"faculty_id", "course_id", "class_batch_id"})
})
public class FacultyCourseAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_batch_id", nullable = false)
    private ClassBatch classBatch;
}
