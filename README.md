# the-internet

個人サイト。EmDash（Astro + Cloudflare Workers）製。
Minitel / テレテキスト風の UI で、記事・ページ・タグ / カテゴリ・ギャラリーを表示する。

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
    TeletextLogo.astro     ピクセル文字のサイトロゴ
    TeletextGlobe.astro    地球のドット絵
    PostList.astro         番号付き記事一覧
  layouts/Base.astro      共通ヘッダー・ナビゲーション・誌面枠
  pages/                  ルーティング
  styles/teletext.css      配色・レイアウト・レスポンシブ対応
  utils/site-identity.ts  CMS のサイト名・タグライン
```

## メモ

- パッケージマネージャは npm（テンプレ由来の `pnpm-workspace.yaml` は未使用）
- Worker 名 / D1 / R2 の名前は `wrangler.jsonc` を参照
- `worker_loaders`（プラグインのサンドボックス実行）は Workers 有料プラン限定のため
  `wrangler.jsonc` でコメントアウト済み
- `EMDASH_ENCRYPTION_KEY` はローカルは `.env`、本番は `wrangler secret put` で設定する
- `src/` はタブ字下げ。`.prettierrc.json` とぶつかるので prettier はかけない

## デザインについて

公開デザインはアイボリー地に、コバルト・シアン・黄・緑・マゼンタの配色を使う。
画面上部には日本時間の日付と時刻、その下に青地・黄色文字のロゴ、全ページ共通の横型メニューを置く。
メニューの番号と見出し左端の細い線でセクションの色を示し、見出しの背景はアイボリーに統一する。
トップは左に最新記事と過去記事、右にギャラリーとAboutを配置する。最新記事を過去記事一覧に重複表示しない。
About以外の固定ページがある場合だけ、その一覧を記事・ギャラリーの下に表示する。カテゴリ欄は置かない。
画面幅が狭い場合は記事欄とギャラリー欄を縦一列にし、横型メニューは横スクロールで表示する。
下層ページは共通の誌面枠を使う。フッターには上部の罫線1本、ロゴ、カラーバーだけを置く。
旧デスクトップの音楽・テレビ・ソリティアは公開ページから取り外している。

`npm run test:e2e` で主要ページの表示・記事リンク・ギャラリー拡大・モバイル幅を確認できる。
開発サーバーを起動して実行する。

## クレジット

初期構成は [EmDash](https://github.com/emdash-cms/emdash) の
Cloudflare スターターテンプレート
（[emdash-cms/templates](https://github.com/emdash-cms/templates/tree/main/starter-cloudflare)）に由来する。
ドキュメントは [EmDash docs](https://github.com/emdash-cms/emdash/tree/main/docs) を参照。
