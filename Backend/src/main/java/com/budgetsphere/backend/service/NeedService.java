package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.NeedDto;
import com.budgetsphere.backend.dto.NeedRequest;
import com.budgetsphere.backend.entity.Need;
import com.budgetsphere.backend.entity.NeedPriority;
import com.budgetsphere.backend.entity.NeedStatus;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.NeedMapper;
import com.budgetsphere.backend.repository.NeedRepository;
import com.budgetsphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NeedService {

    private final NeedRepository needRepository;
    private final UserRepository userRepository;
    private final NeedMapper needMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public NeedDto create(NeedRequest request) {
        Need need = needMapper.toEntity(request, getCurrentUser());
        return needMapper.toDto(needRepository.save(need));
    }

    public Page<NeedDto> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return needRepository.findByUserId(getCurrentUser().getId(), pageable).map(needMapper::toDto);
    }

    public Page<NeedDto> getByStatus(NeedStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return needRepository.findByUserIdAndStatus(getCurrentUser().getId(), status, pageable).map(needMapper::toDto);
    }

    public Page<NeedDto> getByPriority(NeedPriority priority, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return needRepository.findByUserIdAndPriority(getCurrentUser().getId(), priority, pageable).map(needMapper::toDto);
    }

    public NeedDto update(Long id, NeedRequest request) {
        Need need = needRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Need not found"));
        need.setTitle(request.getTitle());
        need.setEstimatedPrice(request.getEstimatedPrice());
        need.setStatus(request.getStatus());
        need.setPriority(request.getPriority());
        return needMapper.toDto(needRepository.save(need));
    }

    public NeedDto updateStatus(Long id, NeedStatus status) {
        Need need = needRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Need not found"));
        need.setStatus(status);
        return needMapper.toDto(needRepository.save(need));
    }

    public void delete(Long id) {
        needRepository.deleteById(id);
    }
}
