package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.SavingGoalDto;
import com.budgetsphere.backend.dto.SavingGoalRequest;
import com.budgetsphere.backend.entity.*;
import com.budgetsphere.backend.mapper.SavingGoalMapper;
import com.budgetsphere.backend.repository.SavingGoalRepository;
import com.budgetsphere.backend.repository.TransactionRepository;
import com.budgetsphere.backend.repository.UserRepository;
import com.budgetsphere.backend.exception.BusinessException;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.SavingGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SavingGoalServiceImpl implements SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final SavingGoalMapper savingGoalMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));
    }

    @Override
    public SavingGoalDto create(SavingGoalRequest request) {
        SavingGoal goal = savingGoalMapper.toEntity(request, getCurrentUser());
        return savingGoalMapper.toDto(savingGoalRepository.save(goal));
    }

    @Override
    public Page<SavingGoalDto> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "deadline"));
        return savingGoalRepository.findByUserId(getCurrentUser().getId(), pageable)
                .map(savingGoalMapper::toDto);
    }

    @Override
    public SavingGoalDto update(Long id, SavingGoalRequest request) {
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingGoal", id));
        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(request.getCurrentAmount());
        goal.setDeadline(request.getDeadline());
        goal.setMonthlyContribution(request.getMonthlyContribution());
        return savingGoalMapper.toDto(savingGoalRepository.save(goal));
    }

    @Override
    @Transactional
    public SavingGoalDto addContribution(Long id, BigDecimal amount) {
        User user = getCurrentUser();
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingGoal", id));

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        goal.setContributedAmount(goal.getContributedAmount().add(amount));
        SavingGoalDto result = savingGoalMapper.toDto(savingGoalRepository.save(goal));

        Transaction tx = Transaction.builder()
                .amount(amount)
                .type(TransactionType.EXPENSE)
                .category(TransactionCategory.SAVINGS)
                .date(LocalDate.now())
                .description("Épargne : " + goal.getTitle())
                .recurring(false)
                .user(user)
                .build();
        transactionRepository.save(tx);

        return result;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = getCurrentUser();
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingGoal", id));

        if (goal.getContributedAmount().compareTo(BigDecimal.ZERO) > 0) {
            Transaction tx = Transaction.builder()
                    .amount(goal.getContributedAmount())
                    .type(TransactionType.INCOME)
                    .category(TransactionCategory.SAVINGS)
                    .date(LocalDate.now())
                    .description("Remboursement épargne : " + goal.getTitle())
                    .recurring(false)
                    .user(user)
                    .build();
            transactionRepository.save(tx);
        }

        savingGoalRepository.deleteById(id);
    }
}
