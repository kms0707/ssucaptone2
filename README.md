# SVM-TCN Hybrid Flow-based Intrusion Detection System
### SVM-TCN 하이브리드 구조의 Flow 로그 기반 침입 탐지 시스템

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Model%20Server-FastAPI-009688?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-OCSVM%20%2B%20TCN-8A2BE2?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Data-Flow%20Logs-orange?style=for-the-badge" />
</p>

<p align="center">
  Flow 로그 기반 이상 탐지와 TCN 정밀 분석을 결합한<br/>
  2단계 하이브리드 AI 침입 탐지 시스템
</p>

---

## 👥 Team

- **김민서** (소프트웨어학부, 20203088)
- **송우용** (소프트웨어학부, 20213126)
- **안준엽** (소프트웨어학부, 20211794)

---

## 📌 Overview

본 프로젝트는 네트워크 환경에서 수집되는 **Flow 로그 데이터**를 기반으로  
이상 트래픽을 탐지하는 **AI 기반 침입 탐지 시스템(NIDS)** 을 설계하고 구현한 캡스톤디자인2 결과물입니다.

기존의 시그니처 기반 침입 탐지 시스템은 알려진 공격에는 효과적이지만,  
변형 공격이나 Zero-day 공격에 대응하기 어렵고 패킷 단위 분석에 따른 연산 비용이 크다는 한계가 있습니다.

이에 본 프로젝트에서는 **패킷 payload를 직접 분석하지 않고**,  
세션 단위 메타데이터인 **Flow 로그**를 활용하여 실시간 탐지에 적합한 경량 구조를 설계하였습니다.

또한 캡스톤디자인1에서 수행한 단일 모델 실험 결과를 바탕으로,  
캡스톤디자인2에서는 **One-Class SVM(1차 이상 탐지) + TCN(2차 정밀 분석)** 구조의  
**2단계 하이브리드 탐지 시스템**을 실제 서비스 형태로 구현하였습니다.

---

## 🎯 Objectives

- Flow 로그 기반 실시간 침입 탐지 시스템 구현
- 기존 시그니처 기반 탐지 방식의 한계 보완
- 빠른 이상 선별과 정밀 분석을 분리한 하이브리드 구조 설계
- 수집, 저장, 추론, 시각화를 포함한 End-to-End 탐지 파이프라인 구축
- 실제 운영 환경에 적용 가능한 구조 검토

---

## 📚 Table of Contents

