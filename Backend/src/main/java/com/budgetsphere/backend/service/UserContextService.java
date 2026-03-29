package com.budgetsphere.backend.service;

import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.exception.BusinessException;
import com.budgetsphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserContextService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));
    }

    public void checkOwnership(User owner, User current) {
        if (!owner.getId().equals(current.getId())) {
            throw new BusinessException("Access denied");
        }
    }
}
