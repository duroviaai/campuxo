package com.collegeportal.modules.admin.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class BulkUserRequestDTO {
    private List<Long> userIds;
    private String reason;
}
