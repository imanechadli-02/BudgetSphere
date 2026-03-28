package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.RegisterRequest;
import com.budgetsphere.backend.dto.UserDto;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto toggleUser(Long id);
    UserDto createAdmin(RegisterRequest request);
    void deleteUser(Long id);
    UserDto changeRole(Long id, String role);
}
