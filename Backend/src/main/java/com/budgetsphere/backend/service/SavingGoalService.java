package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.SavingGoalDto;
import com.budgetsphere.backend.dto.SavingGoalRequest;
import com.budgetsphere.backend.entity.SavingGoal;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.SavingGoalMapper;
import com.budgetsphere.backend.repository.SavingGoalRepository;
import com.budgetsphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;
    private final UserRepository userRepository;
    private final SavingGoalMapper savingGoalMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public SavingGoalDto create(SavingGoalRequest request) {
        SavingGoal goal = savingGoalMapper.toEntity(request, getCurrentUser());
        return savingGoalMapper.toDto(savingGoalRepository.save(goal));
    }

    public Page<SavingGoalDto> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "deadline"));
        return savingGoalRepository.findByUserId(getCurrentUser().getId(), pageable)
                .map(savingGoalMapper::toDto);
    }

    public SavingGoalDto update(Long id, SavingGoalRequest request) {
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Saving goal not found"));
        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(request.getCurrentAmount());
        goal.setDeadline(request.getDeadline());
        goal.setMonthlyContribution(request.getMonthlyContribution());
        return savingGoalMapper.toDto(savingGoalRepository.save(goal));
    }

    public SavingGoalDto addContribution(Long id, BigDecimal amount) {
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Saving goal not found"));
        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        return savingGoalMapper.toDto(savingGoalRepository.save(goal));
    }

    public void delete(Long id) {
        savingGoalRepository.deleteById(id);
    }
}
