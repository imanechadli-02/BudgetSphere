package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.FixedExpenseDto;
import com.budgetsphere.backend.dto.FixedExpenseRequest;
import com.budgetsphere.backend.entity.FixedExpense;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.FixedExpenseMapper;
import com.budgetsphere.backend.repository.FixedExpenseRepository;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.FixedExpenseService;
import com.budgetsphere.backend.service.UserContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class FixedExpenseServiceImpl implements FixedExpenseService {

    private final FixedExpenseRepository fixedExpenseRepository;
    private final FixedExpenseMapper fixedExpenseMapper;
    private final UserContextService userContextService;

    @Override
    public FixedExpenseDto create(FixedExpenseRequest request) {
        FixedExpense expense = fixedExpenseMapper.toEntity(request, userContextService.getCurrentUser());
        return fixedExpenseMapper.toDto(fixedExpenseRepository.save(expense));
    }

    @Override
    public Page<FixedExpenseDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Long userId = userContextService.getCurrentUser().getId();
        if (from != null && to != null) {
            return fixedExpenseRepository.findByUserIdAndStartDateBetween(userId, from, to, pageable)
                    .map(fixedExpenseMapper::toDto);
        }
        return fixedExpenseRepository.findByUserId(userId, pageable).map(fixedExpenseMapper::toDto);
    }

    @Override
    public FixedExpenseDto update(Long id, FixedExpenseRequest request) {
        User user = userContextService.getCurrentUser();
        FixedExpense expense = fixedExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FixedExpense", id));
        userContextService.checkOwnership(expense.getUser(), user);
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setFrequency(request.getFrequency());
        expense.setStartDate(request.getStartDate());
        expense.setEndDate(request.getEndDate());
        expense.setCategory(request.getCategory());
        return fixedExpenseMapper.toDto(fixedExpenseRepository.save(expense));
    }

    @Override
    public void delete(Long id) {
        User user = userContextService.getCurrentUser();
        FixedExpense expense = fixedExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FixedExpense", id));
        userContextService.checkOwnership(expense.getUser(), user);
        fixedExpenseRepository.deleteById(id);
    }
}
