package com.collegeportal.shared.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum RoleType {
    ROLE_ADMIN,
    ROLE_FACULTY,
    ROLE_STUDENT;

    @JsonCreator
    public static RoleType from(String value) {
        String normalized = value.startsWith("ROLE_") ? value : "ROLE_" + value;
        return RoleType.valueOf(normalized.toUpperCase());
    }
}
