# RESTOCK

[日本語 README](README.md)

> 재고 데이터를 입력하고 분석해, 생산에 필요한 자재의 수량과 발주 시점을 계산하는 재고 의사결정 시뮬레이터

RESTOCK은 물류·재고관리 수업에서 배운 개념을 실제 동작하는 시스템으로 구현한 개인 프로젝트입니다. 품목과 과거 수요를 관리하고, ABC 분석과 재고 정책을 계산한 뒤, 생산계획과 BOM을 기반으로 MRP를 수행합니다. 주문비용과 보관비용을 바꿔 정책 결과가 어떻게 달라지는지도 한 화면에서 비교할 수 있습니다.

## 의사결정 흐름

```text
품목 등록 → 수요 이력 축적 → ABC 분석 → EOQ·안전재고·ROP 계산
                                      ↓
시나리오 비교 ← 재고 정책 검토       BOM + 생산계획 → MRP → 발주량·발주일 확인
```

각 단계는 독립된 계산 예제가 아니라 하나의 데이터 흐름으로 연결됩니다. Dashboard는 등록 품목 수, 총 현재고, 수요 기록 수, 계획 생산량을 실제 API 데이터로 집계합니다.

## 주요 기능

| 기능 | 구현 내용 |
| --- | --- |
| Items | 품목 코드, 이름, 단가, 리드타임, 현재고 CRUD |
| Demand History | 품목별 일자 수요 CRUD, 동일 품목·날짜 중복 방지, 수요 추이 시각화 |
| ABC Analysis | 연도별 사용가치와 누적 비율을 계산해 A/B/C 등급 분류 |
| Inventory Policy | 실제 수요 이력과 ABC 등급을 이용해 EOQ, 안전재고, 재주문점 계산 |
| BOM | 완제품과 구성품의 소요량 CRUD, 중복 및 자기참조 방지 |
| Planned Demand | 품목별 미래 필요일과 계획수량 CRUD |
| MRP | 1단계 BOM 전개, 총소요량·순소요량·계획입고량·계획발주일 계산 |
| Scenario Compare | 기준안과 대안의 주문비용·보관비용에 따른 EOQ/안전재고/ROP 비교 |
| Dashboard | 품목, 현재고, 수요 이력, 생산계획을 실제 등록 데이터로 집계 |

## 핵심 계산 로직

### ABC 분석

품목별 연간 사용가치(`연간 수요량 × 단가`)를 내림차순으로 정렬하고 누적 비율로 등급을 나눕니다.

- A: 누적 비율 80% 이하
- B: 80% 초과 95% 이하
- C: 95% 초과

### 재고 정책

```text
EOQ = √(2 × 연간 수요량(D) × 1회 주문비용(S) / 단위당 연간 보관비용(H))
Safety Stock = z × 일별 수요 표준편차(σ) × √리드타임(L)
ROP = 일평균 수요 × 리드타임 + Safety Stock
```

일별 수요 표준편차는 해당 연도의 수요가 없는 날짜를 0으로 포함해 계산합니다. 서비스 수준과 z-score는 ABC 등급에 따라 A 99%(2.3263), B 95%(1.6449), C 90%(1.2816)를 적용합니다.

### MRP

```text
총소요량(Gross Requirement) = 완제품 계획수량 × 구성품 단위소요량
순소요량(Net Requirement) = max(총소요량 - 현재고, 0)
계획입고량(Planned Order Receipt) = 순소요량
계획발주일(Planned Order Release) = 필요일 - 구성품 리드타임
```

현재 구현은 1단계 BOM과 Lot-for-Lot 방식을 사용합니다. 순소요량이 0이면 주문이 필요하지 않으므로 계획발주일은 `null`이며, 화면에는 **발주 불필요**로 표시됩니다.

## MRP 예시

서비스 테스트에 포함된 시나리오입니다. 2026-10-01에 `PRODUCT-A` 100개가 필요하고 BOM이 `MOTOR × 1`, `GEAR × 2`, `BOLT × 8`일 때의 결과입니다.

| 구성품 | 단위소요량 | 총소요량 | 현재고 | 순소요량 / 계획입고량 | 리드타임 | 계획발주일 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| MOTOR | 1 | 100 | 100 | 0 | 7일 | 발주 불필요 |
| GEAR | 2 | 200 | 100 | 100 | 5일 | 2026-09-26 |
| BOLT | 8 | 800 | 500 | 300 | 3일 | 2026-09-28 |

