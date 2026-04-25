package com.collegeportal.modules.classstructure.service;

import com.collegeportal.modules.classstructure.dto.request.ClassStructureRequestDTO;
import com.collegeportal.modules.classstructure.dto.response.ClassStructureResponseDTO;

import java.util.List;

public interface ClassStructureService {
    List<ClassStructureResponseDTO> getByBatchDeptSpec(Long batchId, Long deptId, Long specId);
    ClassStructureResponseDTO getOrCreate(ClassStructureRequestDTO request);
}
