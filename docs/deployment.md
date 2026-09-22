# 本番デプロイ手順

このプロジェクトを Cloudflare Workers、D1、R2 へ本番デプロイするための汎用手順です。

## 前提

- Node.js と npm がインストールされていること
- Cloudflare アカウントに対象の Worker、D1、R2 への権限があること
- `wrangler.jsonc` の Worker 名、D1 の `database_name` / `database_id`、R2 のバケット名がデプロイ先と一致していること
- 本番用の変更が Git にコミットされ、レビュー済みであること

## 1. 依存関係をインストールする

```bash
npm ci
```

ローカルで開発した変更をそのままデプロイする場合でも、ロックファイルに基づく再現可能なインストールには `npm ci` を使います。

## 2. Cloudflare の認証を確認する

```bash
npx wrangler whoami
```

未認証の場合はログインします。

```bash
npx wrangler login
```

複数の Cloudflare アカウントや認証プロファイルを使う場合は、対象アカウントで認証されていることを確認してから以降の操作を行います。

## 3. 本番 Secrets を設定する

アプリケーションが必要とする秘密情報は、リポジトリや `.env` にコミットせず、Wrangler の Secret として登録します。

```bash
npx wrangler secret put SECRET_NAME
```

既存の Secret を更新する場合も同じコマンドを使います。登録済みの Secret 名だけを確認する場合は次を実行します。

```bash
npx wrangler secret list
```

ローカルの `.env` は本番環境には自動反映されません。また、値をコマンドライン引数に直接書くとシェル履歴に残るため避けます。

## 4. D1 の状態を確認する

本番データベースを操作するときは、対象を明示するため必ず `--remote` を付けます。`--local` はローカル開発用です。

```bash
npx wrangler d1 execute <database-name> \
  --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

`<database-name>` は `wrangler.jsonc` の `database_name`、または D1 binding 名に置き換えます。

本番データを変更する前に、Cloudflare ダッシュボードまたは D1 のエクスポート機能でバックアップを取得します。バックアップ方法や保持期間はプロジェクトの運用ポリシーに従ってください。

## 5. D1 migration を適用する

migration は、アプリケーションの新しいコードをデプロイする前に適用します。SQL ファイルが冪等であるか、適用済み migration を記録する仕組みがあるかを確認してください。

```bash
npx wrangler d1 execute <database-name> \
  --remote \
  --file migrations/<migration-file>.sql \
  --yes
```

複数の migration がある場合は、ファイル名やプロジェクトで定めた順序に従って、未適用のものを順番に実行します。migration の適用後は、追加されたテーブルやカラムを読み取り専用の SQL で確認します。

```bash
npx wrangler d1 execute <database-name> \
  --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

既存テーブルを変更する migration では、古い Worker でも新しいスキーマで動作できるよう、後方互換性を確認します。migration が失敗した場合は同じコマンドを無条件に再実行せず、エラー内容と現在のスキーマを確認してから対応します。

## 6. アプリケーションを検証する

デプロイ前に型チェックと本番ビルドを実行します。

```bash
npm run typecheck
npm run build
```

エラーが発生した場合は、解消するまでデプロイを進めません。フォントや外部リソース取得の警告が出る場合は、本番ビルド環境から必要な外部サービスへ接続できることも確認します。

## 7. Worker をデプロイする

プロジェクトで定義されたデプロイスクリプトを実行します。

```bash
npm run deploy
```

デプロイスクリプトがない場合は、ビルド後に Wrangler を実行します。

```bash
npm run build
npx wrangler deploy
```

`wrangler.jsonc` に定義された D1、R2 などの binding が、ソースコードで使用している binding 名と一致していることを確認します。

## 8. デプロイ後の確認

公開 URL に対して、少なくとも次を確認します。

- トップページが表示される
- 主要な一覧・詳細ページが表示される
- D1 のデータを読む機能が動作する
- R2 の画像・メディアが表示される
- 管理画面へログインできる
- ブラウザの開発者ツールと Worker のログにエラーがない

Worker のログを確認するには次を使います。

```bash
npx wrangler tail
```

## トラブル時の対応

デプロイ後に問題が発生した場合は、まず `wrangler tail` でエラーを確認し、直前のコード変更、migration、Secret、binding の変更を切り分けます。

- アプリケーションコードの問題は、修正したバージョンを再ビルドして再デプロイする
- Secret の問題は `wrangler secret list` で名前を確認し、必要なら再設定する
- D1 の問題は、現在のスキーマと migration の適用状況を確認する
- データを削除・変換する migration は、バックアップと復旧手順を確認してから実行する

D1 の migration は、すでに適用された SQL を手作業で逆順実行しないでください。ロールバック用 SQL が用意されていない場合は、バックアップからの復旧を含めた手順を検討します。

## 標準的な実行順

```text
npm ci
  ↓
Cloudflare 認証確認
  ↓
Secrets 確認・設定
  ↓
D1 バックアップと状態確認
  ↓
D1 migration 適用
  ↓
typecheck / build
  ↓
Worker デプロイ
  ↓
公開 URL・ログ・データの動作確認
```
