package com.budgetsphere.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingGoalDto {
    private Long id;
    private String title;
    private BigDecimal targetAmount;
    private BigDecimal contributedAmount;
    private BigDecimal remainingAmount;
    private LocalDate deadline;
    private BigDecimal monthlyContribution;
    private double progressPercentage;
    private long daysRemaining;
    private long monthsRemaining;
    private boolean isAchieved;
    private Long userId;
}
