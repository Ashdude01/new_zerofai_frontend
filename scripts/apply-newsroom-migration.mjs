import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: ".env.local" });

const MIGRATION_NAME = "20260915_newsroom";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI });

const alterSql = `
  DO $$ BEGIN
    CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  CREATE TABLE IF NOT EXISTS "news" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "excerpt" varchar,
    "hero_image_id" integer,
    "content" jsonb,
    "published_at" timestamp(3) with time zone,
    "meta_title" varchar,
    "meta_description" varchar,
    "meta_image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_news_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_news_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_excerpt" varchar,
    "version_hero_image_id" integer,
    "version_content" jsonb,
    "version_published_at" timestamp(3) with time zone,
    "version_meta_title" varchar,
    "version_meta_description" varchar,
    "version_meta_image_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__news_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "newsroom_page" (
    "id" serial PRIMARY KEY NOT NULL,
    "hero_eyebrow" varchar,
    "hero_title" varchar,
    "hero_subtitle" varchar,
    "hero_image_id" integer,
    "hero_image_url" varchar,
    "meta_title" varchar,
    "meta_description" varchar,
    "meta_schema_json" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "news_id" integer;

  DO $$ BEGIN
    ALTER TABLE "news"
      ADD CONSTRAINT "news_hero_image_id_media_id_fk"
      FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
    ALTER TABLE "news"
      ADD CONSTRAINT "news_meta_image_id_media_id_fk"
      FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
    ALTER TABLE "_news_v"
      ADD CONSTRAINT "_news_v_parent_id_news_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
    ALTER TABLE "_news_v"
      ADD CONSTRAINT "_news_v_version_hero_image_id_media_id_fk"
      FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
    ALTER TABLE "_news_v"
      ADD CONSTRAINT "_news_v_version_meta_image_id_media_id_fk"
      FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
    ALTER TABLE "newsroom_page"
      ADD CONSTRAINT "newsroom_page_hero_image_id_media_id_fk"
      FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_news_fk"
      FOREIGN KEY ("news_id") REFERENCES "public"."news"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  CREATE UNIQUE INDEX IF NOT EXISTS "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "news_hero_image_idx" ON "news" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "news_meta_meta_image_idx" ON "news" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_news_v_version_version_hero_image_idx" ON "_news_v" USING btree ("version_hero_image_id");
  CREATE INDEX IF NOT EXISTS "_news_v_version_meta_version_meta_image_idx" ON "_news_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_news_v_autosave_idx" ON "_news_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_news_id_idx"
    ON "payload_locked_documents_rels" USING btree ("news_id");
`;

try {
  const pending = await pool.query(
    `SELECT 1 FROM "payload_migrations" WHERE name = $1 LIMIT 1`,
    [MIGRATION_NAME],
  );

  await pool.query(alterSql);

  if (pending.rowCount === 0) {
    const latestBatch = await pool.query(
      `SELECT COALESCE(MAX(batch), 0) AS batch FROM "payload_migrations"`,
    );
    const nextBatch = Number(latestBatch.rows[0]?.batch ?? 0) + 1;

    await pool.query(
      `INSERT INTO "payload_migrations" (name, batch, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())`,
      [MIGRATION_NAME, nextBatch],
    );

    console.log(`Applied "${MIGRATION_NAME}" (batch ${nextBatch}).`);
  } else {
    console.log(`"${MIGRATION_NAME}" schema ensured.`);
  }
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await pool.end();
}
