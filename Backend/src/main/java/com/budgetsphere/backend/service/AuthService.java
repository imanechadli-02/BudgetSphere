package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.AuthResponse;
import com.budgetsphere.backend.dto.LoginRequest;
import com.budgetsphere.backend.dto.RegisterRequest;
import com.budgetsphere.backend.dto.UserDto;
import com.budgetsphere.backend.entity.Role;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.UserMapper;
import com.budgetsphere.backend.repository.UserRepository;
import com.budgetsphere.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.USER)
                .build();
        
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        UserDto userDto = userMapper.toDto(user);
        
        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtService.generateToken(user);
        UserDto userDto = userMapper.toDto(user);
        
        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }
}