- [Why Flow-based NIDS?](#-why-flow-based-nids)
- [System Architecture](#-system-architecture)
- [Detection Pipeline](#-detection-pipeline)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Folder Details](#-folder-details)
- [Core Features](#-core-features)
- [Implementation Results](#-implementation-results)
- [Dashboard](#-dashboard)
- [Getting Started](#-getting-started)
- [Limitations and Future Work](#-limitations-and-future-work)
- [Demo](#-demo)
- [References](#-references)

---

## 🔍 Why Flow-based NIDS?

### 기존 IDS의 한계
- 기존 NIDS는 주로 **Signature 기반 탐지 방식**에 의존
- 알려진 공격은 잘 탐지하지만 **변형 공격 및 Zero-day 공격 대응이 어려움**
- 패킷 단위 분석은 **연산 비용이 높아 대규모 환경에서 실시간 처리에 부담**이 큼

### Flow 기반 접근의 장점
- 패킷 전체가 아닌 **세션 단위 메타데이터**를 활용
- 저장 비용과 분석 비용을 줄일 수 있음
- 실제 운영 환경에 적용하기 쉬운 구조 설계 가능

### AI 기반 탐지의 필요성
- 정상 트래픽 패턴을 학습하여 **비정상 행위 자동 탐지**
- 규칙 기반 탐지의 한계 보완
- 새로운 유형의 위협에 대한 대응 가능성 확보

---

## 🏗 System Architecture

본 시스템은 다음과 같은 흐름으로 동작합니다.

    Custom Agent
       ↓
    Backend Server
       ↓
    Model Server (OCSVM + TCN)
       ↓
    Database / Log Storage
       ↓
    Web Dashboard

### 동작 개요
1. **Custom Collector(Agent)** 가 네트워크 트래픽을 수집합니다.
2. 수집된 데이터를 **Flow 형태로 정규화 및 저장**합니다.
3. 전처리 및 특징 추출을 수행합니다.
4. **OCSVM** 으로 1차 이상 여부를 판별합니다.
5. 이상 후보 Flow에 대해서만 **TCN** 으로 2차 정밀 분석을 수행합니다.
6. 결과를 저장하고 **Dashboard** 에 시각화합니다.

즉, 전체 트래픽에 무거운 모델을 바로 적용하지 않고  
1차 필터링 후 필요한 데이터만 정밀 분석함으로써  
**탐지 성능과 처리 효율을 함께 확보하는 구조**를 목표로 하였습니다.

---

## 🤖 Detection Pipeline

### 1단계: OCSVM 기반 이상 탐지
- 정상 트래픽 분포를 학습
- 전체 Flow 중 **이상 후보를 빠르게 선별**
- 실시간 환경에서 빠른 1차 판별 역할 수행

### 2단계: TCN 기반 정밀 분석
- 1차 단계에서 이상으로 분류된 Flow만 입력
- 시간적 패턴을 반영하여 **정밀 이상 탐지 및 공격 유형 분석**
- 전체 트래픽에 직접 적용하는 방식보다 효율적임

### Threshold
- **OCSVM threshold**: `0.899`
- **TCN threshold**: `0.881`

실험 기준 최적 threshold를 적용하였으며, 실제 운영 환경에서는  
오탐과 미탐의 균형에 따라 조정 가능하도록 설계하였습니다.

---

## 🛠 Tech Stack

### Language
- Python 3.10
- Java
- JavaScript / TypeScript

### Backend
- Spring Boot

### AI / Model Server
- FastAPI
- Uvicorn
- PyTorch
- scikit-learn

### Frontend
- React

### Infra / Data
- PostgreSQL
- Redis
- Kafka
- Elasticsearch
- Kibana
- Docker Compose

### Collector
- Scapy 기반 Custom Agent

---

## 📁 Repository Structure

현재 저장소 루트에는 다음 폴더들이 포함되어 있습니다.

    ssucaptone2/
    ├── agent/              # Flow 수집 에이전트
    ├── backend/flowids/    # Spring Boot 기반 백엔드 서버
    ├── frontend/           # React 기반 웹 대시보드
    ├── model-service/      # FastAPI 기반 AI 추론 서버
    ├── trainer/            # 모델 학습 및 실험 코드
    └── .gitignore

---

## 📂 Folder Details

아래 설명은 저장소를 처음 보는 사람이 각 폴더의 역할을 빠르게 이해할 수 있도록 정리한 것입니다.

### 1. `agent/`
**Flow 수집 에이전트 모듈**

이 폴더는 네트워크 트래픽을 수집하고, 이를 세션 단위의 Flow 로그로 변환하여 백엔드 서버로 전송하는 역할을 담당합니다.

#### 주요 역할
- 네트워크 패킷 캡처
- Flow 생성 및 정규화
- 출발지/목적지 IP, 포트, 프로토콜, 바이트 수, 패킷 수 등 메타데이터 추출
- Backend API로 Flow 로그 전송

#### 포함될 수 있는 기능 예시
- 실시간 패킷 수집
- Flow timeout 처리
- API key 기반 인증 전송
- 배포 환경용 설정 분리

#### 정리
`agent/`는 실제 네트워크 환경과 시스템을 연결하는 **입력 지점**입니다.  
즉, 원시 네트워크 트래픽을 AI 탐지가 가능한 형태의 Flow 로그로 바꾸는 첫 단계입니다.

---

### 2. `backend/flowids/`
**Spring Boot 기반 백엔드 서버**

이 폴더는 전체 서비스의 중심 API 서버 역할을 하며, Agent와 Model Server, DB, Frontend를 연결합니다.

#### 주요 역할
- API Key 인증
- Flow 로그 수신
- 프로젝트별 데이터 관리
- Model Server 추론 요청
- 추론 결과 후처리 및 저장
- Dashboard용 조회 API 제공

#### 포함될 수 있는 기능 예시
- 사용자 인증/인가
- 프로젝트 생성 및 삭제
- API 키 발급 및 재발급
- Flow 로그 저장 및 조회
- 추론 결과 저장
- 공격 상태 필터링 조회

#### 정리
`backend/flowids/`는 시스템의 **중앙 제어 레이어**입니다.  
수집된 Flow를 받아 모델 서버에 전달하고, 결과를 저장하고, 프론트엔드에 다시 전달하는 핵심 역할을 수행합니다.

---

### 3. `frontend/`
**React 기반 웹 대시보드**

이 폴더는 사용자가 시스템을 직접 사용하는 UI를 담당합니다.

#### 주요 역할
- 로그인 / 회원가입
- 프로젝트 선택 및 생성
- 실시간 Flow 로그 조회
- 정상 / 공격 상태 시각화
- 개별 Flow 상세 분석 결과 확인
- API 키 및 설정 관리

#### 포함될 수 있는 화면 예시
- 로그인 화면
- 회원가입 화면
- 프로젝트 선택 화면
- 프로젝트 추가 화면
- 프로필 화면
- 대시보드 화면
- Flow Log Viewer 화면
- 설정 화면

#### 정리
`frontend/`는 탐지 결과를 사용자가 직관적으로 볼 수 있게 해주는 **시각화 및 관리 인터페이스**입니다.

---

### 4. `model-service/`
**FastAPI 기반 AI 추론 서버**

이 폴더는 실제 AI 모델 추론을 담당하는 서버입니다.

#### 주요 역할
- 입력 Flow 전처리
- 특징 추출
- OCSVM 1차 이상 탐지
- 이상 후보에 대한 TCN 2차 정밀 분석
- 최종 anomaly score 반환

#### 포함될 수 있는 기능 예시
- 전처리 파이프라인
- 모델 로딩
- 추론 API
- threshold 적용
- 결과 포맷 통일

#### 정리
`model-service/`는 시스템의 **AI 판단 엔진**입니다.  
Backend가 전달한 Flow 데이터를 바탕으로 실제 이상 여부를 판정합니다.

---

### 5. `trainer/`
**모델 학습 및 실험 코드**

이 폴더는 서비스에서 사용하는 모델을 학습, 검증, 실험하는 코드가 포함되는 영역입니다.

#### 주요 역할
- 데이터셋 전처리
- 특징 선택
- OCSVM 학습
- TCN 학습
- Threshold 탐색
- 성능 평가 및 분석
- 실험 결과 저장

#### 포함될 수 있는 기능 예시
- 데이터 로더
- 실험 스크립트
- 학습 파이프라인
- 성능 시각화 코드
- SHAP 기반 분석 코드

#### 정리
`trainer/`는 실제 서비스에서 사용하는 AI 모델을 만들고 개선하는 **연구/실험 레이어**입니다.

---

## ✨ Core Features

### Flow 로그 수집
- 네트워크 트래픽을 Flow 형태로 변환하여 수집
- 외부 환경과 연동 가능한 API 기반 구조 제공

### 이상 탐지 및 정밀 분석
- OCSVM을 통한 빠른 이상 후보 선별
- TCN을 통한 2차 정밀 탐지 수행

### 결과 저장 및 시각화
- Flow 로그 및 탐지 결과 저장
- Dashboard에서 실시간 조회 가능

### 프로젝트 기반 관리
- 프로젝트 생성 / 선택 / 삭제 기능
- 프로젝트별 API 키 발급 및 관리 가능

### 상세 로그 조회
- 개별 Flow에 대해 출발지/목적지 IP, 프로토콜, 포트, 시간, 위험 점수 등 확인 가능

---

## 📊 Implementation Results

본 프로젝트에서는 다음 항목을 구현하였습니다.

- 실시간 Flow 수집 Agent 구현
- Backend - AI 서버 연동 API 구축
- 모델 서버 REST API 구성
- Dashboard를 통한 탐지 결과 시각화
- 전체 시스템 End-to-End 구현 완료

### 모델 실험 결과
- **OCSVM 최적 threshold**: `0.899`
- **OCSVM 성능**
  - Precision: `0.9849`
  - Recall: `0.9985`
  - F1-score: `0.9917`

- **TCN 최적 threshold**: `0.881`
- **TCN 성능**
  - Precision: `0.9955`
  - Recall: `0.9981`
  - F1-score: `0.9968`

### 해석
- OCSVM은 빠른 1차 이상 탐지에 적합
- TCN은 시간적 패턴을 반영한 정밀 분석에 강점
- 두 모델을 결합한 하이브리드 구조를 통해 성능과 효율의 균형 확보 가능

---

## 🖥 Dashboard

웹 대시보드에서는 다음 기능을 제공합니다.

- 로그인 / 회원가입
- 프로젝트 선택 및 생성
- Flow 로그 목록 조회
- 정상 / 공격 상태 확인
- 검색 및 필터 기능
- Flow 상세 분석 정보 확인
- API 키 조회 및 재발급
- 프로젝트 설정 관리

### 주요 화면
- Login
- Sign Up
- Project Select
- Create Project
- Profile
- Main Dashboard
- Flow Log Viewer
- Settings

---

## 🚀 Getting Started

> 아래 명령어는 일반적인 실행 예시입니다.  
> 실제 실행 시에는 각 폴더의 `README`, `.env`, `docker-compose` 설정에 맞게 조정이 필요할 수 있습니다.

### 1. Clone Repository

    git clone https://github.com/kms0707/ssucaptone2.git
    cd ssucaptone2

### 2. Run with Docker Compose

    docker-compose up --build

### 3. Example Service Endpoints

    Frontend Dashboard : http://localhost:3000
    Backend Server     : http://localhost:8080
    Model Server       : http://localhost:8000

### 4. Run Agent
Collector(Agent)에서 수집한 Flow 로그를 Backend API로 전송하여 탐지를 수행합니다.

---

## ⚠ Limitations and Future Work

### 현재 한계
- 공개 데이터셋 및 제한적 실험 환경 중심의 검증 비중이 큼
- 정상 트래픽 오탐 감소를 위한 추가 보정 필요
- 다양한 공격 유형에 대한 일반화 성능 추가 검증 필요
- 서비스는 구현되었지만 실무 적용 수준의 고도화는 추가 개발 필요

### 향후 계획
- 실제 환경 정상 Flow 로그 추가 학습
- 모델 성능 개선 및 최적화
- 다양한 공격 유형 데이터셋 추가 학습
- 실무 적용 가능한 수준으로 시스템 고도화
- 소프트웨어 등록, 특허 출원, 논문 작성, 대회 출전 추진

---

## 🌐 Demo

- **Web Dashboard**: https://ssucaptone2.vercel.app/

---

## 📚 References

### Datasets
- NF-UNSW-NB15
- CICIDS2017
- CSE-CIC-IDS2018
- UNSW-NB15
- AIT Netflow Dataset
- CAIDA Dataset
- UWF-ZeekData22 / UWF-ZeekDataFall22

### Papers
- Network Anomaly Detection: Flow-based or Packet-based Approach?
- Flow-based intrusion detection: Techniques and challenges
- NetFlow Datasets for Machine Learning-based Network Intrusion Detection Systems
- A flow-based IDS using Machine Learning in eBPF
- A comprehensive review of AI based intrusion detection system
- Evaluating machine learning-based intrusion detection systems with explainable AI

---

## 🔗 Repository

- **GitHub**: https://github.com/JunYeopAn/ssucaptone1

---

## 🙌 Notes

이 프로젝트는 Flow 로그 기반의 경량 침입 탐지와  
AI 기반 이상 탐지를 결합하여 실제 서비스 형태로 구현한 캡스톤 결과물입니다.

단일 모델 성능 비교를 넘어,  
**수집 → 전처리 → 추론 → 저장 → 시각화** 까지 이어지는  
End-to-End 탐지 시스템을 구현하는 데 초점을 두었습니다.
