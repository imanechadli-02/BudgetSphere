package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.VariableExpenseDto;
import com.budgetsphere.backend.dto.VariableExpenseRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface VariableExpenseService {
    VariableExpenseDto create(VariableExpenseRequest request);
    Page<VariableExpenseDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to);
    VariableExpenseDto update(Long id, VariableExpenseRequest request);
    void delete(Long id);
}
