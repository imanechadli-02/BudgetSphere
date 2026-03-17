package com.budgetsphere.backend.mapper;

import com.budgetsphere.backend.dto.SavingGoalDto;
import com.budgetsphere.backend.dto.SavingGoalRequest;
import com.budgetsphere.backend.entity.SavingGoal;
import com.budgetsphere.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class SavingGoalMapper {

    public SavingGoalDto toDto(SavingGoal goal) {
        double progress = goal.getTargetAmount().doubleValue() > 0
                ? (goal.getCurrentAmount().doubleValue() / goal.getTargetAmount().doubleValue()) * 100
                : 0;
        return SavingGoalDto.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .deadline(goal.getDeadline())
                .monthlyContribution(goal.getMonthlyContribution())
                .progressPercentage(Math.min(progress, 100))
                .userId(goal.getUser().getId())
                .build();
    }

    public SavingGoal toEntity(SavingGoalRequest request, User user) {
        return SavingGoal.builder()
                .title(request.getTitle())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount())
                .deadline(request.getDeadline())
                .monthlyContribution(request.getMonthlyContribution())
                .user(user)
                .build();
    }
}
