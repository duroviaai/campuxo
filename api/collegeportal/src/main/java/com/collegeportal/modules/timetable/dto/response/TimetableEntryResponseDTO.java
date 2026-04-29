package com.collegeportal.modules.timetable.dto.response;

import com.collegeportal.modules.timetable.enums.DayOfWeek;
import com.collegeportal.modules.timetable.enums.EntryType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@Builder
public class TimetableEntryResponseDTO {

    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    private EntryType type;

    private Long courseId;
    private String courseName;
    private String courseCode;

    private Long facultyId;
    private String facultyName;

    private Long classStructureId;
}
