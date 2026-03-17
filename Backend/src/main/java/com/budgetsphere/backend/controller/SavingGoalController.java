package com.budgetsphere.backend.controller;

import com.budgetsphere.backend.dto.SavingGoalDto;
import com.budgetsphere.backend.dto.SavingGoalRequest;
import com.budgetsphere.backend.service.SavingGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/user/saving-goals")
@RequiredArgsConstructor
public class SavingGoalController {

    private final SavingGoalService savingGoalService;

    @PostMapping
    public ResponseEntity<SavingGoalDto> create(@Valid @RequestBody SavingGoalRequest request) {
        return ResponseEntity.ok(savingGoalService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<SavingGoalDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(savingGoalService.getAll(page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingGoalDto> update(@PathVariable Long id, @Valid @RequestBody SavingGoalRequest request) {
        return ResponseEntity.ok(savingGoalService.update(id, request));
    }

    @PatchMapping("/{id}/contribute")
    public ResponseEntity<SavingGoalDto> addContribution(@PathVariable Long id, @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(savingGoalService.addContribution(id, amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        savingGoalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
