package com.collegeportal.config;

import com.collegeportal.modules.attendance.entity.Attendance;
import com.collegeportal.modules.attendance.repository.AttendanceRepository;
import com.collegeportal.modules.auth.entity.Role;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.RoleRepository;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.modules.course.entity.Course;
import com.collegeportal.modules.course.repository.CourseRepository;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.modules.faculty.repository.FacultyRepository;
import com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment;
import com.collegeportal.modules.facultyassignment.repository.FacultyCourseAssignmentRepository;
import com.collegeportal.modules.student.entity.Student;
import com.collegeportal.modules.student.repository.StudentRepository;
import com.collegeportal.shared.enums.AttendanceStatus;
import com.collegeportal.shared.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final ClassBatchRepository classBatchRepository;
    private final CourseRepository courseRepository;
    private final FacultyCourseAssignmentRepository facultyAssignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("========== DataInitializer: Starting seed ==========");
        try { seedRoles();   } catch (Exception e) { System.err.println("[SEED] roles FAILED: "   + e.getMessage()); }
        try { seedAdmin();   } catch (Exception e) { System.err.println("[SEED] admin FAILED: "   + e.getMessage()); }

        List<Faculty>    faculties = null;
        List<ClassBatch> batches   = null;
        List<Student>    students  = null;
        List<Course>     courses   = null;

        try { faculties = seedFaculty();           } catch (Exception e) { System.err.println("[SEED] faculty FAILED: "    + e.getMessage()); }
        try { batches   = seedClassBatches();      } catch (Exception e) { System.err.println("[SEED] batches FAILED: "    + e.getMessage()); }
        try { students  = seedStudents(batches);   } catch (Exception e) { System.err.println("[SEED] students FAILED: "   + e.getMessage()); }
        try { courses   = seedCourses(faculties, students); } catch (Exception e) { System.err.println("[SEED] courses FAILED: " + e.getMessage()); }
        try { seedFacultyAssignments(faculties, courses, batches); } catch (Exception e) { System.err.println("[SEED] assignments FAILED: " + e.getMessage()); }
        try { seedAttendance(students, courses, batches);          } catch (Exception e) { System.err.println("[SEED] attendance FAILED: "  + e.getMessage()); }

        System.out.println("========== DataInitializer: Seed complete ==========");
    }

    @Transactional
    public void seedRoles() {
        Arrays.stream(RoleType.values()).forEach(roleType -> {
            if (roleRepository.findByName(roleType).isEmpty()) {
                roleRepository.save(new Role(roleType));
                System.out.println("[SEED] Created role: " + roleType);
            }
        });
    }

    @Transactional
    public void seedAdmin() {
        if (userRepository.findByEmail("admin@college.edu").isPresent()) {
            System.out.println("[SEED] Admin already exists, skipping.");
            return;
        }
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN).orElseThrow();
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        User admin = new User();
        admin.setFullName("System Administrator");
        admin.setEmail("admin@college.edu");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEnabled(true);
        admin.setApproved(true);
        admin.setRoles(roles);
        userRepository.save(admin);
        System.out.println("[SEED] Created admin: admin@college.edu / admin123");
    }

    @Transactional
    public List<Faculty> seedFaculty() {
        Role facultyRole = roleRepository.findByName(RoleType.ROLE_FACULTY).orElseThrow();

        String[][] data = {
            {"alice.johnson@college.edu", "Alice Johnson", "Alice", "Johnson", "Computer Science"},
            {"bob.smith@college.edu",     "Bob Smith",     "Bob",   "Smith",   "Mathematics"},
            {"carol.white@college.edu",   "Carol White",   "Carol", "White",   "Physics"},
            {"david.brown@college.edu",   "David Brown",   "David", "Brown",   "Electronics"}
        };

        List<Faculty> result = new ArrayList<>();
        for (String[] d : data) {
            User user = userRepository.findByEmail(d[0]).orElseGet(() -> {
                Set<Role> roles = new HashSet<>();
                roles.add(facultyRole);
                User u = new User();
                u.setFullName(d[1]); u.setEmail(d[0]);
                u.setPassword(passwordEncoder.encode("faculty123"));
                u.setEnabled(true); u.setApproved(true);
                u.setRoles(roles);
                User saved = userRepository.save(u);
                System.out.println("[SEED] Created faculty user: " + d[0]);
                return saved;
            });
            Faculty faculty = facultyRepository.findByUser(user).orElseGet(() -> {
                Faculty f = new Faculty();
                f.setFirstName(d[2]); f.setLastName(d[3]);
                f.setDepartment(d[4]); f.setUser(user);
                Faculty saved = facultyRepository.save(f);
                System.out.println("[SEED] Created faculty profile: " + d[2] + " " + d[3]);
                return saved;
            });
            result.add(faculty);
        }
        return result;
    }

    @Transactional
    public List<ClassBatch> seedClassBatches() {
        if (classBatchRepository.count() > 0) {
            System.out.println("[SEED] Class batches already exist, skipping.");
            return classBatchRepository.findAll();
        }
        ClassBatch b1 = new ClassBatch(); b1.setName("CS-A");    b1.setSection("A"); b1.setYear(2024);
        ClassBatch b2 = new ClassBatch(); b2.setName("CS-B");    b2.setSection("B"); b2.setYear(2024);
        ClassBatch b3 = new ClassBatch(); b3.setName("MATH-A");  b3.setSection("A"); b3.setYear(2024);
        List<ClassBatch> saved = classBatchRepository.saveAll(List.of(b1, b2, b3));
        System.out.println("[SEED] Created 3 class batches.");
        return saved;
    }

    @Transactional
    public List<Student> seedStudents(List<ClassBatch> batches) {
        if (batches == null || batches.isEmpty()) throw new IllegalStateException("Batches not available for student seeding");
        Role studentRole = roleRepository.findByName(RoleType.ROLE_STUDENT).orElseThrow();

        // email, fullName, firstName, lastName, phone, dept, regNo, batchIndex
        Object[][] data = {
            {"john.doe@student.edu",   "John Doe",   "John",  "Doe",   "9876543210", "Computer Science", "CS2024001", 0},
            {"jane.doe@student.edu",   "Jane Doe",   "Jane",  "Doe",   "9876543211", "Computer Science", "CS2024002", 0},
            {"mike.lee@student.edu",   "Mike Lee",   "Mike",  "Lee",   "9876543212", "Computer Science", "CS2024003", 0},
            {"sara.khan@student.edu",  "Sara Khan",  "Sara",  "Khan",  "9876543213", "Computer Science", "CS2024004", 1},
            {"tom.clark@student.edu",  "Tom Clark",  "Tom",   "Clark", "9876543214", "Computer Science", "CS2024005", 1},
            {"emily.ross@student.edu", "Emily Ross", "Emily", "Ross",  "9876543215", "Mathematics",      "MA2024001", 2},
            {"chris.paul@student.edu", "Chris Paul", "Chris", "Paul",  "9876543216", "Mathematics",      "MA2024002", 2},
            {"anna.bell@student.edu",  "Anna Bell",  "Anna",  "Bell",  "9876543217", "Computer Science", "CS2024006", 0},
            {"ryan.ford@student.edu",  "Ryan Ford",  "Ryan",  "Ford",  "9876543218", "Electronics",      "EC2024001", 1},
            {"lisa.ray@student.edu",   "Lisa Ray",   "Lisa",  "Ray",   "9876543219", "Electronics",      "EC2024002", 2}
        };

        List<Student> result = new ArrayList<>();
        for (Object[] d : data) {
            String email = (String) d[0];
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                Set<Role> roles = new HashSet<>();
                roles.add(studentRole);
                User u = new User();
                u.setFullName((String) d[1]); u.setEmail(email);
                u.setPassword(passwordEncoder.encode("student123"));
                u.setRegistrationNumber((String) d[6]);
                u.setEnabled(true); u.setApproved(true);
                u.setRoles(roles);
                User saved = userRepository.save(u);
                System.out.println("[SEED] Created student user: " + email);
                return saved;
            });
            Student student = studentRepository.findByUser(user).orElseGet(() -> {
                Student s = new Student();
                s.setFirstName((String) d[2]); s.setLastName((String) d[3]);
                s.setPhone((String) d[4]); s.setDepartment((String) d[5]);
                s.setClassBatch(batches.get((int) d[7]));
                s.setUser(user);
                Student saved = studentRepository.save(s);
                System.out.println("[SEED] Created student profile: " + d[2] + " " + d[3]);
                return saved;
            });
            result.add(student);
        }
        return result;
    }

    @Transactional
    public List<Course> seedCourses(List<Faculty> faculties, List<Student> students) {
        if (faculties == null || students == null) throw new IllegalStateException("Faculty/students not available for course seeding");
        if (courseRepository.count() > 0) {
            System.out.println("[SEED] Courses already exist, skipping.");
            return courseRepository.findAll();
        }

        Course cs101 = saveCourse("Introduction to Programming", "CS101", 4, faculties.get(0),
                Set.of(students.get(0), students.get(1), students.get(2), students.get(7)));
        Course cs201 = saveCourse("Data Structures", "CS201", 4, faculties.get(0),
                Set.of(students.get(0), students.get(1), students.get(3), students.get(4)));
        Course ma101 = saveCourse("Calculus I", "MA101", 3, faculties.get(1),
                Set.of(students.get(5), students.get(6), students.get(0), students.get(1)));
        Course ph101 = saveCourse("Engineering Physics", "PH101", 3, faculties.get(2),
                Set.of(students.get(8), students.get(9), students.get(2)));
        Course ec201 = saveCourse("Digital Electronics", "EC201", 4, faculties.get(3),
                Set.of(students.get(8), students.get(9), students.get(4)));

        System.out.println("[SEED] Created 5 courses.");
        return List.of(cs101, cs201, ma101, ph101, ec201);
    }

    private Course saveCourse(String name, String code, int credits, Faculty faculty, Set<Student> students) {
        Course c = new Course();
        c.setName(name); c.setCode(code); c.setCredits(credits);
        c.setFaculty(faculty); c.setStudents(students);
        return courseRepository.save(c);
    }

    @Transactional
    public void seedFacultyAssignments(List<Faculty> faculties, List<Course> courses, List<ClassBatch> batches) {
        if (faculties == null || courses == null || batches == null) throw new IllegalStateException("Dependencies not available for assignment seeding");
        if (facultyAssignmentRepository.count() > 0) {
            System.out.println("[SEED] Faculty assignments already exist, skipping.");
            return;
        }

        List<FacultyCourseAssignment> assignments = List.of(
            makeAssignment(faculties.get(0), courses.get(0), batches.get(0)),
            makeAssignment(faculties.get(0), courses.get(1), batches.get(0)),
            makeAssignment(faculties.get(0), courses.get(1), batches.get(1)),
            makeAssignment(faculties.get(1), courses.get(2), batches.get(2)),
            makeAssignment(faculties.get(2), courses.get(3), batches.get(1)),
            makeAssignment(faculties.get(3), courses.get(4), batches.get(1))
        );
        facultyAssignmentRepository.saveAll(assignments);
        System.out.println("[SEED] Created 6 faculty assignments.");
    }

    private FacultyCourseAssignment makeAssignment(Faculty f, Course c, ClassBatch b) {
        FacultyCourseAssignment a = new FacultyCourseAssignment();
        a.setFaculty(f); a.setCourse(c); a.setClassBatch(b);
        return a;
    }

    @Transactional
    public void seedAttendance(List<Student> students, List<Course> courses, List<ClassBatch> batches) {
        if (students == null || courses == null || batches == null) throw new IllegalStateException("Dependencies not available for attendance seeding");
        if (attendanceRepository.count() > 0) {
            System.out.println("[SEED] Attendance already exists, skipping.");
            return;
        }

        // courseIdx, batchIdx, studentIdxs
        int[][] groups = {
            {0, 0}, {0, 1}, {0, 2}, {0, 7},   // CS101 -> batch[0]
            {1, 0}, {1, 1}, {1, 3}, {1, 4},   // CS201 -> batch[0]
            {2, 5}, {2, 6}, {2, 0}, {2, 1},   // MA101 -> batch[2]
            {3, 8}, {3, 9}, {3, 2},            // PH101 -> batch[1]
            {4, 8}, {4, 9}, {4, 4}             // EC201 -> batch[1]
        };
        int[] batchForCourse = {0, 0, 2, 1, 1};

        AttendanceStatus[] pattern = {
            AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
            AttendanceStatus.ABSENT,  AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,  AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT
        };

        List<LocalDate> dates = generateWeekdays(10);
        int count = 0;

        for (int[] g : groups) {
            Course course   = courses.get(g[0]);
            ClassBatch batch = batches.get(batchForCourse[g[0]]);
            Student student = students.get(g[1]);
            for (int di = 0; di < dates.size(); di++) {
                LocalDate date = dates.get(di);
                if (!attendanceRepository.existsByStudentIdAndCourseIdAndClassBatchIdAndDate(
                        student.getId(), course.getId(), batch.getId(), date)) {
                    Attendance a = new Attendance();
                    a.setStudent(student); a.setCourse(course);
                    a.setClassBatch(batch); a.setDate(date);
                    a.setStatus(pattern[di % pattern.length]);
                    attendanceRepository.save(a);
                    count++;
                }
            }
        }
        System.out.println("[SEED] Created " + count + " attendance records.");
    }

    private List<LocalDate> generateWeekdays(int count) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate date = LocalDate.now().minusDays(1);
        while (dates.size() < count) {
            if (date.getDayOfWeek().getValue() <= 5) dates.add(date);
            date = date.minusDays(1);
        }
        return dates;
    }
}
