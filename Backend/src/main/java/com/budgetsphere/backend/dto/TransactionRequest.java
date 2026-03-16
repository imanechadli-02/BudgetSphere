package com.budgetsphere.backend.dto;

import com.budgetsphere.backend.entity.TransactionCategory;
import com.budgetsphere.backend.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private TransactionType type;

    @NotNull
    private LocalDate date;

    private String description;

    private boolean recurring;

    @NotNull
    private TransactionCategory category;
}
