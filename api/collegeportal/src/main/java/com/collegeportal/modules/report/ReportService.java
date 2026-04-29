package com.collegeportal.modules.report;

public interface ReportService {
    byte[] generateAttendanceExcel(Long classStructureId, Long courseId);
    byte[] generateAttendancePdf(Long classStructureId, Long courseId);
    byte[] generateIAMarksExcel(Long classStructureId, Long courseId);
    byte[] generateStudentListExcel(String department);
}
