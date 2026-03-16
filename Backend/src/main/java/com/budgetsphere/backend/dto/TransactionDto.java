package com.budgetsphere.backend.dto;

import com.budgetsphere.backend.entity.TransactionCategory;
import com.budgetsphere.backend.entity.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDto {

    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate date;
    private String description;
    private boolean recurring;
    private TransactionCategory category;
    private Long userId;
}
