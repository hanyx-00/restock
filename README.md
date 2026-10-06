# RESTOCK

> 在庫データを入力・分析し、生産に必要な部品の数量と発注時期を計算する在庫意思決定シミュレーター

[한국어 README](README.ko.md)

RESTOCKは、物流・在庫管理の授業で学んだ概念を、実際に動くシステムとして実装した個人プロジェクトです。品目と過去の需要を管理し、ABC分析と在庫方針を計算したうえで、生産計画とBOMをもとにMRPを実行します。注文費用と保管費用を変えたときに方針の結果がどう変わるかも、一つの画面で比較できます。

## 意思決定の流れ

```text
品目の登録 → 需要履歴の蓄積 → ABC分析 → EOQ・安全在庫・ROPの計算
                                        ↓
シナリオ比較 ← 在庫方針の検討         BOM + 生産計画 → MRP → 発注量・発注日の確認
```

各段階は独立した計算例ではなく、一つのデータの流れとしてつながっています。ダッシュボードは、登録品目数・総在庫・需要記録数・計画生産量を、実際のAPIデータで集計します。

## 主な機能

| 機能 | 実装内容 |
| --- | --- |
| Items | 品目コード、名前、単価、リードタイム、現在庫のCRUD |
| Demand History | 品目別・日付別の需要のCRUD、同じ品目・同じ日付の重複防止、需要推移の可視化 |
| ABC Analysis | 年度別の使用金額と累積比率を計算し、A/B/C等級に分類 |
| Inventory Policy | 実際の需要履歴とABC等級を使い、EOQ・安全在庫・発注点（ROP）を計算 |
| BOM | 完成品と構成品の所要量のCRUD、重複と自己参照の防止 |
| Planned Demand | 品目別の将来の必要日と計画数量のCRUD |
| MRP | 1段階のBOM展開、総所要量・正味所要量・計画入庫量・計画発注日の計算 |
| Scenario Compare | 基準案と代替案の注文費用・保管費用による、EOQ・安全在庫・ROPの比較 |
| Dashboard | 品目、現在庫、需要履歴、生産計画を実際の登録データで集計 |

## 主要な計算ロジック

### ABC分析

品目別の年間使用金額（`年間需要量 × 単価`）を降順に並べ、累積比率で等級を分けます。

- A：累積比率 80% 以下
- B：80% 超 95% 以下
- C：95% 超

### 在庫方針

```text
EOQ = √(2 × 年間需要量(D) × 1回の注文費用(S) / 単位あたりの年間保管費用(H))
Safety Stock = z × 日別需要の標準偏差(σ) × √リードタイム(L)
ROP = 日平均需要 × リードタイム + Safety Stock
```

日別需要の標準偏差は、その年に需要がなかった日を0として含めて計算します。サービス水準とzスコアは、ABC等級に応じて A 99%（2.3263）、B 95%（1.6449）、C 90%（1.2816）を適用します。

### MRP

```text
総所要量（Gross Requirement）       = 完成品の計画数量 × 構成品の単位所要量
正味所要量（Net Requirement）       = max(総所要量 - 現在庫, 0)
計画入庫量（Planned Order Receipt） = 正味所要量
計画発注日（Planned Order Release） = 必要日 - 構成品のリードタイム
```

現在の実装は、1段階のBOMとLot-for-Lot方式を使います。正味所要量が0の場合は発注が不要なため、計画発注日は `null` となり、画面には **発注不要** と表示されます。

## MRPの例

サービスのテストに含まれているシナリオです。2026-10-01に `PRODUCT-A` が100個必要で、BOMが `MOTOR × 1`、`GEAR × 2`、`BOLT × 8` の場合の結果です。

| 構成品 | 単位所要量 | 総所要量 | 現在庫 | 正味所要量 / 計画入庫量 | リードタイム | 計画発注日 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| MOTOR | 1 | 100 | 100 | 0 | 7日 | 発注不要 |
| GEAR | 2 | 200 | 100 | 100 | 5日 | 2026-09-26 |
| BOLT | 8 | 800 | 500 | 300 | 3日 | 2026-09-28 |

