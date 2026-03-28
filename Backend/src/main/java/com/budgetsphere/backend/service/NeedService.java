package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.NeedDto;
import com.budgetsphere.backend.dto.NeedRequest;
import com.budgetsphere.backend.entity.NeedPriority;
import com.budgetsphere.backend.entity.NeedStatus;
import org.springframework.data.domain.Page;

public interface NeedService {
    NeedDto create(NeedRequest request);
    Page<NeedDto> getAll(int page, int size);
    Page<NeedDto> getByStatus(NeedStatus status, int page, int size);
    Page<NeedDto> getByPriority(NeedPriority priority, int page, int size);
    NeedDto update(Long id, NeedRequest request);
    NeedDto updateStatus(Long id, NeedStatus status);
    void delete(Long id);
}
