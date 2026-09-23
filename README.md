# Restock

물류 전공에서 학습한 재고관리 이론을 실제 데이터에 적용해 보기 위해 만든 Spring Boot 기반 재고 의사결정 시뮬레이션 프로젝트입니다.

과거 수요 데이터를 기반으로 ABC 분석, EOQ, 안전재고, 재주문점을 계산하고, 미래 생산계획과 BOM을 이용해 MRP를 수행합니다. 또한 정책값을 변경하여 계산 결과의 차이를 비교할 수 있습니다.

## 개발 목적

재고는 너무 많이 보유하면 보관비용이 증가하고, 너무 적게 보유하면 품절이나 생산 차질이 발생할 수 있습니다.

대학에서 학습한 재고관리 이론을 단순히 공식으로 이해하는 데서 끝내지 않고, Java와 Spring Boot를 이용해 실제 데이터에 적용해 보기 위해 프로젝트를 시작했습니다.

이 프로젝트에서는 품목과 수요 데이터를 관리하고, ABC 분석과 EOQ, 안전재고, 재주문점을 계산합니다. 또한 미래 생산계획과 BOM을 기반으로 필요한 자재 수량과 발주 시점을 계산하고, 정책값 변화에 따른 결과 차이를 비교합니다.

## 기술 스택

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Jakarta Validation

### Database

- PostgreSQL 17

### Build / Test

- Gradle
- JUnit 5
- Mockito
- AssertJ
- H2 (테스트 환경)

테스트 환경에서는 H2 인메모리 데이터베이스를 사용하여 로컬 PostgreSQL 실행 여부와 관계없이 테스트할 수 있습니다.

## 프로젝트 구조

```text
com.restock

├─ item
│  └─ 품목 관리
│
├─ demand
│  └─ 과거 수요 이력 관리
│
├─ abc
│  └─ ABC 분석
│
├─ inventorypolicy
│  └─ EOQ / 안전재고 / 재주문점 계산
│
├─ bom
│  └─ BOM 구성 관리
│
├─ planneddemand
│  └─ 미래 생산계획 관리
│
├─ mrp
│  └─ 자재소요계획 계산
│
└─ scenario
   └─ 재고 정책 비교
```

## 핵심 기능

### 1. 품목 관리

품목별로 다음 정보를 관리합니다.

- 품목 코드
- 품목명
- 단가
- 리드타임
- 현재 재고량

### 2. 수요 이력 관리

품목별 과거 일자별 수요량을 저장합니다.

동일 품목의 동일 날짜에는 하나의 집계 수요 데이터만 등록할 수 있도록 제한했습니다.

### 3. ABC 분석

분석 연도의 품목별 사용가치를 계산합니다.

사용가치 = 수요량 × 단가

사용가치가 높은 순서대로 정렬한 뒤 누적 비율을 계산하여 현재 프로젝트에서는 다음 기준을 사용합니다.

- A: 누적 비율 80% 이하
- B: 누적 비율 80% 초과 ~ 95% 이하
- C: 누적 비율 95% 초과

ABC 기준은 학습을 위해 정한 정책이며 실제 업무에서는 기업의 관리 기준에 따라 달라질 수 있습니다.

### 4. EOQ / 안전재고 / 재주문점

EOQ는 주문비용과 보관비용을 고려하여 한 번에 주문할 적정 수량을 계산합니다.

EOQ = √(2DS / H)

- D: 연간 수요량
- S: 1회 주문비용
- H: 단위당 연간 보관비용

안전재고는 수요 변동과 리드타임을 고려해 계산합니다.

Safety Stock = z × σ × √L

- z: 서비스 수준에 따른 z-score
- σ: 일별 수요 표준편차
- L: 리드타임

현재 프로젝트에서는 ABC 등급에 따라 다음 서비스 수준을 적용합니다.

- A: 99%
- B: 95%
- C: 90%

재주문점은 다음과 같이 계산합니다.

