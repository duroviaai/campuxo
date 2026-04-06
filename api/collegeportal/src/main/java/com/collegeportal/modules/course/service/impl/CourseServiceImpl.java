package com.collegeportal.modules.course.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.course.dto.request.CourseRequestDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.course.service.CourseService;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.dto.PagedResponseDTO;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CourseMapper courseMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public CourseResponseDTO createCourse(CourseRequestDTO request) {
        if (courseRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Course with code '" + request.getCode() + "' already exists");
        }

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Course course = courseMapper.toEntity(request, faculty);
        return courseMapper.toResponseDTO(courseRepository.save(course));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<CourseResponseDTO> getAllCourses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        var coursePage = courseRepository.findAll(pageable);
        var content = coursePage.getContent().stream()
                .map(courseMapper::toResponseDTO)
                .toList();
        return new PagedResponseDTO<>(
                content,
                coursePage.getNumber(),
                coursePage.getSize(),
                coursePage.getTotalElements(),
                coursePage.getTotalPages(),
                coursePage.isLast()
        );
    }

    @Override
    @Transactional
    public CourseResponseDTO enrollStudent(Long courseId) {
        User currentUser = securityUtils.getCurrentUser();

        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getStudents().contains(student)) {
            throw new BadRequestException("Student is already enrolled in this course");
        }

        course.getStudents().add(student);
        return courseMapper.toResponseDTO(courseRepository.save(course));
    }
}
