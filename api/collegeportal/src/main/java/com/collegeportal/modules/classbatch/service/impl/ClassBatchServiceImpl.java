package com.collegeportal.modules.classbatch.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.classbatch.dto.request.ClassBatchRequestDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchFilterDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.classbatch.service.ClassBatchService;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    private final com.collegeportal.modules.department.repository.DepartmentRepository departmentRepository;
    private final com.collegeportal.modules.classstructure.repository.ClassStructureRepository classStructureRepository;

    @Override
    @Cacheable("classes")
    @Transactional(readOnly = true)
    public List<ClassBatchResponseDTO> getAllClasses() {
        return classBatchRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @CacheEvict(value = "classes", allEntries = true)
    @Transactional
    public ClassBatchResponseDTO createClass(ClassBatchRequestDTO request) {
        ClassBatch batch = ClassBatch.builder()
                .name(request.getName())
                .startYear(request.getStartYear())
                .endYear(request.getEndYear())
                .scheme(request.getScheme())
                .yearOfStudy(request.getYearOfStudy())
                .specialization(request.getSpecialization())
                .parentBatchId(request.getParentBatchId())
                .semester(request.getSemester())
                .year(request.getStartYear())
                .build();
        return toResponseDTO(classBatchRepository.save(batch));
    }

    @Override
    @CacheEvict(value = "classes", allEntries = true)
    @Transactional
    public ClassBatchResponseDTO updateClass(Long id, ClassBatchRequestDTO request) {
        ClassBatch batch = classBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
        batch.setName(request.getName());
        batch.setStartYear(request.getStartYear());
        batch.setEndYear(request.getEndYear());
        batch.setScheme(request.getScheme());
        batch.setYearOfStudy(request.getYearOfStudy());
        batch.setSpecialization(request.getSpecialization());
        batch.setYear(request.getStartYear());
        ClassBatch saved = classBatchRepository.save(batch);

        // Propagate scheme change to all students in this batch
        List<Student> students = studentRepository.findByClassBatchId(id);
        students.forEach(s -> s.setScheme(request.getScheme()));
        studentRepository.saveAll(students);

        return toResponseDTO(saved);
    }

    @Override
    @CacheEvict(value = "classes", allEntries = true)
    @Transactional
    public void deleteClass(Long id) {
        ClassBatch batch = classBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));

        // Detach all students from this batch
        List<Student> students = studentRepository.findByClassBatchId(id);
        students.forEach(s -> s.setClassBatch(null));
        studentRepository.saveAll(students);

        // Remove batch from all course associations
        courseRepository.findByClassBatchId(id).forEach(course -> {
            com.collegeportal.modules.course.entity.Course c =
                courseRepository.findByIdWithClassBatches(course.getId()).orElse(null);
            if (c != null) {
                c.getClassBatches().remove(batch);
                courseRepository.save(c);
            }
        });

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
                .departments(classBatchRepository.findDistinctNames())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassBatchResponseDTO> getClassesByYearAndSection(Integer year, String section) {
        return classBatchRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getCoursesByClass(Long classId) {
        classBatchRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        return courseRepository.findByClassBatchId(classId).stream()
                .map(c -> courseMapper.toResponseDTO(c, (int) courseRepository.countStudentsByCourseId(c.getId()), null))
                .toList();
    }

    @Override
    @Transactional
    public void assignCoursesToClass(Long classId, List<Long> courseIds) {
        ClassBatch batch = classBatchRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        courseIds.forEach(courseId -> {
            com.collegeportal.modules.course.entity.Course course = courseRepository.findByIdWithClassBatches(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
            course.getClassBatches().add(batch);
            courseRepository.save(course);
        });
    }

    @Override
    @Transactional
    public void removeCourseFromClass(Long classId, Long courseId) {
        ClassBatch batch = classBatchRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        com.collegeportal.modules.course.entity.Course course = courseRepository.findByIdWithClassBatches(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        course.getClassBatches().remove(batch);
        courseRepository.save(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllDepartments() {
        java.util.Set<String> depts = new java.util.TreeSet<>();
        depts.addAll(classBatchRepository.findDistinctNames());
        depts.addAll(courseRepository.findDistinctProgramTypes());
        try {
            depts.addAll(departmentRepository.findAll().stream()
                .map(com.collegeportal.modules.department.entity.Department::getName).toList());
        } catch (Exception ignored) {}
        return new java.util.ArrayList<>(depts);
    }

    @Override
    @Transactional
    public ClassBatchResponseDTO resolveByClassStructure(Long classStructureId) {
        com.collegeportal.modules.classstructure.entity.ClassStructure cs =
            classStructureRepository.findById(classStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassStructure not found: " + classStructureId));
        String deptName   = cs.getDepartment().getName();
        Integer year      = cs.getYearOfStudy();
        String scheme     = cs.getBatch().getScheme();
        Integer startYear = cs.getBatch().getStartYear();
        Integer endYear   = cs.getBatch().getEndYear();
        // find existing matching ClassBatch
        ClassBatch match = classBatchRepository.findByName(deptName).stream()
            .filter(b -> year.equals(b.getYearOfStudy())
                      && scheme.equals(b.getScheme())
                      && startYear.equals(b.getStartYear())
                      && endYear.equals(b.getEndYear()))
            .findFirst()
            .orElseGet(() -> classBatchRepository.save(ClassBatch.builder()
                .name(deptName).startYear(startYear).endYear(endYear)
                .scheme(scheme).yearOfStudy(year).year(startYear).build()));
        return toResponseDTO(match);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassBatchResponseDTO> getByDepartment(String department) {
        return classBatchRepository.findByName(department).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private ClassBatchResponseDTO toResponseDTO(ClassBatch c) {
        return ClassBatchResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .startYear(c.getStartYear())
                .endYear(c.getEndYear())
                .scheme(c.getScheme())
                .specialization(c.getSpecialization())
                .yearOfStudy(c.getYearOfStudy())
                .parentBatchId(c.getParentBatchId())
                .semester(c.getSemester())
                .displayName(c.getName() + " " + c.getStartYear() + "-" + c.getEndYear() + " (" + c.getScheme() + ")")
                .build();
    }
}
