package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.SavingGoalDto;
import com.budgetsphere.backend.dto.SavingGoalRequest;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface SavingGoalService {
    SavingGoalDto create(SavingGoalRequest request);
    Page<SavingGoalDto> getAll(int page, int size);
    SavingGoalDto update(Long id, SavingGoalRequest request);
    SavingGoalDto addContribution(Long id, BigDecimal amount);
    void delete(Long id);
}