ROP = 리드타임 동안의 예상 수요 + 안전재고

### 5. BOM

완제품 1개를 생산할 때 필요한 부품과 수량을 관리합니다.

예를 들어 PRODUCT-A의 BOM이 다음과 같다고 가정합니다.

- MOTOR × 1
- GEAR × 2
- BOLT × 8

같은 상위 품목과 구성품 조합의 중복 등록을 방지하며, 품목이 자기 자신을 직접 구성품으로 등록하는 것도 제한합니다.

### 6. 미래 생산계획

미래 특정 날짜에 어떤 품목이 몇 개 필요한지를 관리합니다.

예시:

- 필요일: 2026-10-01
- 품목: PRODUCT-A
- 계획수량: 100

이 생산계획은 MRP 계산의 시작 데이터로 사용됩니다.

### 7. MRP

MRP(Material Requirements Planning)는 미래 생산계획과 BOM을 이용해 생산에 필요한 부품 수량과 발주 시점을 계산합니다.

PRODUCT-A 100개가 필요하고 BOM이 다음과 같다면:

- MOTOR × 1
- GEAR × 2
- BOLT × 8

총소요량은 다음과 같습니다.

- MOTOR = 100
- GEAR = 200
- BOLT = 800

현재 재고가 다음과 같다면:

- MOTOR = 100
- GEAR = 100
- BOLT = 500

순소요량은 다음과 같이 계산됩니다.

- MOTOR = 0
- GEAR = 100
- BOLT = 300

현재 버전에서는 Lot-for-Lot 방식을 사용하여 계획입고량을 순소요량과 동일하게 처리합니다.

순소요량이 0보다 큰 경우에만 실제 발주가 필요하다고 판단하며, 각 구성품의 리드타임을 필요일에서 역산하여 발주일을 계산합니다.

발주일 = 필요일 - 리드타임

순소요량이 0인 경우에는 주문이 필요하지 않으므로 발주일은 `null`로 처리합니다.

현재 MRP는 학습을 위해 1단계 BOM을 대상으로 구현했습니다.

### 8. 재고 정책 시나리오 비교

같은 품목과 수요 데이터를 기준으로 주문비용과 보관비용을 변경했을 때 계산 결과가 어떻게 달라지는지 비교합니다.

예를 들어 기준 정책과 비교 정책을 다음과 같이 설정할 수 있습니다.

기준 정책:

- 주문비용 = 20,000
- 보관비용 = 5,000

비교 정책:

- 주문비용 = 80,000
- 보관비용 = 5,000

연간 수요가 200이라면 EOQ는 다음과 같이 달라집니다.

- 기준 EOQ = 40
- 비교 EOQ = 80
- 차이 = +40

이를 통해 주문비용이나 보관비용 변화가 EOQ에 어떤 영향을 주는지 확인할 수 있습니다.

현재 구조에서는 비용만 변경할 경우 안전재고와 재주문점은 변하지 않습니다. 안전재고와 재주문점 계산에는 주문비용과 보관비용이 직접 사용되지 않기 때문입니다.

## 주요 API

