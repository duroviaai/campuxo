package com.collegeportal.modules.classbatch.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.classbatch.service.ClassBatchService;
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
    private final StudentMapper studentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ClassBatchResponseDTO> getAllClasses() {
        return classBatchRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
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
