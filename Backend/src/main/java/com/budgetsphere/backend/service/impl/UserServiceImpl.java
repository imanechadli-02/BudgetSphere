package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.RegisterRequest;
import com.budgetsphere.backend.dto.UserDto;
import com.budgetsphere.backend.entity.Role;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.UserMapper;
import com.budgetsphere.backend.repository.UserRepository;
import com.budgetsphere.backend.exception.BusinessException;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toDto).toList();
    }

    @Override
    public UserDto toggleUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setEnabled(!user.isEnabled());
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public UserDto createAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.ADMIN)
                .build();
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDto changeRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setRole(Role.valueOf(role.toUpperCase()));
        return userMapper.toDto(userRepository.save(user));
    }
}
