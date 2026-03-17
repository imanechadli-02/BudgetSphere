package com.budgetsphere.backend.controller;

import com.budgetsphere.backend.dto.FixedExpenseDto;
import com.budgetsphere.backend.dto.FixedExpenseRequest;
import com.budgetsphere.backend.service.FixedExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/user/expenses/fixed")
@RequiredArgsConstructor
public class FixedExpenseController {

    private final FixedExpenseService fixedExpenseService;

    @PostMapping
    public ResponseEntity<FixedExpenseDto> create(@Valid @RequestBody FixedExpenseRequest request) {
        return ResponseEntity.ok(fixedExpenseService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<FixedExpenseDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(fixedExpenseService.getAll(page, size, sortBy, from, to));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FixedExpenseDto> update(@PathVariable Long id, @Valid @RequestBody FixedExpenseRequest request) {
        return ResponseEntity.ok(fixedExpenseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fixedExpenseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
