package com.collegeportal.modules.attendance.mapper;

import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.attendance.entity.Attendance;
import org.springframework.stereotype.Component;

@Component
public class AttendanceMapper {

    public AttendanceResponseDTO toResponseDTO(Attendance attendance) {
        return AttendanceResponseDTO.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .date(attendance.getDate())
                .status(attendance.getStatus())
                .studentName(attendance.getStudent().getFirstName() + " " + attendance.getStudent().getLastName())
                .courseName(attendance.getCourse().getName())
                .courseCode(attendance.getCourse().getCode())
                .build();
    }
}
