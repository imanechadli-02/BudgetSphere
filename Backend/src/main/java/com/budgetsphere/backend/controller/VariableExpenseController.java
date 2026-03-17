package com.budgetsphere.backend.controller;

import com.budgetsphere.backend.dto.VariableExpenseDto;
import com.budgetsphere.backend.dto.VariableExpenseRequest;
import com.budgetsphere.backend.service.VariableExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/user/expenses/variable")
@RequiredArgsConstructor
public class VariableExpenseController {

    private final VariableExpenseService variableExpenseService;

    @PostMapping
    public ResponseEntity<VariableExpenseDto> create(@Valid @RequestBody VariableExpenseRequest request) {
        return ResponseEntity.ok(variableExpenseService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<VariableExpenseDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expenseDate") String sortBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(variableExpenseService.getAll(page, size, sortBy, from, to));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VariableExpenseDto> update(@PathVariable Long id, @Valid @RequestBody VariableExpenseRequest request) {
        return ResponseEntity.ok(variableExpenseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        variableExpenseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
