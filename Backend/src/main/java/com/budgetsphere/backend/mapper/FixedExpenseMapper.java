package com.budgetsphere.backend.mapper;

import com.budgetsphere.backend.dto.FixedExpenseDto;
import com.budgetsphere.backend.dto.FixedExpenseRequest;
import com.budgetsphere.backend.entity.FixedExpense;
import com.budgetsphere.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class FixedExpenseMapper {

    public FixedExpenseDto toDto(FixedExpense expense) {
        return FixedExpenseDto.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .frequency(expense.getFrequency())
                .startDate(expense.getStartDate())
                .endDate(expense.getEndDate())
                .category(expense.getCategory())
                .userId(expense.getUser().getId())
                .build();
    }

    public FixedExpense toEntity(FixedExpenseRequest request, User user) {
        return FixedExpense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .category(request.getCategory())
                .user(user)
                .build();
    }
}
