package com.collegeportal.modules.attendance.entity;

import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.shared.entity.BaseEntity;
import com.collegeportal.shared.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "attendance",
        indexes = {
                @Index(name = "idx_attendance_student", columnList = "student_id"),
                @Index(name = "idx_attendance_course_batch_date", columnList = "course_id, class_batch_id, date"),
                @Index(name = "idx_attendance_student_course", columnList = "student_id, course_id")
        },
        uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "course_id", "class_batch_id", "date"})
})
public class Attendance extends BaseEntity {

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_batch_id", nullable = false)
    private ClassBatch classBatch;
}
