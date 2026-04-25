package com.collegeportal.modules.hod.service.impl;

import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.attendance.dto.response.StudentAttendanceOverviewDTO;
import com.collegeportal.modules.attendance.service.AttendanceService;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.course.mapper.CourseMapper;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.dto.response.FacultyResponseDTO;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.mapper.FacultyMapper;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.hod.dto.response.HodStatsDTO;
import com.collegeportal.modules.hod.service.HodService;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;
import com.collegeportal.modules.student.mapper.StudentMapper;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.enums.FacultyRole;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HodServiceImpl implements HodService {

    private final SecurityUtils securityUtils;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final FacultyMapper facultyMapper;
    private final StudentMapper studentMapper;
    private final CourseMapper courseMapper;
    private final AttendanceService attendanceService;

    /**
     * Resolves the HOD by looking up the faculty profile of the current user
     * and verifying their role is HOD in the faculty table — the DB source of truth.
     */
    private Faculty resolveHod() {
        Faculty faculty = facultyRepository.findByUser(securityUtils.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("HOD faculty profile not found"));
        if (faculty.getRole() != FacultyRole.hod) {
            throw new ResourceNotFoundException("Current user is not an HOD");
        }
        return faculty;
    }

    @Override
    @Transactional(readOnly = true)
    public HodStatsDTO getStats() {
        String dept = resolveHod().getDepartment();
        long students = studentRepository.search("", dept, null, Pageable.unpaged()).getTotalElements();
        long faculty  = facultyRepository.findWithFilters(dept, "", Pageable.unpaged()).getTotalElements();
        long courses  = courseRepository.findByProgramType(dept).size();
        return HodStatsDTO.builder()
                .department(dept)
                .totalStudents(students)
                .totalFaculty(faculty)
                .totalCourses(courses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyResponseDTO> getDepartmentFaculty() {
        String dept = resolveHod().getDepartment();
        return facultyRepository.findWithFilters(dept, "", Pageable.unpaged())
                .map(f -> facultyMapper.toResponseDTO(f,
                        (int) courseRepository.countAssignedCoursesByFacultyId(f.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getDepartmentStudents() {
        String dept = resolveHod().getDepartment();
        return studentRepository.search("", dept, null, Pageable.unpaged())
                .map(studentMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getDepartmentCourses() {
        String dept = resolveHod().getDepartment();
        return courseRepository.findByProgramType(dept).stream()
                .map(c -> courseMapper.toResponseDTO(c,
                        (int) courseRepository.countStudentsByCourseId(c.getId()), null))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceOverviewDTO> getStudentAttendanceOverview(Long courseId, Long classId) {
        return attendanceService.getClassCourseOverview(classId, courseId);
    }
}
