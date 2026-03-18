package com.budgetsphere.backend.mapper;

import com.budgetsphere.backend.dto.NeedDto;
import com.budgetsphere.backend.dto.NeedRequest;
import com.budgetsphere.backend.entity.Need;
import com.budgetsphere.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class NeedMapper {

    public NeedDto toDto(Need need) {
        return NeedDto.builder()
                .id(need.getId())
                .title(need.getTitle())
                .estimatedPrice(need.getEstimatedPrice())
                .status(need.getStatus())
                .priority(need.getPriority())
                .userId(need.getUser().getId())
                .build();
    }

    public Need toEntity(NeedRequest request, User user) {
        return Need.builder()
                .title(request.getTitle())
                .estimatedPrice(request.getEstimatedPrice())
                .status(request.getStatus())
                .priority(request.getPriority())
                .user(user)
                .build();
    }
}
