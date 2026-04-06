package com.collegeportal.modules.attendance.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.attendance.dto.request.AttendanceBatchRequestDTO;
import com.collegeportal.modules.attendance.dto.request.AttendanceRequestDTO;
import com.collegeportal.modules.attendance.dto.response.AttendanceResponseDTO;
import com.collegeportal.modules.attendance.entity.Attendance;
import com.collegeportal.modules.attendance.mapper.AttendanceMapper;
import com.collegeportal.modules.attendance.repository.AttendanceRepository;
import com.collegeportal.modules.attendance.service.AttendanceService;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.dto.PageResponseDTO;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final ClassBatchRepository classBatchRepository;
    private final AttendanceMapper attendanceMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public AttendanceResponseDTO markAttendance(AttendanceRequestDTO request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        ClassBatch classBatch = classBatchRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        if (attendanceRepository.existsByStudentIdAndCourseIdAndClassBatchIdAndDate(
                request.getStudentId(), request.getCourseId(), request.getClassId(), request.getDate())) {
            throw new BadRequestException("Attendance already marked for this student on this date");
        }

        Attendance attendance = Attendance.builder()
                .date(request.getDate())
                .status(request.getStatus())
                .student(student)
                .course(course)
                .classBatch(classBatch)
                .build();

        return attendanceMapper.toResponseDTO(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public List<AttendanceResponseDTO> markAttendanceBatch(List<AttendanceBatchRequestDTO> requests) {
        return requests.stream().map(req -> {
            Student student = studentRepository.findById(req.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + req.getStudentId()));

            Course course = courseRepository.findById(req.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + req.getCourseId()));

            ClassBatch classBatch = classBatchRepository.findById(req.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + req.getClassId()));

            Attendance attendance = attendanceRepository
                    .findByCourseIdAndClassBatchIdAndDate(req.getCourseId(), req.getClassId(), req.getDate())
                    .stream()
                    .filter(a -> a.getStudent().getId().equals(req.getStudentId()))
                    .findFirst()
                    .orElse(Attendance.builder().student(student).course(course).classBatch(classBatch).build());

            attendance.setDate(req.getDate());
            attendance.setStatus(req.getStatus());
            attendance.setClassBatch(classBatch);

            return attendanceMapper.toResponseDTO(attendanceRepository.save(attendance));
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByCourseAndDate(Long courseId, LocalDate date) {
        return attendanceRepository.findByCourseIn(
                        List.of(courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Course not found"))))
                .stream()
                .filter(a -> a.getDate().equals(date))
                .map(attendanceMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByCourseClassAndDate(Long courseId, Long classId, LocalDate date) {
        return attendanceRepository.findByCourseIdAndClassBatchIdAndDate(courseId, classId, date)
                .stream()
                .map(attendanceMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<AttendanceResponseDTO> getMyAttendance(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();

        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return PageResponseDTO.from(
                attendanceRepository.findByStudent(student, pageable).map(attendanceMapper::toResponseDTO)
        );
    }
}
