package com.collegeportal.modules.timetable.entity;

import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.timetable.enums.DayOfWeek;
import com.collegeportal.modules.timetable.enums.EntryType;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "timetable_entries")
public class TimetableEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_structure_id", nullable = false)
    private ClassStructure classStructure;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(length = 50)
    private String room;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EntryType type = EntryType.LECTURE;
}
