# the-internet

個人サイト。EmDash（Astro + Cloudflare Workers）製。
90 年代デスクトップ環境を思わせるレトロ UI で、記事・ページ・タグ / カテゴリを表示する。

```bash
npm install
npm run dev        # http://localhost:4321  管理画面: /_emdash/admin
npm run build
npm run typecheck
npm run deploy     # astro build && wrangler deploy
```

## 構成

| レイヤ         | 使っているもの                    |
| -------------- | --------------------------------- |
| フレームワーク | Astro + `@astrojs/cloudflare`     |
| CMS            | EmDash                            |
| ランタイム     | Cloudflare Workers                |
| データベース   | D1（binding: `DB`）               |
| メディア保存   | R2（binding: `MEDIA`）            |

## ルーティング

| ページ         | パス              |
| -------------- | ----------------- |
| トップ         | `/`               |
| 記事一覧       | `/posts`          |
| 記事           | `/posts/:slug`    |
| ページ一覧     | `/pages`          |
| 固定ページ     | `/:slug`          |
| カテゴリ別一覧 | `/category/:slug` |
| タグ別一覧     | `/tag/:slug`      |
| 404            | フォールバック    |

## ディレクトリ

```
src/
  components/
    Window.astro          ウィンドウ枠（タイトルバー / メニュー / ステータス）
    Taskbar.astro         下部タスクバーとスタートメニュー
    Icon.astro            16px ピクセルアイコン集（SVG インライン）
    desktop/              トップページに並べる飾り窓
  layouts/Base.astro      共通レイアウト。chrome="desktop" | "window" で切り替え
  pages/                  ルーティング
  scripts/desktop.ts      ウィンドウの開閉 / 最小化 / 前面化
  styles/win98.css        レトロ UI のデザインシステム
  utils/site-identity.ts  サイト名・タグライン・ブラウザ表示名
```

## メモ

- パッケージマネージャは npm（テンプレ由来の `pnpm-workspace.yaml` は未使用）
- Worker 名 / D1 / R2 の名前は `wrangler.jsonc` を参照
- `worker_loaders`（プラグインのサンドボックス実行）は Workers 有料プラン限定のため
  `wrangler.jsonc` でコメントアウト済み
- `EMDASH_ENCRYPTION_KEY` はローカルは `.env`、本番は `wrangler secret put` で設定する
- `src/` はタブ字下げ。`.prettierrc.json` とぶつかるので prettier はかけない

## デザインについて

UI は 90 年代のデスクトップ環境全般へのオマージュであり、
特定企業の製品・ロゴ・商標を模したものではない。
タイトルバーに出るブラウザ名は `src/utils/site-identity.ts` の
`BROWSER_NAME` で定義した架空の名前。

## クレジット

初期構成は [EmDash](https://github.com/emdash-cms/emdash) の
Cloudflare スターターテンプレート
（[emdash-cms/templates](https://github.com/emdash-cms/templates/tree/main/starter-cloudflare)）に由来する。
ドキュメントは [EmDash docs](https://github.com/emdash-cms/emdash/tree/main/docs) を参照。