MOTOR는 현재고로 전량 충당됩니다. GEAR와 BOLT는 부족 수량을 계획입고량으로 잡고, 필요일에서 각 리드타임을 역산해 발주일을 제시합니다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA, Jakarta Validation |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, TanStack Query, React Hook Form, Zod, Axios |
| Database | PostgreSQL, H2(Test) |
| Test / Build | JUnit 5, Mockito, AssertJ, Gradle, ESLint |

## 구조

```text
restock/
├─ src/main/java/com/restock/
│  ├─ item, demand              # 기준정보와 수요 이력
│  ├─ abc, inventorypolicy      # 분석과 재고 정책 계산
│  ├─ bom, planneddemand        # BOM과 생산계획
│  └─ mrp, scenario             # 자재소요계획과 정책 비교
├─ src/test/                    # H2 설정 및 서비스 계산 테스트
└─ frontend/src/
   ├─ api, types                # API 클라이언트와 타입
   ├─ components                # 공통 UI와 레이아웃
   └─ pages                     # 9개 주요 화면
```

프론트엔드는 REST API를 호출하고, 백엔드는 Controller–Service–Repository 계층에서 입력 검증, 계산, 영속화를 담당합니다.

## API 요약

| 영역 | Endpoint | 범위 |
| --- | --- | --- |
| 품목 | `/api/items` | 등록, 전체/단건 조회, 수정, 삭제 |
| 수요 이력 | `/api/demands` | 등록, 단건·품목별 조회, 수정, 삭제 |
| ABC 분석 | `GET /api/abc?year={year}` | 연도별 사용가치와 등급 계산 |
| 재고 정책 | `POST /api/inventory-policies/calculate` | EOQ, 안전재고, ROP 계산 |
| BOM | `/api/boms` | 구성품 등록, 상위 품목별 조회, 수량 수정, 삭제 |
| 생산계획 | `/api/planned-demands` | 등록, 전체/단건·품목별 조회, 수정, 삭제 |
| MRP | `GET /api/mrp/planned-demand/{id}` | 생산계획 기준 자재소요 계산 |
| 시나리오 | `POST /api/scenarios/compare` | 기준안과 대안의 정책 결과 비교 |

## 실행 방법

### 1. Backend

Java 21과 PostgreSQL이 필요합니다. PostgreSQL에 `restock` 데이터베이스를 만들고, 루트의 `application-secret.example.yml`을 복사해 `application-secret.yml`을 생성합니다.

```yaml
app:
  db-password: "your-postgresql-password"
```

기본 연결값은 `localhost:5432`, 데이터베이스 `restock`, 사용자 `postgres`입니다. 비밀번호 파일은 Git 추적 대상에서 제외됩니다.

```powershell
.\gradlew bootRun
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

개발 서버는 `/api` 요청을 기본적으로 `http://localhost:8080`으로 프록시합니다. 백엔드 주소가 다르면 실행 전에 `VITE_API_PROXY_TARGET`을 지정할 수 있습니다. 배포처럼 API 기본 경로 자체를 바꿔야 할 때는 `VITE_API_BASE_URL`을 사용합니다.

## 테스트 및 검증

```powershell
# Backend 테스트
.\gradlew test

# Frontend 정적 검사와 프로덕션 빌드
cd frontend
npm run lint
npm run build
```

백엔드 테스트는 H2 인메모리 데이터베이스 설정을 사용하므로 로컬 PostgreSQL과 분리되어 실행됩니다. 서비스 테스트에서는 재고 정책 계산, MRP 전개, 시나리오 차이와 오류 조건을 검증합니다. 프론트엔드 `build`는 TypeScript 검사 후 Vite 프로덕션 번들을 생성합니다.

## 현재 범위와 향후 개선

학습 범위를 명확히 하기 위해 MRP는 1단계 BOM, Lot-for-Lot, 현재고 차감에 집중했습니다. 다음 단계에서는 아래 기능을 확장할 수 있습니다.

- 다단계 BOM 전개와 순환 참조 탐지
- Scheduled Receipt 및 기간별 재고 이월 반영
- 고정 주문량, 최소 주문량 등 Lot Sizing 정책 추가
- 데이터 규모 증가에 대비한 프론트엔드 code splitting
- Flyway 기반 데이터베이스 스키마 버전 관리
