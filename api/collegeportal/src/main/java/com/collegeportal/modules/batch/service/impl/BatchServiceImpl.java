package com.collegeportal.modules.batch.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.batch.dto.request.BatchRequestDTO;
import com.collegeportal.modules.batch.dto.response.BatchResponseDTO;
import com.collegeportal.modules.batch.entity.Batch;
import com.collegeportal.modules.batch.repository.BatchRepository;
import com.collegeportal.modules.batch.service.BatchService;
import com.collegeportal.modules.classstructure.repository.ClassStructureCourseRepository;
import com.collegeportal.modules.classstructure.repository.ClassStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final ClassStructureRepository classStructureRepository;
    private final ClassStructureCourseRepository classStructureCourseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponseDTO> getAll() {
        return batchRepository.findAllWithStats().stream().map(row -> BatchResponseDTO.builder()
                .id(((Number) row[0]).longValue())
                .startYear(((Number) row[1]).intValue())
                .endYear(((Number) row[2]).intValue())
                .scheme((String) row[3])
                .totalDepartments(((Number) row[4]).longValue())
                .totalCourses(((Number) row[5]).longValue())
                .build()).toList();
    }

    @Override
    @Transactional
    public BatchResponseDTO create(BatchRequestDTO req) {
        if (req.getEndYear() <= req.getStartYear())
            throw new BadRequestException("End year must be after start year");
        if (batchRepository.existsByStartYearAndEndYearAndScheme(req.getStartYear(), req.getEndYear(), req.getScheme()))
            throw new BadRequestException("Batch already exists for these years and scheme");
        Batch saved = batchRepository.save(Batch.builder()
                .startYear(req.getStartYear())
                .endYear(req.getEndYear())
                .scheme(req.getScheme())
                .build());
        return BatchResponseDTO.builder()
                .id(saved.getId()).startYear(saved.getStartYear())
                .endYear(saved.getEndYear()).scheme(saved.getScheme())
                .totalDepartments(0).totalCourses(0).build();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!batchRepository.existsById(id))
            throw new ResourceNotFoundException("Batch not found: " + id);
        // cascade: remove course assignments then class structures before deleting batch
        List<Long> structureIds = classStructureRepository.findAll().stream()
                .filter(cs -> cs.getBatch().getId().equals(id))
                .map(cs -> cs.getId()).toList();
        if (!structureIds.isEmpty()) {
            classStructureCourseRepository.deleteByClassStructureIdIn(structureIds);
            classStructureRepository.deleteAllById(structureIds);
        }
        batchRepository.deleteById(id);
    }
}
