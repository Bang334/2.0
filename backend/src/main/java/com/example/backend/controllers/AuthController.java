package com.example.backend.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.NguoiDung;
import com.example.backend.model.User;
import com.example.backend.payload.request.LoginRequest;
import com.example.backend.payload.response.JwtResponse;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.jwt.JwtUtils;
import com.example.backend.service.UserDetailsImpl;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    NguoiDungRepository nguoiDungRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Kiểm tra trạng thái tài khoản trước khi xác thực
            User user = userRepository.findById(loginRequest.getUserId()).orElse(null);
            if (user != null && user.getTrangThai() == User.TrangThai.Khoa) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ."));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUserId(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            // Cập nhật thời gian đăng nhập cuối cùng
            if (user != null) {
                user.setThoiGianDangNhapCuoi(LocalDateTime.now());
                userRepository.save(user);
            }

            // Lấy thông tin NguoiDung
            NguoiDung nguoiDung = nguoiDungRepository.findByTaiKhoanId(userDetails.getId()).orElse(null);
            String avatarURL = nguoiDung != null ? nguoiDung.getAvatarURL() : null;

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    "Bearer", 
                    userDetails.getId(),
                    userDetails.getId(),
                    userDetails.getEmail(),
                    userDetails.getHoTen(), 
                    avatarURL,
                    roles));
        } catch (BadCredentialsException e) {
            System.out.println("Authentication failed for user: " + loginRequest.getUserId());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Tài khoản hoặc mật khẩu không đúng"));
        } catch (AuthenticationException e) {
            System.out.println("Error during authentication: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Đã xảy ra lỗi trong quá trình đăng nhập"));
        }
    }
}