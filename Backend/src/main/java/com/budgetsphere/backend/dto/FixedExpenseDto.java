package com.budgetsphere.backend.dto;

import com.budgetsphere.backend.entity.ExpenseCategory;
import com.budgetsphere.backend.entity.Frequency;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FixedExpenseDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String description;
    private Frequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private ExpenseCategory category;
    private Long userId;
}
