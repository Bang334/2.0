package com.example.backend.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("vdqhuy99@gmail.com"); // Địa chỉ email người gửi
        message.setTo(to);                      // Địa chỉ email người nhận
        message.setSubject(subject);            // Tiêu đề email
        message.setText(text);                  // Nội dung email

        // Gửi email
        javaMailSender.send(message);
        System.out.println("Simple email sent successfully!");
    }
}