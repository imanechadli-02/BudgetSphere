package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.AuthResponse;
import com.budgetsphere.backend.dto.LoginRequest;
import com.budgetsphere.backend.dto.RegisterRequest;

public interface AuthService {
    boolean emailExists(String email);
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
