package com.collegeportal.modules.timetable.service;

import com.collegeportal.modules.timetable.dto.request.TimetableEntryRequestDTO;
import com.collegeportal.modules.timetable.dto.response.TimetableEntryResponseDTO;

import java.util.List;

public interface TimetableService {

    List<TimetableEntryResponseDTO> getByClassStructure(Long classStructureId);

    List<TimetableEntryResponseDTO> getByFaculty(Long facultyId);

    List<TimetableEntryResponseDTO> getMyFacultyTimetable();

    List<TimetableEntryResponseDTO> getMyTimetable();

    TimetableEntryResponseDTO create(TimetableEntryRequestDTO request);

    TimetableEntryResponseDTO update(Long id, TimetableEntryRequestDTO request);

    void delete(Long id);
}
