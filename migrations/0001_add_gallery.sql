-- EmDash 0.30: add the image-only gallery. Existing collections are untouched.

-- Apply once per environment; INSERT OR IGNORE makes repeated runs safe.

CREATE TABLE IF NOT EXISTS "ec_gallery" ("id" text primary key, "slug" text, "status" text default 'draft', "author_id" text, "primary_byline_id" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), "published_at" text, "scheduled_at" text, "deleted_at" text, "version" integer default 1, "live_revision_id" text references "revisions" ("id"), "draft_revision_id" text references "revisions" ("id"), "locale" text default 'en' not null, "translation_group" text, "image" text default '' not null, constraint "ec_gallery_slug_locale_unique" unique ("slug", "locale"));

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_slug"
			ON "ec_gallery" (slug)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_scheduled"
			ON "ec_gallery" (scheduled_at)
			WHERE scheduled_at IS NOT NULL
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_live_revision"
			ON "ec_gallery" (live_revision_id)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_draft_revision"
			ON "ec_gallery" (draft_revision_id)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_author"
			ON "ec_gallery" (author_id)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_primary_byline"
			ON "ec_gallery" (primary_byline_id)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_locale"
			ON "ec_gallery" (locale)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_translation_group"
			ON "ec_gallery" (translation_group)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_deleted_updated_id"
			ON "ec_gallery" (deleted_at, updated_at DESC, id DESC)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_deleted_status"
			ON "ec_gallery" (deleted_at, status)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_deleted_created_id"
			ON "ec_gallery" (deleted_at, created_at DESC, id DESC)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_deleted_published_id"
			ON "ec_gallery" (deleted_at, published_at DESC, id DESC)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_loc_upd"
			ON "ec_gallery" (deleted_at, locale, updated_at DESC, id DESC)
		;

CREATE INDEX IF NOT EXISTS "idx_ec_gallery_loc_crt"
			ON "ec_gallery" (deleted_at, locale, created_at DESC, id DESC)
		;

INSERT OR IGNORE INTO "_emdash_collections" ("id", "slug", "label", "label_singular", "description", "icon", "supports", "source", "created_at", "updated_at", "search_config", "has_seo", "url_pattern", "comments_enabled", "comments_moderation", "comments_closed_after_days", "comments_auto_approve_users") VALUES ('01M1RKAFE81792AN8X5MZNPDQ3', 'gallery', 'ギャラリー', 'ドット絵', NULL, NULL, '["drafts","revisions"]', 'seed', '2026-09-05 10:55:09', '2026-09-05 10:55:09', NULL, 0, NULL, 0, 'first_time', 90, 1);

INSERT OR IGNORE INTO "_emdash_fields" ("id", "collection_id", "slug", "label", "type", "column_type", "required", "unique", "default_value", "validation", "widget", "options", "sort_order", "created_at", "searchable", "translatable") VALUES ('01M1RKAFE9GQY8TH84XEA01NAS', '01M1RKAFE81792AN8X5MZNPDQ3', 'image', '画像', 'image', 'TEXT', 1, 0, NULL, NULL, NULL, NULL, 0, '2026-09-05 10:55:09', 0, 1);

INSERT OR IGNORE INTO "revisions" ("id", "collection", "entry_id", "data", "author_id", "created_at") VALUES ('01M1RKAFH64FDNB19T7EYTFKPQ', 'gallery', '01M1RKAFH2QYNZYZM9VR6RM9JT', '{"image":{"id":"gallery-sunset","src":"https://assets.internet.tanka.cc/gallery/sunset.svg","alt":"夕暮れの海沿いを走る車のドット絵","width":280,"height":220}}', NULL, '2026-09-05 10:55:09');

INSERT OR IGNORE INTO "revisions" ("id", "collection", "entry_id", "data", "author_id", "created_at") VALUES ('01M1RKAFHBJ104K67Z81Q2T3K8', 'gallery', '01M1RKAFHAPBYJXK5E09VW1KBV', '{"image":{"id":"gallery-hills","src":"https://assets.internet.tanka.cc/gallery/hills.png","alt":"青空と白い雲、緑の丘のドット絵","width":1920,"height":1080}}', NULL, '2026-09-05 10:55:09');

INSERT OR IGNORE INTO "ec_gallery" ("id", "slug", "status", "author_id", "primary_byline_id", "created_at", "updated_at", "published_at", "scheduled_at", "deleted_at", "version", "live_revision_id", "draft_revision_id", "locale", "translation_group", "image") VALUES ('01M1RKAFH2QYNZYZM9VR6RM9JT', 'sunset', 'published', NULL, NULL, '2026-09-05T10:55:09.858Z', '2026-09-05T10:55:09.862Z', '2026-09-05T10:55:09.857Z', NULL, NULL, 1, '01M1RKAFH64FDNB19T7EYTFKPQ', NULL, 'en', '01M1RKAFH2QYNZYZM9VR6RM9JT', '{"id":"gallery-sunset","src":"https://assets.internet.tanka.cc/gallery/sunset.svg","alt":"夕暮れの海沿いを走る車のドット絵","width":280,"height":220}');

INSERT OR IGNORE INTO "ec_gallery" ("id", "slug", "status", "author_id", "primary_byline_id", "created_at", "updated_at", "published_at", "scheduled_at", "deleted_at", "version", "live_revision_id", "draft_revision_id", "locale", "translation_group", "image") VALUES ('01M1RKAFHAPBYJXK5E09VW1KBV', 'hills', 'published', NULL, NULL, '2026-09-05T10:55:09.867Z', '2026-09-05T10:55:09.867Z', '2026-09-05T10:55:09.866Z', NULL, NULL, 1, '01M1RKAFHBJ104K67Z81Q2T3K8', NULL, 'en', '01M1RKAFHAPBYJXK5E09VW1KBV', '{"id":"gallery-hills","src":"https://assets.internet.tanka.cc/gallery/hills.png","alt":"青空と白い雲、緑の丘のドット絵","width":1920,"height":1080}');
