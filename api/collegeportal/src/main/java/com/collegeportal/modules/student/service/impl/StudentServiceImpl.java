package com.collegeportal.modules.student.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.attendance.repository.AttendanceRepository;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.student.dto.request.StudentRequestDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.modules.student.service.StudentService;
import com.collegeportal.shared.dto.PageResponseDTO;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final SecurityUtils securityUtils;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final ClassBatchRepository classBatchRepository;
    private final AttendanceRepository attendanceRepository;

    private Student findStudentById(Long id) {
        return studentRepository.findWithUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDTO getStudentById(Long id) {
        return studentMapper.toResponseDTO(findStudentById(id));
    }

    @Override
    @Transactional
    public StudentResponseDTO updateStudent(Long id, StudentRequestDTO request) {
        Student student = findStudentById(id);
        studentMapper.updateEntity(student, request);
        if (request.getClassBatchId() != null) {
            ClassBatch batch = classBatchRepository.findById(request.getClassBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassBatch not found with id: " + request.getClassBatchId()));
            student.setClassBatch(batch);
        } else {
            student.setClassBatch(null);
        }
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        attendanceRepository.deleteAll(attendanceRepository.findByStudent(student));
        courseRepository.removeStudentFromAllCourses(id);
        studentRepository.delete(student);
    }

    @Override
    @Transactional
    public StudentResponseDTO createStudent(StudentRequestDTO request) {
        User currentUser = securityUtils.getCurrentUser();
        if (studentRepository.existsByUser(currentUser)) {
            throw new BadRequestException("Student profile already exists for this user");
        }
        Student student = studentMapper.toEntity(request);
        student.setUser(currentUser);
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<StudentResponseDTO> getAllStudents(Pageable pageable, String search, String department, Long classBatchId) {
        String s = search != null ? search.trim() : "";
        String d = department != null ? department.trim() : "";
        return PageResponseDTO.from(
                studentRepository.search(s, d, classBatchId, pageable).map(studentMapper::toResponseDTO)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDTO getMyProfile() {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return studentMapper.toResponseDTO(student);
    }

    @Override
    @Transactional
    public StudentResponseDTO updateMyProfile(StudentRequestDTO request) {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        studentMapper.updateEntity(student, request);
        return studentMapper.toResponseDTO(studentRepository.save(student));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getMyCourses() {
        User currentUser = securityUtils.getCurrentUser();
        return studentRepository.findByUser(currentUser)
                .map(student -> courseRepository.findByStudentsId(student.getId())
                        .stream().map(c -> courseMapper.toResponseDTO(c,
                                (int) courseRepository.countStudentsByCourseId(c.getId()), true)).toList())
                .orElse(List.of());
    }
}
