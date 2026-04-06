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
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.dto.PagedResponseDTO;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CourseMapper courseMapper;
    private final StudentMapper studentMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public CourseResponseDTO updateCourse(Long id, CourseRequestDTO request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setCredits(request.getCredits());
        course.setProgramType(request.getProgramType());
        course.setFaculty(faculty);
        return courseMapper.toResponseDTO(courseRepository.save(course));
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        courseRepository.delete(course);
    }

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
    public CourseResponseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return courseMapper.toResponseDTO(course, getCurrentStudentOrNull());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getCourseStudents(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return course.getStudents().stream().map(studentMapper::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<CourseResponseDTO> getAllCourses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Student student = getCurrentStudentOrNull();
        var coursePage = courseRepository.findAll(pageable);
        var content = coursePage.getContent().stream()
                .map(c -> courseMapper.toResponseDTO(c, student))
                .toList();
        return new PagedResponseDTO<>(content, coursePage.getNumber(), coursePage.getSize(),
                coursePage.getTotalElements(), coursePage.getTotalPages(), coursePage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getCoursesByProgram(String programType) {
        Student student = getCurrentStudentOrNull();
        return courseRepository.findByProgramType(programType).stream()
                .map(c -> courseMapper.toResponseDTO(c, student))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctPrograms() {
        return courseRepository.findDistinctProgramTypes();
    }

    @Override
    @Transactional
    public CourseResponseDTO enrollStudent(Long courseId) {
        Student student = getRequiredCurrentStudent();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getStudents().contains(student)) {
            throw new BadRequestException("Already enrolled in this course");
        }
        course.getStudents().add(student);
        return courseMapper.toResponseDTO(courseRepository.save(course), student);
    }

    @Override
    @Transactional
    public void unenrollStudent(Long courseId) {
        Student student = getRequiredCurrentStudent();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getStudents().contains(student)) {
            throw new BadRequestException("Not enrolled in this course");
        }
        course.getStudents().remove(student);
        courseRepository.save(course);
    }

    private Student getCurrentStudentOrNull() {
        try {
            User user = securityUtils.getCurrentUser();
            return studentRepository.findByUser(user).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private Student getRequiredCurrentStudent() {
        User user = securityUtils.getCurrentUser();
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
    }
}
