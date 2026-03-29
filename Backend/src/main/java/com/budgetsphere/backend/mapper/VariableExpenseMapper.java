package com.budgetsphere.backend.mapper;

import com.budgetsphere.backend.dto.VariableExpenseDto;
import com.budgetsphere.backend.dto.VariableExpenseRequest;
import com.budgetsphere.backend.entity.VariableExpense;
import com.budgetsphere.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class VariableExpenseMapper {

    public VariableExpenseDto toDto(VariableExpense expense) {
        return VariableExpenseDto.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .category(expense.getCategory())
                .userId(expense.getUser().getId())
                .build();
    }

    public VariableExpense toEntity(VariableExpenseRequest request, User user) {
        return VariableExpense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .category(request.getCategory())
                .user(user)
                .build();
    }
}
