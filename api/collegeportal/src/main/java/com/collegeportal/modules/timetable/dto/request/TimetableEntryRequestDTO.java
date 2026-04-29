package com.collegeportal.modules.timetable.dto.request;

import com.collegeportal.modules.timetable.enums.DayOfWeek;
import com.collegeportal.modules.timetable.enums.EntryType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Getter
@NoArgsConstructor
public class TimetableEntryRequestDTO {

    @NotNull
    private Long classStructureId;

    @NotNull
    private Long courseId;

    private Long facultyId;

    @NotNull
    private DayOfWeek dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    private String room;

    @NotNull
    private EntryType type;
}
