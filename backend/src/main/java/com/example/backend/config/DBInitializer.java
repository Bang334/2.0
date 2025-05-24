// package com.example.backend.config;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// import com.example.backend.repository.UserRepository;

// import jakarta.transaction.Transactional;

// @Component
// public class DBInitializer implements CommandLineRunner {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @Override
//     @Transactional
//     public void run(String... args) {
//         System.out.println("DBInitializer is running...");
//         System.out.println("DBInitializer completed.");
//     }
// } 
// File DBInitializer này có chức năng chạy một đoạn mã nào đó khi ứng dụng Spring Boot khởi động, thông qua việc implement interface CommandLineRunner.