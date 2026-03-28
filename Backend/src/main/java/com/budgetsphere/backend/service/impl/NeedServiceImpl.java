package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.NeedDto;
import com.budgetsphere.backend.dto.NeedRequest;
import com.budgetsphere.backend.entity.Need;
import com.budgetsphere.backend.entity.NeedPriority;
import com.budgetsphere.backend.entity.NeedStatus;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.NeedMapper;
import com.budgetsphere.backend.repository.NeedRepository;
import com.budgetsphere.backend.repository.UserRepository;
import com.budgetsphere.backend.exception.BusinessException;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.NeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NeedServiceImpl implements NeedService {

    private final NeedRepository needRepository;
    private final UserRepository userRepository;
    private final NeedMapper needMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));
    }

    @Override
    public NeedDto create(NeedRequest request) {
        Need need = needMapper.toEntity(request, getCurrentUser());
        return needMapper.toDto(needRepository.save(need));
    }

    @Override
    public Page<NeedDto> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return needRepository.findByUserId(getCurrentUser().getId(), pageable).map(needMapper::toDto);
    }

    @Override
    public Page<NeedDto> getByStatus(NeedStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return needRepository.findByUserIdAndStatus(getCurrentUser().getId(), status, pageable).map(needMapper::toDto);
    }

    @Override
    public Page<NeedDto> getByPriority(NeedPriority priority, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return needRepository.findByUserIdAndPriority(getCurrentUser().getId(), priority, pageable).map(needMapper::toDto);
    }

    @Override
    public NeedDto update(Long id, NeedRequest request) {
        Need need = needRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Need", id));
        need.setTitle(request.getTitle());
        need.setEstimatedPrice(request.getEstimatedPrice());
        need.setStatus(request.getStatus());
        need.setPriority(request.getPriority());
        return needMapper.toDto(needRepository.save(need));
    }

    @Override
    public NeedDto updateStatus(Long id, NeedStatus status) {
        Need need = needRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Need", id));
        need.setStatus(status);
        return needMapper.toDto(needRepository.save(need));
    }

    @Override
    public void delete(Long id) {
        needRepository.deleteById(id);
    }
}