| Method | Endpoint                                    | 설명                           |
| ------ | ------------------------------------------- | ------------------------------ |
| POST   | `/api/items`                                | 품목 등록                      |
| GET    | `/api/items`                                | 품목 전체 조회                 |
| GET    | `/api/items/{id}`                           | 품목 단건 조회                 |
| PUT    | `/api/items/{id}`                           | 품목 수정                      |
| DELETE | `/api/items/{id}`                           | 품목 삭제                      |
| POST   | `/api/demands`                              | 수요 이력 등록                 |
| GET    | `/api/demands/{id}`                         | 수요 이력 단건 조회            |
| GET    | `/api/demands/item/{itemId}`                | 품목별 수요 이력 조회          |
| PUT    | `/api/demands/{id}`                         | 수요 이력 수정                 |
| DELETE | `/api/demands/{id}`                         | 수요 이력 삭제                 |
| GET    | `/api/abc?year={year}`                      | 연도별 ABC 분석                |
| POST   | `/api/inventory-policies/calculate`         | EOQ / 안전재고 / 재주문점 계산 |
| POST   | `/api/boms`                                 | BOM 구성품 등록                |
| GET    | `/api/boms/parent/{parentItemId}`           | 상위 품목의 BOM 조회           |
| PUT    | `/api/boms/{id}`                            | BOM 필요수량 수정              |
| DELETE | `/api/boms/{id}`                            | BOM 삭제                       |
| POST   | `/api/planned-demands`                      | 미래 생산계획 등록             |
| GET    | `/api/planned-demands`                      | 미래 생산계획 전체 조회        |
| GET    | `/api/planned-demands/{id}`                 | 미래 생산계획 단건 조회        |
| GET    | `/api/planned-demands/item/{itemId}`        | 품목별 미래 생산계획 조회      |
| PUT    | `/api/planned-demands/{id}`                 | 미래 생산계획 수정             |
| DELETE | `/api/planned-demands/{id}`                 | 미래 생산계획 삭제             |
| GET    | `/api/mrp/planned-demand/{plannedDemandId}` | 생산계획 기준 MRP 계산         |
| POST   | `/api/scenarios/compare`                    | 두 재고 정책 결과 비교         |

## 실행 방법

### 1. PostgreSQL 데이터베이스 생성

PostgreSQL에서 다음 이름의 데이터베이스를 생성합니다.

```text
restock
```

기본 연결 정보:

- Host: localhost
- Port: 5432
- Database: restock
- Username: postgres

### 2. DB 비밀번호 설정

실제 데이터베이스 비밀번호는 Git에 올리지 않습니다.

프로젝트 루트의 `application-secret.example.yml`을 참고하여 `application-secret.yml` 파일을 생성합니다.

```yaml
app:
  db-password: "your-postgresql-password"
```

`application-secret.yml`은 `.gitignore`에 등록하여 Git 추적 대상에서 제외합니다.

`application.yaml`에서는 다음과 같이 별도의 설정 파일을 불러옵니다.

```yaml
spring:
  config:
    import: optional:file:./application-secret.yml
```

### 3. 애플리케이션 실행

프로젝트 루트에서 다음 명령을 실행합니다.

```powershell
.\gradlew bootRun
```

### 4. 테스트 실행

전체 테스트는 다음 명령으로 실행합니다.

```powershell
.\gradlew test
```

테스트 환경에서는 H2 인메모리 데이터베이스를 사용하므로 로컬 PostgreSQL 실행 여부와 관계없이 테스트할 수 있습니다.

## 현재 구현 범위

Restock은 재고관리 이론을 백엔드 서비스로 직접 구현하고 계산 결과를 확인하기 위한 학습용 프로젝트입니다.

현재 구현 범위는 다음과 같습니다.

- 품목 및 현재 재고 관리
- 과거 수요 이력 관리
- 사용가치 기반 ABC 분석
- EOQ 계산
- ABC 등급별 서비스 수준을 이용한 안전재고 계산
- 재주문점 계산
- BOM 관리
- 미래 생산계획 관리
- 1단계 BOM 기반 MRP 계산
- 기준 정책과 비교 정책의 계산 결과 비교

현재 MRP는 학습 목적의 단순화된 구조로 구현되어 있습니다.

- 1단계 BOM만 계산
- Lot-for-Lot 방식 사용
- 예정입고량은 고려하지 않음
- 기간별 재고 이월은 고려하지 않음
- 다단계 BOM 재귀 계산은 지원하지 않음

## 향후 개선 가능 항목

현재 구조를 확장한다면 다음 기능을 추가할 수 있습니다.

- 다단계 BOM 기반 MRP
- BOM 순환 참조 탐지
- 예정입고량 반영
- 기간별 재고 이월 계산
- 다양한 Lot Sizing 정책 적용
- Flyway를 이용한 데이터베이스 스키마 버전 관리
