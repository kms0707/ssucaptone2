package com.capstone.flowids.service;

import com.capstone.flowids.db.MemberRepository;
import com.capstone.flowids.domain.Member;
import com.capstone.flowids.dto.MemberResponse;
import com.capstone.flowids.dto.MemberSignupRequest;
import com.capstone.flowids.dto.MemberUpdateRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberResponse signup(MemberSignupRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다: " + request.getEmail());
        }

        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();

        return new MemberResponse(memberRepository.save(member));
    }

    public MemberResponse findById(Long id) {
        return new MemberResponse(getMemberOrThrow(id));
    }

    @Transactional
    public MemberResponse update(Long id, MemberUpdateRequest request) {
        Member member = getMemberOrThrow(id);

        if (request.getName() != null) {
            member.updateName(request.getName());
        }
        if (request.getPassword() != null) {
            member.updatePassword(passwordEncoder.encode(request.getPassword()));
        }

        return new MemberResponse(member);
    }

    @Transactional
    public void delete(Long id) {
        memberRepository.delete(getMemberOrThrow(id));
    }

    private Member getMemberOrThrow(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원입니다. id=" + id));
    }
}
