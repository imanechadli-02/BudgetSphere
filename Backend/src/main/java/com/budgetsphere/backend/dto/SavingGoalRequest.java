package com.budgetsphere.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingGoalRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotNull(message = "Target amount is required")
    @Positive(message = "Target amount must be positive")
    private BigDecimal targetAmount;

    @NotNull(message = "Current amount is required")
    @PositiveOrZero(message = "Current amount must be positive or zero")
    private BigDecimal currentAmount;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotNull(message = "Monthly contribution is required")
    @PositiveOrZero(message = "Monthly contribution must be positive or zero")
    private BigDecimal monthlyContribution;
}
