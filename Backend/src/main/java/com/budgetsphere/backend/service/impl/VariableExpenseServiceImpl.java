package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.VariableExpenseDto;
import com.budgetsphere.backend.dto.VariableExpenseRequest;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.entity.VariableExpense;
import com.budgetsphere.backend.mapper.VariableExpenseMapper;
import com.budgetsphere.backend.repository.VariableExpenseRepository;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.UserContextService;
import com.budgetsphere.backend.service.VariableExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class VariableExpenseServiceImpl implements VariableExpenseService {

    private final VariableExpenseRepository variableExpenseRepository;
    private final VariableExpenseMapper variableExpenseMapper;
    private final UserContextService userContextService;

    @Override
    public VariableExpenseDto create(VariableExpenseRequest request) {
        VariableExpense expense = variableExpenseMapper.toEntity(request, userContextService.getCurrentUser());
        return variableExpenseMapper.toDto(variableExpenseRepository.save(expense));
    }

    @Override
    public Page<VariableExpenseDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Long userId = userContextService.getCurrentUser().getId();
        if (from != null && to != null) {
            return variableExpenseRepository.findByUserIdAndExpenseDateBetween(userId, from, to, pageable)
                    .map(variableExpenseMapper::toDto);
        }
        return variableExpenseRepository.findByUserId(userId, pageable).map(variableExpenseMapper::toDto);
    }

    @Override
    public VariableExpenseDto update(Long id, VariableExpenseRequest request) {
        User user = userContextService.getCurrentUser();
        VariableExpense expense = variableExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VariableExpense", id));
        userContextService.checkOwnership(expense.getUser(), user);
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setCategory(request.getCategory());
        return variableExpenseMapper.toDto(variableExpenseRepository.save(expense));
    }

    @Override
    public void delete(Long id) {
        User user = userContextService.getCurrentUser();
        VariableExpense expense = variableExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VariableExpense", id));
        userContextService.checkOwnership(expense.getUser(), user);
        variableExpenseRepository.deleteById(id);
    }
}
