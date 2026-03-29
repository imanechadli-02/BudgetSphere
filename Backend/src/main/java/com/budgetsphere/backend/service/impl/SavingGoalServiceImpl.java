package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.SavingGoalDto;
import com.budgetsphere.backend.dto.SavingGoalRequest;
import com.budgetsphere.backend.entity.*;
import com.budgetsphere.backend.mapper.SavingGoalMapper;
import com.budgetsphere.backend.repository.SavingGoalRepository;
import com.budgetsphere.backend.repository.TransactionRepository;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.SavingGoalService;
import com.budgetsphere.backend.service.UserContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SavingGoalServiceImpl implements SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;
    private final TransactionRepository transactionRepository;
    private final SavingGoalMapper savingGoalMapper;
    private final UserContextService userContextService;

    @Override
    public SavingGoalDto create(SavingGoalRequest request) {
        SavingGoal goal = savingGoalMapper.toEntity(request, userContextService.getCurrentUser());
        return savingGoalMapper.toDto(savingGoalRepository.save(goal));
    }

    @Override
    public Page<SavingGoalDto> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "deadline"));
        return savingGoalRepository.findByUserId(userContextService.getCurrentUser().getId(), pageable)
                .map(savingGoalMapper::toDto);
    }

    @Override
    public SavingGoalDto update(Long id, SavingGoalRequest request) {
        User user = userContextService.getCurrentUser();
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingGoal", id));
        userContextService.checkOwnership(goal.getUser(), user);
        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setDeadline(request.getDeadline());
        goal.setMonthlyContribution(request.getMonthlyContribution());
        return savingGoalMapper.toDto(savingGoalRepository.save(goal));
    }

    @Override
    @Transactional
    public SavingGoalDto addContribution(Long id, BigDecimal amount) {
        User user = userContextService.getCurrentUser();
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingGoal", id));
        userContextService.checkOwnership(goal.getUser(), user);

        goal.setContributedAmount(goal.getContributedAmount().add(amount));
        SavingGoalDto result = savingGoalMapper.toDto(savingGoalRepository.save(goal));

        transactionRepository.save(Transaction.builder()
                .amount(amount)
                .type(TransactionType.EXPENSE)
                .category(TransactionCategory.SAVINGS)
                .date(LocalDate.now())
                .description("Épargne : " + goal.getTitle())
                .recurring(false)
                .user(user)
                .build());

        return result;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userContextService.getCurrentUser();
        SavingGoal goal = savingGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingGoal", id));
        userContextService.checkOwnership(goal.getUser(), user);

        if (goal.getContributedAmount().compareTo(BigDecimal.ZERO) > 0) {
            transactionRepository.save(Transaction.builder()
                    .amount(goal.getContributedAmount())
                    .type(TransactionType.INCOME)
                    .category(TransactionCategory.SAVINGS)
                    .date(LocalDate.now())
                    .description("Remboursement épargne : " + goal.getTitle())
                    .recurring(false)
                    .user(user)
                    .build());
        }

        savingGoalRepository.deleteById(id);
    }
}
