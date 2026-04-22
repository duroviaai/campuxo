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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    @Caching(evict = {
        @CacheEvict(value = "courses", allEntries = true),
        @CacheEvict(value = "programs", allEntries = true)
    })
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
        courseRepository.save(course);
        return courseMapper.toResponseDTO(course, (int) courseRepository.countStudentsByCourseId(id), null);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "courses", allEntries = true),
        @CacheEvict(value = "programs", allEntries = true)
    })
    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        courseRepository.delete(course);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "courses", allEntries = true),
        @CacheEvict(value = "programs", allEntries = true)
    })
    @Transactional
    public CourseResponseDTO createCourse(CourseRequestDTO request) {
        if (courseRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Course with code '" + request.getCode() + "' already exists");
        }
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        Course course = courseMapper.toEntity(request, faculty);
        courseRepository.save(course);
        return courseMapper.toResponseDTO(course, 0, null);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Student student = getCurrentStudentOrNull();
        int count = (int) courseRepository.countStudentsByCourseId(id);
        Boolean enrolled = student != null ? courseRepository.countEnrollment(id, student.getId()) > 0 : null;
        return courseMapper.toResponseDTO(course, count, enrolled);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getCourseStudents(Long id) {
        courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return studentRepository.findByCourseId(id).stream()
                .map(studentMapper::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<CourseResponseDTO> getAllCourses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Student student = getCurrentStudentOrNull();
        var coursePage = courseRepository.findAll(pageable);
        var content = coursePage.getContent().stream().map(c -> {
            int count = (int) courseRepository.countStudentsByCourseId(c.getId());
            Boolean enrolled = student != null ? courseRepository.countEnrollment(c.getId(), student.getId()) > 0 : null;
            return courseMapper.toResponseDTO(c, count, enrolled);
        }).toList();
        return new PagedResponseDTO<>(content, coursePage.getNumber(), coursePage.getSize(),
                coursePage.getTotalElements(), coursePage.getTotalPages(), coursePage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<CourseResponseDTO> searchCourses(String programType, String search, int page, int size) {
        String p = programType != null ? programType.trim() : "";
        String s = search != null ? search.trim() : "";
        Pageable pageable = PageRequest.of(page, size);
        Student student = getCurrentStudentOrNull();
        var coursePage = courseRepository.search(p, s, pageable);
        var content = coursePage.getContent().stream().map(c -> {
            int count = (int) courseRepository.countStudentsByCourseId(c.getId());
            Boolean enrolled = student != null ? courseRepository.countEnrollment(c.getId(), student.getId()) > 0 : null;
            return courseMapper.toResponseDTO(c, count, enrolled);
        }).toList();
        return new PagedResponseDTO<>(content, coursePage.getNumber(), coursePage.getSize(),
                coursePage.getTotalElements(), coursePage.getTotalPages(), coursePage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getDeptCourseCounts() {
        return courseRepository.findDistinctProgramTypes().stream()
                .collect(Collectors.toMap(p -> p, courseRepository::countByProgramType));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getCoursesByProgram(String programType) {
        Student student = getCurrentStudentOrNull();
        return courseRepository.findByProgramType(programType).stream().map(c -> {
            int count = (int) courseRepository.countStudentsByCourseId(c.getId());
            Boolean enrolled = student != null ? courseRepository.countEnrollment(c.getId(), student.getId()) > 0 : null;
            return courseMapper.toResponseDTO(c, count, enrolled);
        }).toList();
    }

    @Override
    @Cacheable(value = "programs")
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
        if (courseRepository.countEnrollment(courseId, student.getId()) > 0) {
            throw new BadRequestException("Already enrolled in this course");
        }
        course.getStudents().add(student);
        courseRepository.save(course);
        int count = (int) courseRepository.countStudentsByCourseId(courseId);
        return courseMapper.toResponseDTO(course, count, true);
    }

    @Override
    @Transactional
    public void unenrollStudent(Long courseId) {
        Student student = getRequiredCurrentStudent();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (courseRepository.countEnrollment(courseId, student.getId()) == 0) {
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
