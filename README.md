# the-internet

EmDash (Astro + Cloudflare Workers) 製サイトの雛形。デザインは未着手。

```bash
npm install
npm run dev        # http://localhost:4321  管理画面: /_emdash/admin
npm run deploy     # astro build && wrangler deploy
```

- パッケージマネージャは npm（テンプレ由来の `pnpm-workspace.yaml` は未使用）
- Worker 名 / D1 / R2 の名前は `wrangler.jsonc` を参照
- `worker_loaders`（プラグインのサンドボックス実行）は Workers 有料プラン限定のため
  `wrangler.jsonc` でコメントアウト済み
- `EMDASH_ENCRYPTION_KEY` はローカルは `.env`、本番は `wrangler secret put` で設定する

---

## EmDash Starter Template (Cloudflare)

A general-purpose starting point for building sites with [EmDash](https://github.com/emdash-cms/emdash) on Cloudflare Workers. Includes posts, pages, categories, and tags with minimal styling -- designed as a base you can build on rather than a finished theme.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/emdash-cms/templates/tree/main/starter-cloudflare)

## What's Included

- Posts with category and tag archives
- Static pages via slug routing
- Seed data with demo content
- D1 database and R2 storage pre-configured
- Dark/light mode support

## Pages

| Page             | Route             |
| ---------------- | ----------------- |
| Homepage         | `/`               |
| All posts        | `/posts`          |
| Single post      | `/posts/:slug`    |
| Category archive | `/category/:slug` |
| Tag archive      | `/tag/:slug`      |
| Static pages     | `/:slug`          |
| 404              | fallback          |

## Infrastructure

- **Runtime:** Cloudflare Workers
- **Database:** D1
- **Storage:** R2
- **Framework:** Astro with `@astrojs/cloudflare`

## Local Development

```bash
pnpm install
pnpm bootstrap
pnpm dev
```

## Deploying

```bash
pnpm deploy
```

Or click the deploy button above to set up the project in your Cloudflare account.

## See Also

- [Node.js variant](../starter) -- same template using SQLite and local file storage
- [All templates](../)
- [EmDash documentation](https://github.com/emdash-cms/emdash/tree/main/docs)
