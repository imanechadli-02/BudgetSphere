package com.budgetsphere.backend.dto;

import com.budgetsphere.backend.entity.ExpenseCategory;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariableExpenseDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private ExpenseCategory category;
    private Long userId;
}
