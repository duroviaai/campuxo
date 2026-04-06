package com.collegeportal.modules.classbatch.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.classbatch.dto.request.ClassBatchRequestDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchFilterDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.classbatch.service.ClassBatchService;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassBatchServiceImpl implements ClassBatchService {

    private final ClassBatchRepository classBatchRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final StudentMapper studentMapper;
    private final CourseMapper courseMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ClassBatchResponseDTO> getAllClasses() {
        return classBatchRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public ClassBatchResponseDTO createClass(ClassBatchRequestDTO request) {
        ClassBatch batch = ClassBatch.builder()
                .name(request.getName())
                .section(request.getSection())
                .year(request.getYear())
                .build();
        return toResponseDTO(classBatchRepository.save(batch));
    }

    @Override
    @Transactional
    public ClassBatchResponseDTO updateClass(Long id, ClassBatchRequestDTO request) {
        ClassBatch batch = classBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
        batch.setName(request.getName());
        batch.setSection(request.getSection());
        batch.setYear(request.getYear());
        return toResponseDTO(classBatchRepository.save(batch));
    }

    @Override
    @Transactional
    public void deleteClass(Long id) {
        classBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
        classBatchRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getStudentsByClass(Long classId) {
        classBatchRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        return studentRepository.findByClassBatchId(classId).stream()
                .map(studentMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClassBatchFilterDTO getFilters() {
        return ClassBatchFilterDTO.builder()
                .departments(courseRepository.findDistinctProgramTypes())
                .years(classBatchRepository.findDistinctYears())
                .sections(classBatchRepository.findDistinctSections())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassBatchResponseDTO> getClassesByYearAndSection(Integer year, String section) {
        List<ClassBatch> batches;
        if (year != null && section != null) {
            batches = classBatchRepository.findByYearAndSection(year, section);
        } else if (year != null) {
            batches = classBatchRepository.findByYear(year);
        } else if (section != null) {
            batches = classBatchRepository.findBySection(section);
        } else {
            batches = classBatchRepository.findAll();
        }
        return batches.stream().map(this::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getCoursesByClass(Long classId) {
        classBatchRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        List<Course> courses = courseRepository.findByClassBatchId(classId);
        return courses.stream()
                .map(c -> courseMapper.toResponseDTO(c, null))
                .toList();
    }

    private ClassBatchResponseDTO toResponseDTO(ClassBatch c) {
        return ClassBatchResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .section(c.getSection())
                .year(c.getYear())
                .displayName(c.getName() + " Year " + c.getYear() + " - Sec " + c.getSection())
                .build();
    }
}
