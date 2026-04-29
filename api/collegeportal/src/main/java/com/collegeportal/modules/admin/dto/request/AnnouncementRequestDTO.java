package com.collegeportal.modules.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnnouncementRequestDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private String targetRole;
}
