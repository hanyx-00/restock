# RESTOCK Frontend

RESTOCKは、品目・需要履歴・在庫方針・BOM・生産計画を扱う在庫意思決定シミュレーターです。このディレクトリにはReact / TypeScriptの画面とAPIクライアントが含まれます。計算・永続化はJava / Spring Bootのバックエンドが担当します。プロジェクト全体の説明は[ルートREADME](../README.md)をご覧ください。

## 技術

- React 19 / TypeScript 6 / Vite 8
- Tailwind CSS 4 / TanStack Query
- React Hook Form / Zod / Axios

## 画面

`src/pages/` の9画面で、ダッシュボード、品目、需要履歴、ABC分析、在庫方針、BOM、生産計画、MRP、シナリオ比較を提供します。

## ローカル実行

Node.js 22を推奨します。バックエンドの起動・データベース設定は[ルートREADME](../README.md#実行方法)を参照してください。

```bash
npm ci
npm run dev
```

開発時は`/api`が既定で`http://localhost:8080`にプロキシされます。接続先を変える場合は`VITE_API_PROXY_TARGET`、APIの基本パスを変える場合は`VITE_API_BASE_URL`を利用できます。

## 品質チェック

```bash
npm run lint
npm run build
```

`build`はTypeScriptのチェックとViteの本番バンドル生成を実行します。[GitHub Actions](../.github/workflows/ci.yml)でも上記2つを自動実行します。バックエンドのJUnitテストはリポジトリルートで`./gradlew test`を実行してください。

## コード構造

- [`src/pages/`](./src/pages/)：9つの画面
- [`src/api/`](./src/api/)：バックエンドAPI呼び出し
- [`src/components/`](./src/components/)：共通UI
- [`src/types/`](./src/types/)：画面・APIの型

計算式とMRPの対象範囲（1段階BOM）は[ルートREADME](../README.md)に記載しています。
