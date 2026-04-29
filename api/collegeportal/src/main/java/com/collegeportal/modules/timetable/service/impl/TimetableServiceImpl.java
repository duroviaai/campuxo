package com.collegeportal.modules.timetable.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.modules.timetable.dto.request.TimetableEntryRequestDTO;
import com.collegeportal.modules.timetable.dto.response.TimetableEntryResponseDTO;
import com.collegeportal.modules.timetable.entity.TimetableEntry;
import com.collegeportal.modules.timetable.repository.TimetableEntryRepository;
import com.collegeportal.modules.timetable.service.TimetableService;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableServiceImpl implements TimetableService {

    private final TimetableEntryRepository timetableRepository;
    private final ClassStructureRepository classStructureRepository;
    private final CourseRepository courseRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryResponseDTO> getByClassStructure(Long classStructureId) {
        return timetableRepository.findByClassStructureId(classStructureId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryResponseDTO> getByFaculty(Long facultyId) {
        return timetableRepository.findByFacultyId(facultyId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryResponseDTO> getMyFacultyTimetable() {
        var faculty = facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
        return getByFaculty(faculty.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryResponseDTO> getMyTimetable() {
        var student = studentRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        if (student.getClassStructure() == null) return List.of();
        return timetableRepository.findByClassStructureId(student.getClassStructure().getId())
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional
    public TimetableEntryResponseDTO create(TimetableEntryRequestDTO request) {
        validateTimes(request);
        checkConflicts(request.getClassStructureId(), request.getDayOfWeek(),
                request.getStartTime(), request.getEndTime(), -1L);
        TimetableEntry entry = buildEntry(new TimetableEntry(), request);
        return toDTO(timetableRepository.save(entry));
    }

    @Override
    @Transactional
    public TimetableEntryResponseDTO update(Long id, TimetableEntryRequestDTO request) {
        TimetableEntry entry = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found: " + id));
        validateTimes(request);
        checkConflicts(request.getClassStructureId(), request.getDayOfWeek(),
                request.getStartTime(), request.getEndTime(), id);
        return toDTO(timetableRepository.save(buildEntry(entry, request)));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!timetableRepository.existsById(id))
            throw new ResourceNotFoundException("Timetable entry not found: " + id);
        timetableRepository.deleteById(id);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void validateTimes(TimetableEntryRequestDTO req) {
        if (!req.getStartTime().isBefore(req.getEndTime()))
            throw new BadRequestException("Start time must be before end time");
    }

    private void checkConflicts(Long csId, com.collegeportal.modules.timetable.enums.DayOfWeek day,
                                java.time.LocalTime start, java.time.LocalTime end, Long excludeId) {
        List<TimetableEntry> conflicts = timetableRepository.findConflicts(csId, day, start, end, excludeId);
        if (!conflicts.isEmpty()) {
            TimetableEntry c = conflicts.get(0);
            throw new BadRequestException(
                    "Time conflict with " + c.getCourse().getName() +
                    " (" + c.getStartTime() + "\u2013" + c.getEndTime() + ")");
        }
    }

    private TimetableEntry buildEntry(TimetableEntry entry, TimetableEntryRequestDTO req) {
        entry.setClassStructure(classStructureRepository.findById(req.getClassStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found: " + req.getClassStructureId())));
        entry.setCourse(courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + req.getCourseId())));
        entry.setFaculty(req.getFacultyId() != null
                ? facultyRepository.findById(req.getFacultyId())
                        .orElseThrow(() -> new ResourceNotFoundException("Faculty not found: " + req.getFacultyId()))
                : null);
        entry.setDayOfWeek(req.getDayOfWeek());
        entry.setStartTime(req.getStartTime());
        entry.setEndTime(req.getEndTime());
        entry.setRoom(req.getRoom());
        entry.setType(req.getType());
        return entry;
    }

    private TimetableEntryResponseDTO toDTO(TimetableEntry e) {
        String facultyName = e.getFaculty() != null
                ? e.getFaculty().getFirstName() + (e.getFaculty().getLastName() != null ? " " + e.getFaculty().getLastName() : "")
                : null;
        return TimetableEntryResponseDTO.builder()
                .id(e.getId())
                .dayOfWeek(e.getDayOfWeek())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .room(e.getRoom())
                .type(e.getType())
                .courseId(e.getCourse().getId())
                .courseName(e.getCourse().getName())
                .courseCode(e.getCourse().getCode())
                .facultyId(e.getFaculty() != null ? e.getFaculty().getId() : null)
                .facultyName(facultyName)
                .classStructureId(e.getClassStructure().getId())
                .build();
    }
}
