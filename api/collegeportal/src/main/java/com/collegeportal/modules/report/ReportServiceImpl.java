package com.collegeportal.modules.report;

import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.attendance.service.AttendanceService;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.service.IAService;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final AttendanceService attendanceService;
    private final IAService iaService;
    private final StudentRepository studentRepository;

    // ── Attendance Excel ──────────────────────────────────────────────────────

    @Override
    public byte[] generateAttendanceExcel(Long classStructureId, Long courseId) {
        List<StudentAttendanceOverviewDTO> rows =
                attendanceService.getOverviewByClassStructure(classStructureId, courseId);

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Attendance Report");

            CellStyle headerStyle = boldStyle(wb);
            CellStyle redStyle    = colorStyle(wb, IndexedColors.ROSE);
            CellStyle normalStyle = wb.createCellStyle();

            String[] headers = {"Student Name", "Reg No", "Total Classes", "Present", "Absent", "Percentage"};
            writeHeaderRow(sheet, headerStyle, headers);

            int rowIdx = 1;
            for (StudentAttendanceOverviewDTO s : rows) {
                Row row = sheet.createRow(rowIdx++);
                CellStyle style = s.getAttendancePercentage() < 75 ? redStyle : normalStyle;
                writeCell(row, 0, s.getStudentName(),                                    style);
                writeCell(row, 1, s.getRegistrationNumber(),                             style);
                writeCell(row, 2, s.getTotalClasses(),                                   style);
                writeCell(row, 3, s.getAttendedClasses(),                                style);
                writeCell(row, 4, s.getTotalClasses() - s.getAttendedClasses(),          style);
                writeCell(row, 5, String.format("%.1f%%", s.getAttendancePercentage()),  style);
            }
            autoSize(sheet, headers.length);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate attendance Excel", e);
        }
    }

    // ── Attendance PDF ────────────────────────────────────────────────────────

    @Override
    public byte[] generateAttendancePdf(Long classStructureId, Long courseId) {
        List<StudentAttendanceOverviewDTO> rows =
                attendanceService.getOverviewByClassStructure(classStructureId, courseId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf  = new PdfDocument(writer);
            Document doc     = new Document(pdf);

            doc.add(new Paragraph("CollegePortal")
                    .setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Attendance Report")
                    .setFontSize(13).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Generated: " + LocalDate.now())
                    .setFontSize(9).setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY));
            doc.add(new Paragraph(" "));

            float[] colWidths = {3, 2, 1.5f, 1.5f, 1.5f, 1.5f};
            Table table = new Table(UnitValue.createPercentArray(colWidths)).useAllAvailableWidth();

            DeviceRgb headerBg = new DeviceRgb(30, 30, 60);
            String[] headers = {"Student Name", "Reg No", "Total", "Present", "Absent", "Percentage"};
            for (String h : headers) {
                table.addHeaderCell(new com.itextpdf.layout.element.Cell()
                        .add(new Paragraph(h).setBold().setFontColor(ColorConstants.WHITE).setFontSize(9))
                        .setBackgroundColor(headerBg));
            }

            DeviceRgb redBg = new DeviceRgb(255, 220, 220);
            for (StudentAttendanceOverviewDTO s : rows) {
                boolean low = s.getAttendancePercentage() < 75;
                DeviceRgb bg = low ? redBg : null;
                addPdfCell(table, s.getStudentName(),                                   bg);
                addPdfCell(table, s.getRegistrationNumber() != null ? s.getRegistrationNumber() : "—", bg);
                addPdfCell(table, String.valueOf(s.getTotalClasses()),                  bg);
                addPdfCell(table, String.valueOf(s.getAttendedClasses()),               bg);
                addPdfCell(table, String.valueOf(s.getTotalClasses() - s.getAttendedClasses()), bg);
                addPdfCell(table, String.format("%.1f%%", s.getAttendancePercentage()), bg);
            }

            doc.add(table);
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate attendance PDF", e);
        }
    }

    // ── IA Marks Excel ────────────────────────────────────────────────────────

    @Override
    public byte[] generateIAMarksExcel(Long classStructureId, Long courseId) {
        List<StudentIAResponseDTO> rows = iaService.getMarks(classStructureId, courseId);

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("IA Marks");
            CellStyle headerStyle = boldStyle(wb);
            CellStyle normal      = wb.createCellStyle();

            String[] headers = {"Student Name", "Reg No", "IA1", "IA2", "IA3", "Final Marks"};
            writeHeaderRow(sheet, headerStyle, headers);

            int rowIdx = 1;
            for (StudentIAResponseDTO s : rows) {
                Row row = sheet.createRow(rowIdx++);
                writeCell(row, 0, s.getStudentName(),                    normal);
                writeCell(row, 1, s.getRegistrationNumber(),             normal);
                writeCell(row, 2, markStr(s, 1),                        normal);
                writeCell(row, 3, markStr(s, 2),                        normal);
                writeCell(row, 4, markStr(s, 3),                        normal);
                writeCell(row, 5, s.getFinalMarks() != null
                        ? s.getFinalMarks().toPlainString() : "—",      normal);
            }
            autoSize(sheet, headers.length);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate IA marks Excel", e);
        }
    }

    // ── Student List Excel ────────────────────────────────────────────────────

    @Override
    public byte[] generateStudentListExcel(String department) {
        List<Student> students = department != null && !department.isBlank()
                ? studentRepository.findByDepartment(department, Pageable.unpaged()).getContent()
                : studentRepository.findAll();

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Students");
            CellStyle headerStyle = boldStyle(wb);
            CellStyle normal      = wb.createCellStyle();

            String[] headers = {"Name", "Reg No", "Department", "Year", "Scheme", "Batch", "Phone"};
            writeHeaderRow(sheet, headerStyle, headers);

            int rowIdx = 1;
            for (Student s : students) {
                Row row = sheet.createRow(rowIdx++);
                String fullName = s.getFirstName() + (s.getLastName() != null ? " " + s.getLastName() : "");
                String regNo    = s.getUser() != null ? s.getUser().getRegistrationNumber() : null;
                String batch    = s.getClassBatch() != null ? s.getClassBatch().getName() : null;
                writeCell(row, 0, fullName,           normal);
                writeCell(row, 1, regNo,              normal);
                writeCell(row, 2, s.getDepartment(),  normal);
                writeCell(row, 3, s.getYearOfStudy() != null ? String.valueOf(s.getYearOfStudy()) : null, normal);
                writeCell(row, 4, s.getScheme(),      normal);
                writeCell(row, 5, batch,              normal);
                writeCell(row, 6, s.getPhone(),       normal);
            }
            autoSize(sheet, headers.length);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate student list Excel", e);
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void writeHeaderRow(Sheet sheet, CellStyle style, String[] headers) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void writeCell(Row row, int col, String value, CellStyle style) {
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "—");
        cell.setCellStyle(style);
    }

    private void writeCell(Row row, int col, int value, CellStyle style) {
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void autoSize(Sheet sheet, int cols) {
        for (int i = 0; i < cols; i++) sheet.autoSizeColumn(i);
    }

    private CellStyle boldStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle colorStyle(Workbook wb, IndexedColors color) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(color.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void addPdfCell(Table table, String value, DeviceRgb bg) {
        com.itextpdf.layout.element.Cell cell =
                new com.itextpdf.layout.element.Cell().add(new Paragraph(value != null ? value : "—").setFontSize(8));
        if (bg != null) cell.setBackgroundColor(bg);
        table.addCell(cell);
    }

    private String markStr(StudentIAResponseDTO s, int iaNum) {
        if (s.getMarks() == null) return "—";
        BigDecimal val = s.getMarks().get(iaNum);
        return val != null ? val.toPlainString() : "—";
    }
}
