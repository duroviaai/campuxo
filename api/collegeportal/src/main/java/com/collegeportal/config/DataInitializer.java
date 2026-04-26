package com.collegeportal.config;

import com.collegeportal.modules.auth.entity.Role;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.RoleRepository;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.classbatch.entity.ClassBatch;
import com.collegeportal.modules.classbatch.repository.ClassBatchRepository;
import com.collegeportal.shared.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ClassBatchRepository classBatchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        try { seedRoles();        } catch (Exception e) { System.err.println("[SEED] roles FAILED: "   + e.getMessage()); }
        try { seedAdmin();        } catch (Exception e) { System.err.println("[SEED] admin FAILED: "   + e.getMessage()); }
        try { seedClassBatches(); } catch (Exception e) { System.err.println("[SEED] batches FAILED: " + e.getMessage()); }
    }

    @Transactional
    public void seedRoles() {
        Arrays.stream(RoleType.values()).forEach(roleType -> {
            if (roleRepository.findByName(roleType).isEmpty()) {
                roleRepository.save(new Role(roleType));
            }
        });
    }

    @Transactional
    public void seedAdmin() {
        if (userRepository.findByEmail("admin@college.edu").isPresent()) return;
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
    public void seedClassBatches() {
        // Delete old-style batches that have no startYear (seeded before the scheme feature)
        classBatchRepository.findAll().stream()
                .filter(b -> b.getStartYear() == null)
                .forEach(b -> classBatchRepository.delete(b));

        if (classBatchRepository.count() > 0) return;
        List<ClassBatch> batches = new java.util.ArrayList<>();
        int baseYear = 2022;
        for (String course : List.of("BCA", "BSC", "BA", "BCOM")) {
            for (int i = 0; i < 3; i++) {
                batches.add(batch(course, baseYear + i));
            }
        }
        classBatchRepository.saveAll(batches);
        System.out.println("[SEED] Created " + batches.size() + " class batches.");
    }

    private ClassBatch batch(String name, int startYear) {
        ClassBatch b = new ClassBatch();
        b.setName(name);
        b.setStartYear(startYear);
        b.setEndYear(startYear + 3);
        b.setScheme("NEP");
        b.setYear(startYear);
        return b;
    }
}
