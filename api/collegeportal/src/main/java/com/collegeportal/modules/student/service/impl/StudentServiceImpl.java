package com.collegeportal.modules.student.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.entity.User;
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
    public PageResponseDTO<StudentResponseDTO> getAllStudents(Pageable pageable) {
        return PageResponseDTO.from(
                studentRepository.findAll(pageable).map(studentMapper::toResponseDTO)
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
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getMyCourses() {
        User currentUser = securityUtils.getCurrentUser();
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return courseRepository.findByStudentsId(student.getId())
                .stream().map(courseMapper::toResponseDTO).toList();
    }
}
