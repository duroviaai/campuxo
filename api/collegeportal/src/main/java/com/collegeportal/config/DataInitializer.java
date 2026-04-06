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
        // BCA / BSc batches
        ClassBatch b1 = new ClassBatch(); b1.setName("BCA-A");   b1.setSection("A"); b1.setYear(1);
        ClassBatch b2 = new ClassBatch(); b2.setName("BCA-B");   b2.setSection("B"); b2.setYear(1);
        ClassBatch b3 = new ClassBatch(); b3.setName("BSc-A");   b3.setSection("A"); b3.setYear(1);
        // BCom batches
        ClassBatch b4 = new ClassBatch(); b4.setName("BCom-A");  b4.setSection("A"); b4.setYear(2);
        ClassBatch b5 = new ClassBatch(); b5.setName("BCom-B");  b5.setSection("B"); b5.setYear(2);
        // BA batches
        ClassBatch b6 = new ClassBatch(); b6.setName("BA-A");    b6.setSection("A"); b6.setYear(3);
        ClassBatch b7 = new ClassBatch(); b7.setName("BA-B");    b7.setSection("B"); b7.setYear(3);
        List<ClassBatch> saved = classBatchRepository.saveAll(List.of(b1, b2, b3, b4, b5, b6, b7));
        System.out.println("[SEED] Created 7 class batches.");
        return saved;
    }

    @Transactional
    public List<Student> seedStudents(List<ClassBatch> batches) {
        if (batches == null || batches.isEmpty()) throw new IllegalStateException("Batches not available for student seeding");
        Role studentRole = roleRepository.findByName(RoleType.ROLE_STUDENT).orElseThrow();

        // email, fullName, firstName, lastName, phone, dept, regNo, batchIndex
        Object[][] data = {
            // BCA students (batches 0,1)
            {"john.doe@student.edu",     "John Doe",     "John",    "Doe",     "9876543210", "Computer Science", "BCA2024001", 0},
            {"jane.doe@student.edu",     "Jane Doe",     "Jane",    "Doe",     "9876543211", "Computer Science", "BCA2024002", 0},
            {"mike.lee@student.edu",     "Mike Lee",     "Mike",    "Lee",     "9876543212", "Computer Science", "BCA2024003", 0},
            {"sara.khan@student.edu",    "Sara Khan",    "Sara",    "Khan",    "9876543213", "Computer Science", "BCA2024004", 1},
            {"tom.clark@student.edu",    "Tom Clark",    "Tom",     "Clark",   "9876543214", "Computer Science", "BCA2024005", 1},
            // BSc students (batch 2)
            {"emily.ross@student.edu",   "Emily Ross",   "Emily",   "Ross",    "9876543215", "Mathematics",      "BSC2024001", 2},
            {"chris.paul@student.edu",   "Chris Paul",   "Chris",   "Paul",    "9876543216", "Mathematics",      "BSC2024002", 2},
            {"anna.bell@student.edu",    "Anna Bell",    "Anna",    "Bell",    "9876543217", "Computer Science", "BCA2024006", 0},
            {"ryan.ford@student.edu",    "Ryan Ford",    "Ryan",    "Ford",    "9876543218", "Electronics",      "BSC2024003", 2},
            {"lisa.ray@student.edu",     "Lisa Ray",     "Lisa",    "Ray",     "9876543219", "Electronics",      "BSC2024004", 2},
            // BCom students (batches 3,4)
            {"rahul.sharma@student.edu", "Rahul Sharma", "Rahul",   "Sharma",  "9876543220", "Commerce",         "BCM2024001", 3},
            {"priya.nair@student.edu",   "Priya Nair",   "Priya",   "Nair",    "9876543221", "Commerce",         "BCM2024002", 3},
            {"arjun.mehta@student.edu",  "Arjun Mehta",  "Arjun",   "Mehta",   "9876543222", "Commerce",         "BCM2024003", 3},
            {"sneha.iyer@student.edu",   "Sneha Iyer",   "Sneha",   "Iyer",    "9876543223", "Commerce",         "BCM2024004", 4},
            {"karan.joshi@student.edu",  "Karan Joshi",  "Karan",   "Joshi",   "9876543224", "Commerce",         "BCM2024005", 4},
            // BA students (batches 5,6)
            {"divya.pillai@student.edu", "Divya Pillai", "Divya",   "Pillai",  "9876543225", "Arts",             "BA2024001",  5},
            {"rohan.das@student.edu",    "Rohan Das",    "Rohan",   "Das",     "9876543226", "Arts",             "BA2024002",  5},
            {"meera.singh@student.edu",  "Meera Singh",  "Meera",   "Singh",   "9876543227", "Arts",             "BA2024003",  5},
            {"aditya.rao@student.edu",   "Aditya Rao",   "Aditya",  "Rao",     "9876543228", "Arts",             "BA2024004",  6},
            {"kavya.reddy@student.edu",  "Kavya Reddy",  "Kavya",   "Reddy",   "9876543229", "Arts",             "BA2024005",  6},
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

        Course cs101 = saveCourse("Introduction to Programming", "CS101", 4, faculties.get(0), "BCA",
                Set.of(students.get(0), students.get(1), students.get(2), students.get(7)));
        Course cs201 = saveCourse("Data Structures", "CS201", 4, faculties.get(0), "BCA",
                Set.of(students.get(0), students.get(1), students.get(3), students.get(4)));
        Course cs301 = saveCourse("Operating Systems", "CS301", 4, faculties.get(0), "BCA",
                Set.of(students.get(2), students.get(3), students.get(7)));
        Course ma101 = saveCourse("Calculus I", "MA101", 3, faculties.get(1), "BSc",
                Set.of(students.get(5), students.get(6), students.get(0), students.get(1)));
        Course ma201 = saveCourse("Linear Algebra", "MA201", 3, faculties.get(1), "BSc",
                Set.of(students.get(5), students.get(6), students.get(8)));
        Course ph101 = saveCourse("Engineering Physics", "PH101", 3, faculties.get(2), "BSc",
                Set.of(students.get(8), students.get(9), students.get(2)));
        Course ec201 = saveCourse("Digital Electronics", "EC201", 4, faculties.get(3), "BCA",
                Set.of(students.get(8), students.get(9), students.get(4)));

        // BCom courses
        Course bc101 = saveCourse("Financial Accounting", "BC101", 4, faculties.get(1), "BCom",
                Set.of(students.get(10), students.get(11), students.get(12), students.get(13)));
        Course bc201 = saveCourse("Business Economics", "BC201", 3, faculties.get(1), "BCom",
                Set.of(students.get(10), students.get(11), students.get(14)));
        Course bc301 = saveCourse("Corporate Law", "BC301", 3, faculties.get(2), "BCom",
                Set.of(students.get(12), students.get(13), students.get(14)));

        // BA courses
        Course ba101 = saveCourse("English Literature", "BA101", 3, faculties.get(2), "BA",
                Set.of(students.get(15), students.get(16), students.get(17), students.get(18)));
        Course ba201 = saveCourse("History of India", "BA201", 3, faculties.get(3), "BA",
                Set.of(students.get(15), students.get(16), students.get(19)));
        Course ba301 = saveCourse("Political Science", "BA301", 3, faculties.get(2), "BA",
                Set.of(students.get(17), students.get(18), students.get(19)));

        System.out.println("[SEED] Created 13 courses across BCA, BSc, BCom, BA.");
        return List.of(cs101, cs201, cs301, ma101, ma201, ph101, ec201, bc101, bc201, bc301, ba101, ba201, ba301);
    }

    private Course saveCourse(String name, String code, int credits, Faculty faculty, String programType, Set<Student> students) {
        Course c = new Course();
        c.setName(name); c.setCode(code); c.setCredits(credits);
        c.setFaculty(faculty); c.setProgramType(programType); c.setStudents(students);
        return courseRepository.save(c);
    }

    @Transactional
    public void seedFacultyAssignments(List<Faculty> faculties, List<Course> courses, List<ClassBatch> batches) {
        if (faculties == null || courses == null || batches == null) throw new IllegalStateException("Dependencies not available for assignment seeding");
        if (facultyAssignmentRepository.count() > 0) {
            System.out.println("[SEED] Faculty assignments already exist, skipping.");
            return;
        }
        // courses: 0=CS101,1=CS201,2=CS301,3=MA101,4=MA201,5=PH101,6=EC201,7=BC101,8=BC201,9=BC301,10=BA101,11=BA201,12=BA301
        // batches: 0=BCA-A,1=BCA-B,2=BSc-A,3=BCom-A,4=BCom-B,5=BA-A,6=BA-B
        List<FacultyCourseAssignment> assignments = List.of(
            makeAssignment(faculties.get(0), courses.get(0),  batches.get(0)),  // CS101 -> BCA-A
            makeAssignment(faculties.get(0), courses.get(1),  batches.get(0)),  // CS201 -> BCA-A
            makeAssignment(faculties.get(0), courses.get(1),  batches.get(1)),  // CS201 -> BCA-B
            makeAssignment(faculties.get(0), courses.get(2),  batches.get(1)),  // CS301 -> BCA-B
            makeAssignment(faculties.get(1), courses.get(3),  batches.get(2)),  // MA101 -> BSc-A
            makeAssignment(faculties.get(1), courses.get(4),  batches.get(2)),  // MA201 -> BSc-A
            makeAssignment(faculties.get(2), courses.get(5),  batches.get(2)),  // PH101 -> BSc-A
            makeAssignment(faculties.get(3), courses.get(6),  batches.get(1)),  // EC201 -> BCA-B
            makeAssignment(faculties.get(1), courses.get(7),  batches.get(3)),  // BC101 -> BCom-A
            makeAssignment(faculties.get(1), courses.get(8),  batches.get(3)),  // BC201 -> BCom-A
            makeAssignment(faculties.get(2), courses.get(9),  batches.get(4)),  // BC301 -> BCom-B
            makeAssignment(faculties.get(2), courses.get(10), batches.get(5)),  // BA101 -> BA-A
            makeAssignment(faculties.get(3), courses.get(11), batches.get(5)),  // BA201 -> BA-A
            makeAssignment(faculties.get(2), courses.get(12), batches.get(6))   // BA301 -> BA-B
        );
        facultyAssignmentRepository.saveAll(assignments);
        System.out.println("[SEED] Created 14 faculty assignments.");
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

        // courses: 0=CS101,1=CS201,2=CS301,3=MA101,4=MA201,5=PH101,6=EC201,7=BC101,8=BC201,9=BC301,10=BA101,11=BA201,12=BA301
        // batches: 0=BCA-A,1=BCA-B,2=BSc-A,3=BCom-A,4=BCom-B,5=BA-A,6=BA-B
        // each entry: {courseIdx, batchIdx, studentIdx}
        int[][] enrollments = {
            // CS101 -> BCA-A
            {0,0,0},{0,0,1},{0,0,2},{0,0,7},
            // CS201 -> BCA-A / BCA-B
            {1,0,0},{1,0,1},{1,1,3},{1,1,4},
            // CS301 -> BCA-B
            {2,1,2},{2,1,3},{2,1,7},
            // MA101 -> BSc-A
            {3,2,5},{3,2,6},{3,2,0},{3,2,1},
            // MA201 -> BSc-A
            {4,2,5},{4,2,6},{4,2,8},
            // PH101 -> BSc-A
            {5,2,8},{5,2,9},{5,2,2},
            // EC201 -> BCA-B
            {6,1,8},{6,1,9},{6,1,4},
            // BC101 -> BCom-A
            {7,3,10},{7,3,11},{7,3,12},{7,3,13},
            // BC201 -> BCom-A
            {8,3,10},{8,3,11},{8,3,14},
            // BC301 -> BCom-B
            {9,4,12},{9,4,13},{9,4,14},
            // BA101 -> BA-A
            {10,5,15},{10,5,16},{10,5,17},{10,5,18},
            // BA201 -> BA-A
            {11,5,15},{11,5,16},{11,5,19},
            // BA301 -> BA-B
            {12,6,17},{12,6,18},{12,6,19}
        };

        AttendanceStatus[] pattern = {
            AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
            AttendanceStatus.ABSENT,  AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,  AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,
            AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT
        };

        List<LocalDate> dates = generateWeekdays(15);
        int count = 0;

        for (int[] e : enrollments) {
            Course course    = courses.get(e[0]);
            ClassBatch batch = batches.get(e[1]);
            Student student  = students.get(e[2]);
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
