package com.capstone.flowids.dto;

import com.capstone.flowids.domain.Member;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MemberResponse {

    private final Long id;
    private final String email;
    private final String name;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public MemberResponse(Member member) {
        this.id = member.getId();
        this.email = member.getEmail();
        this.name = member.getName();
        this.createdAt = member.getCreatedAt();
        this.updatedAt = member.getUpdatedAt();
    }
}
