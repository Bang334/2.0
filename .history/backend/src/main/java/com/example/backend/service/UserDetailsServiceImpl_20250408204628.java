package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.NguoiDung;
import com.example.backend.model.User;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    NguoiDungRepository nguoiDungRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with ID: " + id));
        
        NguoiDung nguoiDung = nguoiDungRepository.findByTaiKhoanId(id)
                .orElseThrow(() -> new UsernameNotFoundException("NguoiDung Not Found with TaiKhoan ID: " + id));
        
        // System.out.println("Loaded user: " + id + ", Role: " + nguoiDung.getVaiTro().getTenVaiTro());
        return UserDetailsImpl.build(user, nguoiDung);
    }
}