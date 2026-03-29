package com.budgetsphere.backend.controller;

import com.budgetsphere.backend.dto.RegisterRequest;
import com.budgetsphere.backend.dto.UserDto;
import com.budgetsphere.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<UserDto> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUser(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createAdmin(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.createAdmin(request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserDto> changeRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(userService.changeRole(id, role));
    }
}