MOTORは現在庫ですべてまかなえます。GEARとBOLTは不足分を計画入庫量とし、必要日から各リードタイムを逆算して発注日を示します。

## 技術スタック

| 区分 | 技術 |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA, Jakarta Validation |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, TanStack Query, React Hook Form, Zod, Axios |
| Database | PostgreSQL, H2（テスト） |
| Test / Build | JUnit 5, Mockito, AssertJ, Gradle, ESLint |

## 構成

```text
restock/
├─ src/main/java/com/restock/
│  ├─ item, demand              # 基準情報と需要履歴
│  ├─ abc, inventorypolicy      # 分析と在庫方針の計算
│  ├─ bom, planneddemand        # BOMと生産計画
│  └─ mrp, scenario             # 資材所要量計画と方針の比較
├─ src/test/                    # H2の設定とサービスの計算テスト
└─ frontend/src/
   ├─ api, types                # APIクライアントと型
   ├─ components                # 共通UIとレイアウト
   └─ pages                     # 主要な9画面
```

フロントエンドはREST APIを呼び出し、バックエンドはController–Service–Repositoryの各層で、入力の検証・計算・永続化を担当します。

## API概要

| 領域 | Endpoint | 範囲 |
| --- | --- | --- |
| 品目 | `/api/items` | 登録、全件・1件の取得、更新、削除 |
| 需要履歴 | `/api/demands` | 登録、1件・品目別の取得、更新、削除 |
| ABC分析 | `GET /api/abc?year={year}` | 年度別の使用金額と等級の計算 |
| 在庫方針 | `POST /api/inventory-policies/calculate` | EOQ、安全在庫、ROPの計算 |
| BOM | `/api/boms` | 構成品の登録、親品目別の取得、数量の更新、削除 |
| 生産計画 | `/api/planned-demands` | 登録、全件・1件・品目別の取得、更新、削除 |
| MRP | `GET /api/mrp/planned-demand/{id}` | 生産計画にもとづく資材所要量の計算 |
| シナリオ | `POST /api/scenarios/compare` | 基準案と代替案の方針結果の比較 |

## 実行方法

### 1. Backend

Java 21とPostgreSQLが必要です。PostgreSQLに `restock` データベースを作成し、ルートの `application-secret.example.yml` をコピーして `application-secret.yml` を作成します。

```yaml
app:
  db-password: "your-postgresql-password"
```

既定の接続先は `localhost:5432`、データベース `restock`、ユーザー `postgres` です。パスワードのファイルはGitの追跡対象から除外しています。

```powershell
.\gradlew bootRun
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

開発サーバーは `/api` へのリクエストを、既定で `http://localhost:8080` にプロキシします。バックエンドのアドレスが異なる場合は、実行前に `VITE_API_PROXY_TARGET` を指定できます。デプロイなどでAPIの基本パス自体を変える場合は、`VITE_API_BASE_URL` を使います。

## テストと検証

```powershell
# Backendのテスト
.\gradlew test

# Frontendの静的チェックと本番ビルド
cd frontend
npm run lint
npm run build
```

バックエンドのテストはH2のインメモリデータベースを使うため、ローカルのPostgreSQLとは切り離して実行されます。サービスのテストでは、在庫方針の計算、MRPの展開、シナリオの差分、エラー条件を検証しています。フロントエンドの `build` は、TypeScriptのチェックのあとにViteの本番バンドルを生成します。

## 現在の範囲と今後の改善

学習の範囲を明確にするため、MRPは1段階のBOM、Lot-for-Lot、現在庫の差し引きに絞りました。次の段階では、以下の機能を拡張できます。

- 多段階BOMの展開と循環参照の検出
- 入荷予定（Scheduled Receipt）と期間ごとの在庫繰り越しの反映
- 固定発注量・最小発注量などのロットサイズ方針の追加
- データ規模の増加に備えたフロントエンドのcode splitting
- Flywayによるデータベーススキーマのバージョン管理
