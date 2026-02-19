package com.capstone.flowids.controller;

import com.capstone.flowids.common.ApiResponse;
import com.capstone.flowids.dto.MemberResponse;
import com.capstone.flowids.dto.MemberSignupRequest;
import com.capstone.flowids.dto.MemberUpdateRequest;
import com.capstone.flowids.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // C - 회원가입
    @PostMapping("/api/v1/auth/signup")
    public ResponseEntity<ApiResponse<MemberResponse>> signup(
            @Valid @RequestBody MemberSignupRequest request) {
        MemberResponse response = memberService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    // R - 회원 단건 조회
    @GetMapping("/api/v1/members/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(memberService.findById(id)));
    }


    // U - 회원 정보 수정 (이름, 비밀번호)
    @PutMapping("/api/v1/members/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MemberUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(memberService.update(id, request)));
    }

    // D - 회원 탈퇴
    @DeleteMapping("/api/v1/members/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        memberService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.noContent());
    }
}
