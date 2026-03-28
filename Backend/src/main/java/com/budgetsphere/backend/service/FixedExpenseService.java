package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.FixedExpenseDto;
import com.budgetsphere.backend.dto.FixedExpenseRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface FixedExpenseService {
    FixedExpenseDto create(FixedExpenseRequest request);
    Page<FixedExpenseDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to);
    FixedExpenseDto update(Long id, FixedExpenseRequest request);
    void delete(Long id);
}
