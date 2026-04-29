package com.collegeportal.modules.registrationwindow.service.impl;

import com.collegeportal.exception.custom.BadRequestException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.batch.entity.Batch;
import com.collegeportal.modules.batch.repository.BatchRepository;
import com.collegeportal.modules.registrationwindow.dto.request.RegistrationWindowRequestDTO;
import com.collegeportal.modules.registrationwindow.dto.response.RegistrationWindowResponseDTO;
import com.collegeportal.modules.registrationwindow.entity.RegistrationWindow;
import com.collegeportal.modules.registrationwindow.repository.RegistrationWindowRepository;
import com.collegeportal.modules.registrationwindow.service.RegistrationWindowService;
import com.collegeportal.shared.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationWindowServiceImpl implements RegistrationWindowService {

    private final RegistrationWindowRepository windowRepository;
    private final BatchRepository batchRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationWindowResponseDTO> getAll() {
        return windowRepository.findAllByOrderByOpenDateDesc().stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationWindowResponseDTO> getActiveForRole(String role) {
        return windowRepository.findByRoleAndActiveTrue(RoleType.valueOf(role)).stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public RegistrationWindowResponseDTO create(RegistrationWindowRequestDTO request) {
        if (!request.getOpenDate().isBefore(request.getCloseDate()))
            throw new BadRequestException("openDate must be before closeDate");

        RoleType role = RoleType.valueOf(request.getRole());
        Batch batch = null;

        if (role == RoleType.ROLE_STUDENT) {
            if (request.getBatchId() == null)
                throw new BadRequestException("batchId is required for student windows");
            batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + request.getBatchId()));
            windowRepository.findByBatchIdAndRoleAndAllowedYearOfStudy(
                    request.getBatchId(), role, request.getAllowedYearOfStudy()
            ).ifPresent(w -> { throw new BadRequestException("Registration window already exists for this batch, role, and year"); });
        } else {
            windowRepository.findByRoleAndActiveTrue(role).stream()
                    .filter(w -> w.getBatch() == null)
                    .findFirst()
                    .ifPresent(w -> { throw new BadRequestException("An active faculty registration window already exists"); });
        }

        RegistrationWindow window = RegistrationWindow.builder()
                .batch(batch)
                .role(role)
                .openDate(request.getOpenDate())
                .closeDate(request.getCloseDate())
                .allowedYearOfStudy(role == RoleType.ROLE_STUDENT ? request.getAllowedYearOfStudy() : null)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return toDTO(windowRepository.save(window));
    }

    @Override
    @Transactional
    public RegistrationWindowResponseDTO update(Long id, RegistrationWindowRequestDTO request) {
        RegistrationWindow window = findById(id);

        if (!request.getOpenDate().isBefore(request.getCloseDate()))
            throw new BadRequestException("openDate must be before closeDate");

        RoleType role = RoleType.valueOf(request.getRole());
        Batch batch = null;

        if (role == RoleType.ROLE_STUDENT) {
            if (request.getBatchId() == null)
                throw new BadRequestException("batchId is required for student windows");
            batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + request.getBatchId()));
        }

        window.setBatch(batch);
        window.setRole(role);
        window.setOpenDate(request.getOpenDate());
        window.setCloseDate(request.getCloseDate());
        window.setAllowedYearOfStudy(role == RoleType.ROLE_STUDENT ? request.getAllowedYearOfStudy() : null);
        if (request.getActive() != null) window.setActive(request.getActive());

        return toDTO(windowRepository.save(window));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!windowRepository.existsById(id))
            throw new ResourceNotFoundException("Registration window not found: " + id);
        windowRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleActive(Long id) {
        RegistrationWindow window = findById(id);
        window.setActive(!window.isActive());
        windowRepository.save(window);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRegistrationOpen(Long batchId, String role, Integer yearOfStudy) {
        return windowRepository.findByBatchIdAndRoleAndAllowedYearOfStudy(
                batchId, RoleType.valueOf(role), yearOfStudy
        ).map(w -> {
            LocalDate today = LocalDate.now();
            return w.isActive() && !today.isBefore(w.getOpenDate()) && !today.isAfter(w.getCloseDate());
        }).orElse(false);
    }

    private RegistrationWindow findById(Long id) {
        return windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration window not found: " + id));
    }

    private RegistrationWindowResponseDTO toDTO(RegistrationWindow w) {
        LocalDate today = LocalDate.now();
        Batch batch = w.getBatch();
        return RegistrationWindowResponseDTO.builder()
                .id(w.getId())
                .batchId(batch != null ? batch.getId() : null)
                .batchStartYear(batch != null ? batch.getStartYear() : null)
                .batchEndYear(batch != null ? batch.getEndYear() : null)
                .batchScheme(batch != null ? batch.getScheme() : null)
                .role(w.getRole().name())
                .openDate(w.getOpenDate())
                .closeDate(w.getCloseDate())
                .allowedYearOfStudy(w.getAllowedYearOfStudy())
                .active(w.isActive())
                .currentlyOpen(w.isActive() && !today.isBefore(w.getOpenDate()) && !today.isAfter(w.getCloseDate()))
                .build();
    }
}
