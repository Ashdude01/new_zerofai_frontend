import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { config as loadEnv } from "dotenv";
import path from "path";
import type { CollectionConfig } from "payload";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { Homepage } from "./src/globals/homepage";
import { SiteGlobals } from "./src/globals/site-content";
import { migrations } from "./src/migrations";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const storageBucket =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
  process.env.SUPABASE_STORAGE_BUCKET ||
  process.env.S3_BUCKET;

function buildSupabasePublicUrl(filename: string, prefix = "media"): string | null {
  if (!supabaseUrl || !storageBucket) return null;
  const objectPath = prefix ? `${prefix}/${filename}` : filename;
  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${objectPath}`;
}

function toSupabasePublicUrl(url: string): string {
  if (!supabaseUrl || !storageBucket) return url;
  if (url.includes("/storage/v1/object/public/")) return url;

  const s3Match = url.match(/\/storage\/v1\/s3\/([^/]+)\/(.+)$/);
  if (s3Match) {
    return `${supabaseUrl}/storage/v1/object/public/${s3Match[1]}/${s3Match[2]}`;
  }

  const objectAuthedMatch = url.match(/\/storage\/v1\/object\/(?:sign|authenticated)\/([^/]+)\/(.+)$/);
  if (objectAuthedMatch) {
    return `${supabaseUrl}/storage/v1/object/public/${objectAuthedMatch[1]}/${objectAuthedMatch[2]}`;
  }

  return url;
}

function resolveMediaPublicUrl({
  url,
  filename,
  prefix = "media",
}: {
  url?: string | null;
  filename?: string | null;
  prefix?: string | null;
}): string | null {
  if (url?.startsWith("http")) {
    return toSupabasePublicUrl(url);
  }

  if (url?.startsWith("/api/media/file/") && filename) {
    return buildSupabasePublicUrl(filename, prefix || "media");
  }

  if (filename) {
    return buildSupabasePublicUrl(filename, prefix || "media");
  }

  if (url?.startsWith("/")) {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "");
    return serverUrl ? `${serverUrl}${url}` : url;
  }

  return url ?? null;
}

const databaseUri = process.env.DATABASE_URI || "";
const connectionString =
  databaseUri.includes("pooler.supabase.com") && !databaseUri.includes("pgbouncer")
    ? `${databaseUri}${databaseUri.includes("?") ? "&" : "?"}pgbouncer=true`
    : databaseUri;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const s3Enabled = Boolean(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
const isNextBuild = process.env.npm_lifecycle_event === "build";

const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "name",
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["admin"],
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      required: true,
      saveToJWT: true,
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === "create" && data && !data.name && typeof data.email === "string") {
          data.name = data.email.split("@")[0];
        }
        if (operation === "create" && data && !data.roles?.length) {
          data.roles = ["admin"];
        }
        return data;
      },
    ],
  },
};

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "prefix",
      type: "text",
      defaultValue: "media",
    },
  ],
  upload: {
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 512, position: "centre" },
      { name: "tablet", width: 1024, height: undefined, position: "centre" },
      { name: "desktop", width: 1920, height: undefined, position: "centre" },
    ],
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (doc?.filename) {
          const publicUrl = resolveMediaPublicUrl({
            url: typeof doc.url === "string" ? doc.url : null,
            filename: doc.filename,
            prefix: typeof doc.prefix === "string" ? doc.prefix : "media",
          });
          if (publicUrl) doc.url = publicUrl;
        }
        return doc;
      },
    ],
  },
};

const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: "published" } };
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (value) return value;
            if (typeof siblingData?.title === "string") return slugify(siblingData.title);
            return value;
          },
        ],
      },
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "content",
      type: "richText",
      editor: articleEditor,
      required: true,
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "meta",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
  versions: {
    drafts: true,
  },
};

const News: CollectionConfig = {
  slug: "news",
  labels: {
    singular: "News",
    plural: "Newsroom",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: "Content",
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: "published" } };
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (value) return value;
            if (typeof siblingData?.title === "string") return slugify(siblingData.title);
            return value;
          },
        ],
      },
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Thumbnail / hero image",
    },
    {
      name: "content",
      type: "richText",
      editor: articleEditor,
      required: true,
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "meta",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
  versions: {
    drafts: true,
  },
};

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, "src/app/(payload)"),
    },
  },
  collections: [Users, Media, Posts, News],
  globals: [Homepage, ...SiteGlobals],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString,
    },
    migrationDir: path.resolve(dirname, "src/migrations"),
    prodMigrations: isNextBuild ? undefined : migrations,
    push: false,
  }),
  plugins: [
    ...(s3Enabled
      ? [
          s3Storage({
            acl: "public-read",
            bucket: process.env.S3_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || "",
            collections: {
              media: {
                prefix: "media",
                disablePayloadAccessControl: true,
                generateFileURL: ({ filename, prefix }) =>
                  buildSupabasePublicUrl(filename, prefix || "media") ?? "",
              },
            },
            config: {
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
              },
              region: process.env.S3_REGION || "ap-northeast-1",
              endpoint: process.env.S3_ENDPOINT,
            },
          }),
        ]
      : []),
  ],
  sharp,
});
