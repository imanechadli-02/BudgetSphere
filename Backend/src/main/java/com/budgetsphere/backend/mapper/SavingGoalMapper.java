package com.budgetsphere.backend.mapper;

import com.budgetsphere.backend.dto.SavingGoalDto;
import com.budgetsphere.backend.dto.SavingGoalRequest;
import com.budgetsphere.backend.entity.SavingGoal;
import com.budgetsphere.backend.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class SavingGoalMapper {

    public SavingGoalDto toDto(SavingGoal goal) {
        LocalDate today = LocalDate.now();

        double progress = goal.getTargetAmount().doubleValue() > 0
                ? (goal.getContributedAmount().doubleValue() / goal.getTargetAmount().doubleValue()) * 100
                : 0;

        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getContributedAmount());
        long daysRemaining = Math.max(ChronoUnit.DAYS.between(today, goal.getDeadline()), 0);
        long monthsRemaining = Math.max(ChronoUnit.MONTHS.between(today, goal.getDeadline()), 0);
        boolean isAchieved = goal.getContributedAmount().compareTo(goal.getTargetAmount()) >= 0;

        return SavingGoalDto.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .targetAmount(goal.getTargetAmount())
                .contributedAmount(goal.getContributedAmount())
                .remainingAmount(remaining.max(BigDecimal.ZERO))
                .deadline(goal.getDeadline())
                .monthlyContribution(goal.getMonthlyContribution())
                .progressPercentage(Math.min(progress, 100))
                .daysRemaining(daysRemaining)
                .monthsRemaining(monthsRemaining)
                .isAchieved(isAchieved)
                .userId(goal.getUser().getId())
                .build();
    }

    public SavingGoal toEntity(SavingGoalRequest request, User user) {
        return SavingGoal.builder()
                .title(request.getTitle())
                .targetAmount(request.getTargetAmount())
                .deadline(request.getDeadline())
                .monthlyContribution(request.getMonthlyContribution())
                .contributedAmount(BigDecimal.ZERO)
                .currentAmount(BigDecimal.ZERO)
                .user(user)
                .build();
    }
}
