package com.collegeportal.modules.classstructure.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.batch.entity.Batch;
import com.collegeportal.modules.batch.repository.BatchRepository;
import com.collegeportal.modules.classstructure.dto.request.ClassStructureRequestDTO;
import com.collegeportal.modules.classstructure.dto.response.ClassStructureResponseDTO;
import com.collegeportal.modules.classstructure.entity.ClassStructure;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import com.collegeportal.modules.classstructure.service.ClassStructureService;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.modules.department.repository.DepartmentRepository;
import com.collegeportal.modules.specialization.entity.Specialization;
import com.collegeportal.modules.specialization.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClassStructureServiceImpl implements ClassStructureService {

    private final ClassStructureRepository classStructureRepository;
    private final BatchRepository batchRepository;
    private final DepartmentRepository departmentRepository;
    private final SpecializationRepository specializationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ClassStructureResponseDTO> getByBatchDeptSpec(Long batchId, Long deptId, Long specId) {
        List<ClassStructure> list = specId != null
                ? classStructureRepository.findByBatchDeptSpec(batchId, deptId, specId)
                : classStructureRepository.findByBatchDeptNoSpec(batchId, deptId);
        return list.stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional
    public ClassStructureResponseDTO getOrCreate(ClassStructureRequestDTO req) {
        Batch batch = batchRepository.findById(req.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + req.getBatchId()));
        Department dept = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + req.getDepartmentId()));
        Specialization spec = req.getSpecializationId() != null
                ? specializationRepository.findById(req.getSpecializationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Specialization not found: " + req.getSpecializationId()))
                : null;

        Optional<ClassStructure> existing = spec != null
                ? classStructureRepository.findByBatchIdAndDepartmentIdAndSpecializationIdAndYearOfStudyAndSemester(
                        req.getBatchId(), req.getDepartmentId(), req.getSpecializationId(),
                        req.getYearOfStudy(), req.getSemester())
                : classStructureRepository.findByBatchIdAndDepartmentIdAndSpecializationIsNullAndYearOfStudyAndSemester(
                        req.getBatchId(), req.getDepartmentId(), req.getYearOfStudy(), req.getSemester());

        ClassStructure cs = existing.orElseGet(() -> classStructureRepository.save(
                ClassStructure.builder()
                        .batch(batch).department(dept).specialization(spec)
                        .yearOfStudy(req.getYearOfStudy()).semester(req.getSemester())
                        .build()));
        return toDTO(cs);
    }

    private ClassStructureResponseDTO toDTO(ClassStructure cs) {
        return ClassStructureResponseDTO.builder()
                .id(cs.getId())
                .batchId(cs.getBatch().getId())
                .departmentId(cs.getDepartment().getId())
                .departmentName(cs.getDepartment().getName())
                .specializationId(cs.getSpecialization() != null ? cs.getSpecialization().getId() : null)
                .specializationName(cs.getSpecialization() != null ? cs.getSpecialization().getName() : null)
                .yearOfStudy(cs.getYearOfStudy())
                .semester(cs.getSemester())
                .build();
    }
}
